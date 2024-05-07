import c from '../config/constants.js'

function createSetCustomFieldAction(name, response) {
    if(typeof response === 'object'){
        response = JSON.stringify(response);
    }
    return {
        action: 'setCustomField',
        name,
        value: response,
    }
}

function deleteCustomFieldAction(name) {
    return {
        action: 'setCustomField',
        name,
        value: null
    }
}



function getPaydockStatus(paymentMethod, responseBodyJson) {
    let paydockStatus =  c.STATUS_TYPES.PENDING;
    switch (paymentMethod) {
        case 'bank_account':
            paydockStatus = responseBodyJson.status === 'requested' ? c.STATUS_TYPES.REQUESTED : c.STATUS_TYPES.FAILED;
            break;
        case 'cart':
            if (responseBodyJson.status === 'complete') {
                paydockStatus = responseBodyJson.capture ? c.STATUS_TYPES.PAID : c.STATUS_TYPES.AUTHORIZE;
            } else {
                paydockStatus = c.STATUS_TYPES.FAILED;
            }
            break;
        default:
            paydockStatus = c.STATUS_TYPES.PENDING;
    }
    return paydockStatus
}


function isValidJSON(jsonString) {
    if (typeof jsonString === 'undefined') return true
    try {
        const o = JSON.parse(jsonString)
        if (o && typeof o === 'object') return true
    } catch (e) {
        // continue regardless of error
    }
    return false
}

function isValidMetadata(str) {
    if (!str) return false
    return str.indexOf(' ') < 0
}

function getPaymentKeyUpdateAction(paymentKey, request, response) {
    const requestBodyJson = JSON.parse(request.body)
    const reference = requestBodyJson.reference?.toString()
    const pspReference = response.pspReference?.toString()
    const newReference = pspReference || reference
    let paymentKeyUpdateAction
    // ensure the key and new reference is different, otherwise the error with
    // 'code': 'InvalidOperation', 'message': ''key' has no changes.' will return by commercetools API.
    if (newReference !== paymentKey) {
        paymentKeyUpdateAction = {
            action: 'setKey',
            key: newReference,
        }
    }
    return paymentKeyUpdateAction
}


function createChangeTransactionInteractionId(transactionId, interactionId) {
    return {
        action: 'changeTransactionInteractionId',
        transactionId,
        interactionId,
    }
}

function createAddTransactionAction({
                                        type,
                                        state,
                                        amount,
                                        currency,
                                        interactionId,
                                        custom,
                                    }) {
    return {
        action: 'addTransaction',
        transaction: {
            type,
            amount: {
                currencyCode: currency,
                centAmount: amount,
            },
            state,
            interactionId,
            custom,
        },
    }
}

function createAddTransactionActionByResponse(amount, currencyCode, response) {
    // eslint-disable-next-line default-case
    switch (response.resultCode) {
        case 'Authorised':
            return createAddTransactionAction({
                type: 'Authorization',
                state: 'Success',
                amount,
                currency: currencyCode,
                interactionId: response.pspReference,
            })
        case 'Refused':
        case 'Error':
            return createAddTransactionAction({
                type: 'Authorization',
                state: 'Failure',
                amount,
                currency: currencyCode,
                interactionId: response.pspReference,
            })
    }
    return null
}

export {
    createSetCustomFieldAction,
    isValidJSON,
    isValidMetadata,
    getPaymentKeyUpdateAction,
    getPaydockStatus,
    createChangeTransactionInteractionId,
    createAddTransactionActionByResponse,
    deleteCustomFieldAction
}
