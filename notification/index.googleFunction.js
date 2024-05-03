export const notificationTrigger = async (request, response) => {
  const { notificationItems } = request.body
  if (!notificationItems) {
    return response.status(400).send('No notification received.')
  }


  return response.status(200).send({
    notificationResponse: '[accepted]',
  })
}
