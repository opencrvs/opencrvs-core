import { buildTypeScriptToJavaScript } from '@countryconfig/utils'
import * as Hapi from '@hapi/hapi'
import { join } from 'path'

export async function handlebarsHandler(
  _request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  return h
    .response(await buildTypeScriptToJavaScript(join(__dirname, 'helpers.ts')))
    .type('text/javascript')
}
