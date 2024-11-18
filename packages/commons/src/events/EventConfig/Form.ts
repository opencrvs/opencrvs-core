import { NonEmptyArray } from 'src/types'
import { z } from 'zod'
import { Field, Label } from '../utils'
import { SystemRoleType, systemRoleTypes } from './ActionConfig'

export const FormGroupField = Field.extend({
  id: z.string(), // @TODO: Check whether we should always have id.
  type: z.string(), // @TODO: Get enums from somewhere, field types
  required: z.boolean(),
  searchable: z.boolean(),
  analytics: z.boolean()
})

export const FormSection = z.object({
  title: Label,
  // Should this be fields
  groups: z.array(FormGroupField)
})

export const Form = z.object({
  active: z.boolean(),
  version: z.object({
    id: z.string(),
    label: Label
  }),
  // actions: z.array(z.string()), // @TODO: ignore
  roles: z.array(z.enum(systemRoleTypes as NonEmptyArray<SystemRoleType>)),
  form: z.array(FormSection)
  // review: z.array(ReviewSection) // Review will be brought when needed.
})
