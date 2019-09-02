import { readFileSync } from 'fs'
import { join } from 'path'
import { lookup } from 'mime-types'

export function getAssest(file: string) {
  return readFileSync(join(__dirname, `./files/${file}`))
}

export function getAssestMimeType(file: string) {
  return lookup(join(__dirname, `./files/${file}`)) as string
}
