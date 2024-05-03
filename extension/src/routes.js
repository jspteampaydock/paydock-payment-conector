import paymentController from './api/payment/payment.controller.js'

const routes = {
  '/': paymentController.processRequest,
}

export { routes }
