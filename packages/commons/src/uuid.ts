import { Nominal } from './record'
import { v4 as uuidv4 } from 'uuid'

export type UUID = Nominal<string, 'UUID'>

export function getUUID() {
  return uuidv4() as UUID
}
