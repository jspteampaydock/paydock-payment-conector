import {
    createSetCustomFieldAction,
    createAddTransactionActionByResponse,
    getPaymentKeyUpdateAction,
} from './payment-utils.js'
import c from '../config/constants.js'
import {makePayment} from '../service/web-component-service.js'

async function execute(paymentObject) {
    const makePaymentRequestObj = JSON.parse(
        paymentObject.custom.fields.makePaymentRequest,
    )
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
    const commerceToolsUserId = requestBodyJson?.CommerceToolsUserId;
    const additionalInfo = requestBodyJson?.AdditionalInfo;

    if (paymentMethod) {
        actions.push(createSetCustomFieldAction(c.CTP_CUSTOM_FIELD_PAYDOCK_PAYMENT_TYPE, paymentMethod));
    }
    actions.push(createSetCustomFieldAction(c.CTP_CUSTOM_FIELD_PAYDOCK_PAYMENT_STATUS, response.paydockStatus));

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

    if (addTransactionAction){
        actions.push(addTransactionAction)
    }

    return {
        actions,
    }
}

export default {execute}
