import config from './config/config.js'
import ctpClientBuilder from './ctp.js'
import utils from './utils.js'
import { ensureResources } from './config/init/ensure-resources.js'
import { generateBasicAuthorizationHeaderValue } from './validator/authentication.js'

const logger = utils.getLogger()

async function setupExtensionResources(apiExtensionBaseUrl) {
  const moduleConfig = config.getModuleConfig()
  const ctpConfig = config.getExtensionConfig()
  const ctpClient = await ctpClientBuilder.get(ctpConfig)
  await Promise.all(
      await ensureResources(
          ctpClient,
          ctpConfig.projectKey,
          apiExtensionBaseUrl || moduleConfig.apiExtensionBaseUrl,
          generateBasicAuthorizationHeaderValue(ctpConfig.projectKey),
      )
  )

  logger.info(
    `Configured commercetools project keys are: ${JSON.stringify(
        ctpConfig,
    )}. ` ,
  )
}

export { setupExtensionResources }
