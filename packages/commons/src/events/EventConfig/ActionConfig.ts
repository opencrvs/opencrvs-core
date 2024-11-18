import { GetValues, NonEmptyArray } from 'src/types'
import { z } from 'zod'
import { Label } from '../utils'
import { Form } from './Form'
import { ActionType, actionTypes } from '../Action'

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

export const ActionConfig = z.object({
  type: z.enum(actionTypes as NonEmptyArray<ActionType>),
  roles: z.array(z.enum(systemRoleTypes as NonEmptyArray<SystemRoleType>)),
  label: Label,
  fees: z.array(z.unknown()), // @TODO: Define fee type
  forms: z.array(Form)
})
