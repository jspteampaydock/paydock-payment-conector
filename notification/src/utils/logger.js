import bunyan from 'bunyan'
import config from '../config/config.js'

const {logLevel} = config.getModuleConfig()

let obj

function getLogger() {
    if (obj === undefined) {
        const NOTIFICATION_MODULE_NAME = 'ctp-paydock-integration-notifications'
        obj = bunyan.createLogger({
            name: NOTIFICATION_MODULE_NAME,
            stream: process.stdout,
            level: logLevel || bunyan.INFO,
            serializers: {
                err: bunyan.stdSerializers.err,
                cause: bunyan.stdSerializers.err,
            },
        })
    }
    return obj
}

async function addPaydockHttpLog(data) {
    const logKey = `paydock-notification-http_${Date.now()}`;

    const logObject = {
        container: "paydock-notification-http-logs",
        key: logKey,
        value: data
    };
    const ctpClient = await config.getCtpClient()
    ctpClient.create(
        ctpClient.builder.customObjects,
        JSON.stringify(logObject)
    )
}

async function addPaydockLog(data) {
    const logKey = `paydock-log_${Date.now()}`;
    const logObject = {
        container: "paydock-logs",
        key: logKey,
        value: data
    };

    const ctpClient = await config.getCtpClient()
    await ctpClient.create(
        ctpClient.builder.customObjects,
        JSON.stringify(logObject)
    )
}

export {getLogger, addPaydockLog, addPaydockHttpLog}
