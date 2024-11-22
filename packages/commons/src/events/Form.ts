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
