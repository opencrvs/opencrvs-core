import { readFile } from 'fs'
import { join } from 'path'
import { lookup } from 'mime-types'

export async function getAssest(file: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    readFile(join(__dirname, `./files/${file}`), (err, data) => {
      err ? reject(err) : resolve(data)
    })
  })
}

export function getAssestMimeType(file: string) {
  return lookup(join(__dirname, `./files/${file}`)) as string
}
