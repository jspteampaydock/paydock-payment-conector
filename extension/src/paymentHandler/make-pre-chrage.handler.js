import {createPreCharge} from '../service/web-component-service.js';
import {createSetCustomFieldAction} from "./payment-utils.js";
import c from "../config/constants.js";

async function execute(paymentObject) {
    const request = JSON.parse(paymentObject.custom.fields.PaymentExtensionRequest)

    const response = await createPreCharge(request.request.data, request.request.capture);

    if (response.status === 'Failure') {
        return {
            actions: [
                {
                    action: c.CTP_INTERACTION_PAYMENT_EXTENSION_REQUEST,
                    transactionId: request.transactionId,
                    state: "Failure"
                }
            ]
        };
    }

    const actions = []

    actions.push(createSetCustomFieldAction(c.CTP_INTERACTION_PAYMENT_EXTENSION_RESPONSE, response));

    return {
        actions,
        version: paymentObject.version
    }
}

export default {execute}
