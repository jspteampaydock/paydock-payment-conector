import _ from "lodash";
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'node:fs/promises'

async function getNotificationFromRequest(request) {
  const body = await collectRequestData(request)
  const notification = _.get(JSON.parse(body), 'data', [])
  const event = _.get(JSON.parse(body), 'event', [])
  return {event, notification}
}


async function collectRequestData(request) {
  return new Promise((resolve) => {
    const data = []

    request.on('data', (chunk) => {
      data.push(chunk)
    })

    request.on('end', () => {
      const dataStr = Buffer.concat(data).toString()
      resolve(dataStr)
    })
  })
}

function sendResponse(response, statusCode = 200, headers, data) {
  response.writeHead(statusCode, headers)
  response.end(data)
}

async function readAndParseJsonFile(pathToJsonFileFromProjectRoot) {
  const currentFilePath = fileURLToPath(import.meta.url)
  const currentDirPath = path.dirname(currentFilePath)
  const projectRoot = path.resolve(currentDirPath, '../..')
  const pathToFile = path.resolve(projectRoot, pathToJsonFileFromProjectRoot)
  const fileContent = await fs.readFile(pathToFile)
  return JSON.parse(fileContent)
}
export default {
  getNotificationFromRequest,
  sendResponse,
  collectRequestData,
  readAndParseJsonFile,

}
