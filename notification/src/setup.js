import config from './config/config.js'
import apiAdaptor from './utils/api-adaptor.js'
import commons from './utils/commons.js'

async function setupNotificationResources() {
  const registeredEvents = await fetchRegisteredEvents()
  const paydockEvents = await commons.readAndParseJsonFile('resources/paydock-events.json')
  const notificationUrl = config.getNotificationUrl()
  const notificationsToRegister = paydockEvents.filter(event => !registeredEvents.includes(event.event))
    .map(event => ({
      ...event,
      destination: notificationUrl
    }))
  await Promise.all(notificationsToRegister.map(event =>
    apiAdaptor.callPaydock('/v1/notifications', event, 'POST')
  ))
}

async function fetchRegisteredEvents() {
  const notificationUrl = config.getNotificationUrl()
  const allNotifications = await apiAdaptor.callPaydock('/v1/notifications', null, 'GET')
  return allNotifications
    .filter(notification => notification.destination === notificationUrl)
    .map(notification => notification.event)
}

export {
  setupNotificationResources,
  fetchRegisteredEvents // renamed for clarity
}