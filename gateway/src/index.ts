import * as DotEnv from 'dotenv'
import * as Glue from 'glue'
import { getManifest } from './config/manifest'

async function startServer() {
  DotEnv.config({
    path: `${process.cwd()}/.env`
  })
  const options = {
    relativeTo: __dirname
  }
  const manifest = getManifest(process.env.PORT)

  try {
    const server = await Glue.compose(manifest, options)
    await server.start()
    console.log(`Gateway Server running at: ${server.info.uri}`)
  } catch (err) {
    console.log(`Error while starting server: ${err.message}`)
    process.exit(1)
  }
}

startServer()
