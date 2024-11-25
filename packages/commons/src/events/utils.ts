/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
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
