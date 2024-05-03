import config from '../config/config.js'

const container = "paydock-storage";
async function setItem(key, value) {
    const customObject = {
        container,
        key,
        value
    };

    const ctpClient = await config.getCtpClient()
    await ctpClient.create(
        ctpClient.builder.customObjects,
        JSON.stringify(customObject)
    )
}

async function getItem(key) {
    try {
        const ctpClient = await config.getCtpClient()
        const {body} = await ctpClient.fetchByContainerAndKey(ctpClient.builder.customObjects, container, key);
        return body.value;
    } catch (error) {
        console.log(error);
        return null;
    }
}

async function removeItem(key) {
    const ctpClient = await config.getCtpClient()
    await ctpClient.deleteByContainerAndKey(ctpClient.builder.customObjects, container, key)
}

export default {
    setItem,
    getItem,
    removeItem
}
