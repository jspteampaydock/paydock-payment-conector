import { handleNotification } from './api/notification/notification.controller.js'

const routes = {
  '/': handleNotification,
  '/notifications': handleNotification
}

export { routes }
