import {
    createSetCustomFieldAction
} from './payment-utils.js'
import c from '../config/constants.js'
import {getVaultToken} from '../service/web-component-service.js'

async function execute(paymentObject) {
    const getVaultTokenRequestObj = JSON.parse(
        paymentObject.custom.fields.getVaultTokenRequest,
    )

    const requestBodyJson = JSON.parse(paymentObject?.custom?.fields?.getVaultTokenRequest);
    const response = await getVaultToken(requestBodyJson)
    if (response.status === 'Failure') {
        return {
            actions: [
                {
                    action: "getVaultToken",
                    transactionId: getVaultTokenRequestObj.transactionId,
                    state: "Failure"
                }
            ]
        };
    }

    const actions = []

    actions.push(createSetCustomFieldAction(c.CTP_CUSTOM_FIELD_GET_VAULT_TOKEN_RESPONSE, response));
    return {
        actions,
    }
}

export default {execute}
