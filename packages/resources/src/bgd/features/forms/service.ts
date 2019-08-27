import { createReadStream } from 'fs'
import { join } from 'path'

export function getForms() {
  return createReadStream(join(__dirname, './register.json'))
}
