import { GetValues } from '../types'
import { z } from 'zod'

export const Label = z.object({
  defaultMessage: z.string(),
  description: z.string(),
  id: z.string()
})

// Ask whether these are always together
export const Field = z.object({
  label: Label
})

export const Summary = z.object({
  title: Label,
  fields: z.array(Field)
})

// @TODO
export const Query = z.object({
  requester: z.object({
    phone: z.object({
      check: z.string()
    }),
    name: z.object({
      check: z.string()
    })
  })
})

export const SystemRoleType = {
  FieldAgent: 'FIELD_AGENT',
  LocalRegistrar: 'LOCAL_REGISTRAR',
  LocalSystemAdmin: 'LOCAL_SYSTEM_ADMIN',
  NationalRegistrar: 'NATIONAL_REGISTRAR',
  NationalSystemAdmin: 'NATIONAL_SYSTEM_ADMIN',
  PerformanceManagement: 'PERFORMANCE_MANAGEMENT',
  RegistrationAgent: 'REGISTRATION_AGENT'
} as const

export type SystemRoleType = GetValues<typeof SystemRoleType>
export const systemRoleTypes = Object.values(SystemRoleType)
