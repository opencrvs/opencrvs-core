import { NonEmptyArray } from 'src/types'
import { z } from 'zod'
import { Field, Label, SystemRoleType, systemRoleTypes } from './utils'

export const FormGroupField = Field.extend({
  id: z.string(),
  type: z.string(), // @TODO: Get enums from somewhere, field types
  required: z.boolean(),
  searchable: z.boolean(),
  analytics: z.boolean()
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
  roles: z.array(z.enum(systemRoleTypes as NonEmptyArray<SystemRoleType>)),
  form: z.array(FormSection)
})
