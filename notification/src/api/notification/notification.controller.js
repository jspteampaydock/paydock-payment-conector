import utils from '../../utils/commons.js'
import { isRecoverableError, getErrorCause } from '../../utils/error-utils.js'
import notificationHandler from '../../handler/notification/notification.handler.js'
import { getLogger } from '../../utils/logger.js'

const logger = getLogger()

async function handleNotification(request, response) {
  if (request.method !== 'POST') {
    logger.debug(
      `Received non-POST request: ${request.method}. The request will not be processed...`,
    )
    return utils.sendResponse(response)
  }
  try {
    const notificationResponse = await utils.getNotificationFromRequest(request);
    await notificationHandler.processNotification(notificationResponse)
    return sendAcceptedResponse(response)
  } catch (err) {
    const cause = getErrorCause(err)
    logger.error(
      {
        cause
      },
      'Unexpected exception occurred.',
    )
    if (isRecoverableError(err)) {
      return utils.sendResponse(response, 500)
    }
    return sendAcceptedResponse(response)
  }
}

function sendAcceptedResponse(response) {
  return utils.sendResponse(
    response,
    200,
    { 'Content-Type': 'application/json' },
    JSON.stringify({ notificationResponse: '[accepted]' }),
  )
}

export { handleNotification }
