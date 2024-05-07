import {
    createSetCustomFieldAction
} from './payment-utils.js'
import c from '../config/constants.js'
import {createStandalone3dsToken} from '../service/web-component-service.js'

async function execute(paymentObject) {
    const getStandalone3dsTokenRequestObj = JSON.parse(
        paymentObject.custom.fields.getStandalone3dsTokenRequest,
    )
    const requestBodyJson = JSON.parse(paymentObject?.custom?.fields?.getStandalone3dsTokenRequest);
    const response = await createStandalone3dsToken(requestBodyJson)
    if (response.status === 'Failure') {
        return {
            actions: [
                {
                    action: "getStandalone3dsToken",
                    transactionId: getStandalone3dsTokenRequestObj.transactionId,
                    state: "Failure"
                }
            ]
        };
    }

    const actions = []

    actions.push(createSetCustomFieldAction(c.CTP_CUSTOM_FIELD_GET_STANDALONE_3DS_TOKEN_RESPONSE, response));
    return {
        actions,
    }
}

export default {execute}
