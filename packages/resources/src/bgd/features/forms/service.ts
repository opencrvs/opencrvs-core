import { readFileSync } from 'fs'
import { join } from 'path'

export function getForms() {
  return JSON.parse(readFileSync(join(__dirname, './register.json')).toString())
}
