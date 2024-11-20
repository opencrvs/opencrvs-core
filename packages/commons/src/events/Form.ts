import { z } from 'zod'
import { Field, Label } from './utils'

export const FormGroupField = Field.extend({
  id: z.string(),
  type: z.string(), // @TODO: Get enums from somewhere, field types
  required: z.boolean(),
  searchable: z.boolean().optional(),
  analytics: z.boolean().optional()
})

export const FormSection = z.object({
  title: Label,
  groups: z.array(FormGroupField)
})

export const Form = z.object({
  active: z.boolean(),
  version: z.object({
    id: z.string(),
    label: Label
  }),
  form: z.array(FormSection)
})
