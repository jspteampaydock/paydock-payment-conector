import {
    createSetCustomFieldAction,
    createAddTransactionActionByResponse,
    getPaymentKeyUpdateAction, deleteCustomFieldAction,
} from './payment-utils.js'
import c from '../config/constants.js'
import {makePayment} from '../service/web-component-service.js'

async function execute(paymentObject) {
    const makePaymentRequestObj = JSON.parse(
        paymentObject.custom.fields.makePaymentRequest,
    )

    if (paymentObject.amountPlanned.type === 'centPrecision') {
        const fraction = 10 ** paymentObject.amountPlanned.fractionDigits;
        makePaymentRequestObj.amount.value = paymentObject.amountPlanned.centAmount / fraction;
    }

    const response = await makePayment(makePaymentRequestObj)
    if (response.status === 'Failure') {
        return {
            "actions": [
                {
                    "action": "changeTransactionState",
                    "transactionId": makePaymentRequestObj.transactionId,
                    "state": "Failure"
                }
            ]
        };
    }

    const actions = []
    const requestBodyJson = JSON.parse(paymentObject?.custom?.fields?.makePaymentRequest);

    const paymentMethod = requestBodyJson?.PaydockPaymentType;
    const paydockTransactionId = response?.chargeId ?? requestBodyJson?.PaydockTransactionId;
    const paydockStatus = response?.paydockStatus ?? requestBodyJson?.PaydockPaymentStatus;
    const commerceToolsUserId = requestBodyJson?.CommerceToolsUserId;
    const additionalInfo = requestBodyJson?.AdditionalInfo;

    if (paymentMethod) {
        actions.push(createSetCustomFieldAction(c.CTP_CUSTOM_FIELD_PAYDOCK_PAYMENT_TYPE, paymentMethod));
    }
    if(paydockStatus) {
        actions.push(createSetCustomFieldAction(c.CTP_CUSTOM_FIELD_PAYDOCK_PAYMENT_STATUS, paydockStatus));
    }
    if (paydockTransactionId) {
        actions.push(createSetCustomFieldAction(c.CTP_CUSTOM_FIELD_PAYDOCK_TRANSACTION_ID, paydockTransactionId));
    }

    if (commerceToolsUserId) {
        actions.push(createSetCustomFieldAction(c.CTP_CUSTOM_FIELD_COMMERCE_TOOLS_USER, commerceToolsUserId));
    }

    if (additionalInfo) {
        actions.push(createSetCustomFieldAction(c.CTP_CUSTOM_FIELD_ADDITIONAL_INFORMATION, JSON.stringify(additionalInfo)));
    }
    const updatePaymentAction = getPaymentKeyUpdateAction(
        paymentObject.key,
        {body: paymentObject.custom.fields.makePaymentRequest},
        response,
    )
    if (updatePaymentAction) actions.push(updatePaymentAction)

    const addTransactionAction = createAddTransactionActionByResponse(
        paymentObject.amountPlanned.centAmount,
        paymentObject.amountPlanned.currencyCode,
        response,
    )

    if (addTransactionAction) {
        actions.push(addTransactionAction)
    }

    const customFields = paymentObject?.custom?.fields;
    if (customFields) {
        const customFieldsToDelete = [
            'makePaymentRequest',
            'getVaultTokenRequest',
            'getVaultTokenResponse',
            'PaymentExtensionRequest',
            'PaymentExtensionResponse'
        ];

        customFieldsToDelete.forEach(field => {
            if (typeof customFields[field] !== 'undefined' && customFields[field]) {
                actions.push(deleteCustomFieldAction(field));
            }
        });
    }

    return {
        actions
    }
}

export default {execute}
