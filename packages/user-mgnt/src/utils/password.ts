import { createHash } from 'crypto'
import * as uuid from 'uuid/v4'

interface ISaltedHash {
  hash: string
  salt: string
}

export function generatePasswordHash(password: string, salt: string): string {
  const hash = createHash('sha512')
  hash.update(salt)
  hash.update(password)
  return hash.digest('hex')
}

export function generateSaltedHash(password: string): ISaltedHash {
  const salt = uuid()
  return {
    hash: generatePasswordHash(password, salt),
    salt
  }
}
