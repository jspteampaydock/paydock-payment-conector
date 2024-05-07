import {withPayment} from '../validator/validator-builder.js'
import makePaymentHandler from './make-payment.handler.js'
import getVaultTokenHandler from './get-vault-token.handler.js'
import getPaymentMethodsHandler from './get-payment-methods.handler.js'
import updatePaymentStatusHandler from './update-payment-status.handler.js'
import makePreChargeHandler from './make-pre-chrage.handler.js'
import getStandaloneTokenHandler from './get-standalone-3ds-token.handler.js'

import c from "../config/constants.js";
import {
    deleteCustomFieldAction
} from './payment-utils.js'
import {isBasicAuthEnabled} from '../validator/authentication.js'
import errorMessages from '../validator/error-messages.js'

async function handlePayment(paymentObject, authToken) {
    if (isBasicAuthEnabled() && !authToken) {
        return {
            errors: [
                {
                    code: 'Unauthorized',
                    message: errorMessages.UNAUTHORIZED_REQUEST,
                },
            ],
        }
    }

    const validatePaymentErrors = _validatePaymentRequest(
        paymentObject,
        authToken,
    )
    if (validatePaymentErrors)
        return {
            errors: validatePaymentErrors,
        }

    const handlers = _getPaymentHandlers(paymentObject)
    if (!handlers) {
        return {actions: []}
    }
    const handlerResponses = await Promise.all(
        handlers.map((handler) => handler.execute(paymentObject)),
    )
    const handlerResponse = {
        actions: handlerResponses.flatMap((result) => result.actions),
    }
    return {actions: handlerResponse.actions}
}


async function handlePaymentByExtRequest(paymentObject, authToken) {

    const validatePaymentErrors = _validatePaymentRequest(
        paymentObject,
        authToken,
    )
    if (validatePaymentErrors)
        return {
            errors: validatePaymentErrors,
        }

    const paymentExtensionRequest = paymentObject?.custom?.fields?.PaymentExtensionRequest ?? null;

    const objPaymentExtensionRequest = JSON.parse(paymentExtensionRequest);
    const actionExtension = objPaymentExtensionRequest.action ?? null;
    const handlers = [];
    if (!actionExtension || actionExtension === 'FromNotification') return null
    switch (actionExtension) {
        case  c.CTP_CUSTOM_FIELD_GET_PAYMENT_METHODS_REQUEST:
            handlers.push(getPaymentMethodsHandler)
            break;
        case  c.CTP_INTERACTION_TYPE_GET_VAULT_TOKEN:
            handlers.push(getVaultTokenHandler)
            break;
        case c.CTP_INTERACTION_TYPE_MAKE_PAYMENT:
            handlers.push(makePaymentHandler)
            break;
        case c.CTP_CUSTOM_GET_UPDATE_STATUS:
            handlers.push(updatePaymentStatusHandler)
            break;
        case c.CTP_CUSTOM_FIELD_MAKE_PRE_CHARGE_RESPONSE:
            handlers.push(makePreChargeHandler)
            break;
        default:
            break;
    }
    if (!handlers) return null

    const handlerResponses = await Promise.all(
        handlers.map((handler) => handler.execute(paymentObject)),
    )

    const version = handlerResponses.find((result) => result.version !== null)
    const actions = handlerResponses.flatMap((result) => result.actions)
    actions.push(deleteCustomFieldAction(c.CTP_INTERACTION_PAYMENT_EXTENSION_REQUEST))
    if (version) {
        return {
            actions,
            version: version.version
        }
    }
    return {actions}
}

function _getPaymentHandlers(paymentObject) {

    // custom field on payment is not a mandatory field.
    if (!paymentObject.custom) return []

    const handlers = []
    const customFields = paymentObject.custom.fields


    if (customFields.makePaymentRequest && !customFields.makePaymentResponse) {
        handlers.push(makePaymentHandler)
    }

    if (customFields.getVaultTokenRequest && !customFields.getVaultTokenResponse) {
        handlers.push(getVaultTokenHandler)
    }

    if (customFields.getStandalone3dsTokenRequest && !customFields.getStandalone3dsTokenResponse) {
        handlers.push(getStandaloneTokenHandler)
    }

    return handlers
}


function _validatePaymentRequest(paymentObject, authToken) {
    const paymentValidator = withPayment(paymentObject)
    if (!isBasicAuthEnabled()) {
        paymentValidator
            .validateMetadataFields()
        if (paymentValidator.hasErrors()) return paymentValidator.getErrors()
    } else {
        paymentValidator.validateMetadataFields()
        if (paymentValidator.hasErrors()) return paymentValidator.getErrors()

        paymentValidator.validateAuthorizationHeader(authToken)
        if (paymentValidator.hasErrors()) return paymentValidator.getErrors()

        if (paymentValidator.hasErrors()) return paymentValidator.getErrors()
    }
    return null
}


export default {handlePayment, handlePaymentByExtRequest}
