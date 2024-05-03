function handleSuccessResponse(context) {
  context.res = {
    status: 200,
    body: {
      notificationResponse: '[accepted]',
    },
  }
}

function handleErrorResponse(context, status, errorMessage) {
  context.res = {
    status,
    body: {
      error: errorMessage,
    },
  }
}

export const azureNotificationTrigger = async function (context, req) {
  const { notificationItems } = req?.body || {}
  if (!notificationItems) {
    handleErrorResponse(context, 400, 'No notification received.')
    return
  }

  handleSuccessResponse(context)
}
