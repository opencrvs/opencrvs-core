import * as Hapi from 'hapi'
import * as fs from 'fs'

export async function definitionsHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
): Promise<any> {
  // TODO typing
  const application = request.params.application
  return JSON.parse(
    fs.readFileSync(`${application}-definitions.json`).toString()
  )
}
