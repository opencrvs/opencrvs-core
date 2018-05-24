// tslint:disable-next-line no-var-requires
require('app-module-path').addPath(require('path').join(__dirname, '../'))

import * as DotEnv from 'dotenv'
import { getPlugins } from 'src/config/plugins'
import { getServer } from 'src/config/server'
import { getLogger } from 'src/utils/logger'

DotEnv.config({
  path: `${process.cwd()}/.env`
})
const graphQLSchemaPath = `${process.cwd()}/src/graphql/index.graphql`
const logger = getLogger(Number(process.env.LOG_LEVEL), process.env.APP_NAME)
const server = getServer(process.env.NODE_ENV, process.env.PORT, logger)
const plugins = getPlugins(process.env.NODE_ENV, graphQLSchemaPath)

async function startServer() {
  try {
    // add things here before the app starts, like database connection check etc
    await server.start()
    logger.info(
      `server started at port: ${process.env.PORT} with env: ${
        process.env.NODE_ENV
      }`
    )
  } catch (error) {
    logger.error(error)
    process.exit(1)
  }
}

const registerPlugins = async () => {
  try {
    await server.register(plugins)
    startServer()
  } catch (error) {
    logger.error(error, 'Failed to register hapi plugins')
    throw error
  }
}
registerPlugins()
