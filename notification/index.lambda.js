import { getLogger } from './src/utils/logger.js'
const logger = getLogger()

export const handler = async (event) => {
  // Reason for this check: if AWS API Gateway is used then event.body is provided as a string payload.
  const body = event.body ? JSON.parse(event.body) : event
  const { notificationItems } = body
  if (!notificationItems) {
    const error = new Error('No notification received.')
    logger.error(
      {
        notification: undefined,
        err: error,
      },
      'Unexpected error when processing event',
    )
    throw error
  }


  return {
    notificationResponse: '[accepted]',
  }
}
