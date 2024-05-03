import VError from 'verror'


function isRecoverableError(err) {
  const cause = getErrorCause(err)
  const statusCode = cause?.statusCode
  return (
    statusCode !== null &&
    (statusCode < 200 || statusCode === 409 || statusCode >= 500)
  )
}

function getErrorCause(err) {
  if (err instanceof VError) return err.cause()

  return err
}

export { isRecoverableError, getErrorCause }
