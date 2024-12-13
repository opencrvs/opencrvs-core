import Ajv from 'ajv'
import { ConditionalData, JSONSchema } from './conditionals'

const ajv = new Ajv()

export function validate(schema: JSONSchema, data: ConditionalData) {
  return ajv.validate(schema, data)
}
