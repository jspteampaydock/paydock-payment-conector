// import rc from 'rc'
import {config} from "dotenv";

function loadConfig() {
  config();
  if (process.env.PAYDOCK_INTEGRATION_CONFIG) {
    return loadFromPaydockIntegrationEnvVar()
  }
  return {}
  // return loadFromExternalFile()
}

function loadFromPaydockIntegrationEnvVar() {
  try {
    return JSON.parse(process.env.PAYDOCK_INTEGRATION_CONFIG)
  } catch (e) {
    throw new Error(
      'Paydock integration configuration is not provided in the JSON format',
    )
  }
}

/* function loadFromExternalFile() {
  const appName = 'extension'
  const configFromExternalFile = rc(appName)
  const hasConfig = configFromExternalFile?.configs?.length > 0
  if (!hasConfig) {
    throw new Error('Paydock integration configuration is not provided.')
  }
  return configFromExternalFile
} */

export { loadConfig }
