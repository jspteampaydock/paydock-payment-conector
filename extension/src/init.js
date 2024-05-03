import { setupServer } from './server.js'
import utils from './utils.js'
import config from './config/config.js'

const port = config.getModuleConfig().port || 8082

const server = setupServer()
const logger = utils.getLogger()

if (config.getModuleConfig().keepAliveTimeout !== undefined)
  server.keepAliveTimeout = config.getModuleConfig().keepAliveTimeout
server.listen(port, async () => {
  logger.info(`Extension module is re running at http://0.0.0.0:${port}`)
})
