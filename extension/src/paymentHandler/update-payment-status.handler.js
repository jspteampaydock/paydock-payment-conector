import {
    createSetCustomFieldAction
} from './payment-utils.js'
import c from '../config/constants.js'
import {updatePaydockStatus} from "../service/web-component-service.js";
import httpUtils from "../utils.js";

async function execute(paymentObject) {
    const paymentExtensionRequest = JSON.parse(
        paymentObject?.custom?.fields?.PaymentExtensionRequest
    )
    const actions = []
    const requestBodyJson = paymentExtensionRequest.request;
    const newStatus = requestBodyJson.newStatus;
    const oldStatus = paymentObject.custom.fields.PaydockPaymentStatus;
    let chargeId = paymentObject.custom.fields?.PaydockTransactionId;
    let error = null;
    let responseAPI;
    let refundedAmount = 0;
    try {
        switch (newStatus) {
            case c.STATUS_TYPES.PAID:
                if (oldStatus === c.STATUS_TYPES.AUTHORIZE) {
                    responseAPI = await updatePaydockStatus(`/v1/charges/${chargeId}/capture`, 'post', {});
                }
                break;
            case c.STATUS_TYPES.CANCELLED:
                if (oldStatus === c.STATUS_TYPES.AUTHORIZE || oldStatus === c.STATUS_TYPES.PAID) {
                    responseAPI = await updatePaydockStatus(`/v1/charges/${chargeId}/capture`, 'post', {});
                }
                break;
            case c.STATUS_TYPES.REFUNDED:
            case c.STATUS_TYPES.P_REFUND:
                if (oldStatus === c.STATUS_TYPES.P_REFUND || oldStatus === c.STATUS_TYPES.PAID) {
                    const oldRefundedAmount = paymentObject?.custom?.fields?.RefundedAmount || 0;
                    refundedAmount = oldRefundedAmount + requestBodyJson.refundAmount;
                    responseAPI = await updatePaydockStatus(`/v1/charges/${chargeId}/refunds`, 'post', {
                        amount: requestBodyJson.refundAmount,
                        from_webhook: true
                    });
                }
                break;
            default:
                throw new Error(`Unsupported status change from ${oldStatus} to ${newStatus}`);
        }
    } catch (err) {
        console.error('Error handling status change:', err);
        return {actions: [], error: err.message};
    }

    let message = `Change status from '${oldStatus}' to '${newStatus}'`;
    if (responseAPI) {
        if (responseAPI.status === "Success") {
            if (responseAPI.chargeId && responseAPI.chargeId !== chargeId) {
                chargeId = responseAPI.chargeId;
                actions.push(createSetCustomFieldAction(c.CTP_CUSTOM_FIELD_PAYDOCK_TRANSACTION_ID, chargeId))
            }
            actions.push(createSetCustomFieldAction(c.CTP_CUSTOM_FIELD_PAYDOCK_PAYMENT_STATUS, newStatus))
            if (refundedAmount) {
                actions.push(createSetCustomFieldAction(c.CTP_CUSTOM_FIELD_REFUNDED_AMOUNT, refundedAmount))
            }
        } else {
            error = `Incorrect operation: ${message}`;
            message = error;
        }
    } else {
        actions.push(createSetCustomFieldAction(c.CTP_CUSTOM_FIELD_PAYDOCK_PAYMENT_STATUS, newStatus))
    }


    const response = error ? {status: false, message: error} : {status: true};
    const responseStatus = response.status ? "Success" : "Failed"
    if (response.status && refundedAmount) {
        response.message = "Merchant refunded money"
        message = `Refunded ${requestBodyJson.refundAmount}`
    }
    await httpUtils.addPaydockLog({
        paydockChargeID: chargeId,
        operation: newStatus,
        responseStatus,
        message
    })
    actions.push(createSetCustomFieldAction(c.CTP_INTERACTION_PAYMENT_EXTENSION_RESPONSE, response));
    return {
        actions,
    }
}

export default {execute}
