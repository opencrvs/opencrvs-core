import { JSONSchemaType } from 'ajv'
import { EventDocument } from 'src/events'

export type ConditionalData = {
  $form?: Record<string, any>
  $event: EventDocument
}
export type JSONSchema = Omit<JSONSchemaType<ConditionalData>, 'properties'>
