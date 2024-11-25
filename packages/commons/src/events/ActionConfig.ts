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
import { z } from 'zod'
import { Form } from './FormConfig'
import { Translation } from './TranslationConfig'

export const ActionConfigBase = z.object({
  label: Translation,
  forms: z.array(Form)
})

/**
 * Actions recognized by the system
 */
export const ActionType = {
  CREATE: 'CREATE',
  ASSIGN: 'ASSIGN',
  UNASSIGN: 'UNASSIGN',
  REGISTER: 'REGISTER',
  VALIDATE: 'VALIDATE',
  CORRECT: 'CORRECT',
  DETECT_DUPLICATE: 'DETECT_DUPLICATE',
  NOTIFY: 'NOTIFY',
  DECLARE: 'DECLARE'
} as const

const CreateConfig = ActionConfigBase.merge(
  z.object({
    type: z.literal(ActionType.CREATE)
  })
)

const DeclareConfig = ActionConfigBase.merge(
  z.object({
    type: z.literal(ActionType.DECLARE)
  })
)

const RegisterConfig = ActionConfigBase.merge(
  z.object({
    type: z.literal(ActionType.REGISTER)
  })
)

export const ActionConfig = z.discriminatedUnion('type', [
  CreateConfig,
  DeclareConfig,
  RegisterConfig
])
