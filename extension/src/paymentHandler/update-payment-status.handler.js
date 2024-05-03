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

    if (oldStatus === "paydock-authorize" && newStatus === "paydock-paid") {
        responseAPI = await updatePaydockStatus(`/v1/charges/${chargeId}/capture`, 'post', {});
    }
    if ((oldStatus === "paydock-authorize" && newStatus === "paydock-cancelled") ||
        (oldStatus === "paydock-paid" && newStatus === "paydock-cancelled")) {
        responseAPI = await updatePaydockStatus(`/v1/charges/${chargeId}/capture`, 'delete', {});
    }
    if ((oldStatus === "paydock-paid" && newStatus === "paydock-refunded")
        || (oldStatus === "paydock-p-refund" && newStatus === "paydock-refunded")
        || (oldStatus === "paydock-paid" && newStatus === "paydock-p-refund")
        || (oldStatus === "paydock-p-refund" && newStatus === "paydock-p-refund")) {
        let oldRefundedAmount = paymentObject?.custom?.fields?.RefundedAmount;
        oldRefundedAmount = oldRefundedAmount ?? 0;
        const refunded = requestBodyJson.refundAmount;
        refundedAmount = oldRefundedAmount + refunded;
        responseAPI = await updatePaydockStatus(`/v1/charges/${chargeId}/refunds`, 'post', {
            amount: refunded,
            from_webhook: true
        });
    }
    let message = `Change status from '${oldStatus}' to '${newStatus}'`;
    if (responseAPI) {
        if (responseAPI.status === "Success") {
            if (responseAPI.chargeId !== chargeId) {
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
    await httpUtils.addPaydockLog({
        paydockChargeID: chargeId,
        operation: newStatus,
        newStatus,
        message
    })
    const response = error ? {status: false, message: error} : {status: true};
    actions.push(createSetCustomFieldAction(c.CTP_INTERACTION_PAYMENT_EXTENSION_RESPONSE, response));
    return {
        actions,
    }
}

export default {execute}
