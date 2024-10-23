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

import * as z from 'zod'

const NumberInputValue = z.number()
const TextInputValue = z.string()

export type Idenfifier = z.infer<typeof Idenfifier>
export type Field = z.infer<typeof Field>
export type Action = z.infer<typeof Action>
export type Event = z.infer<typeof Event>

export const Idenfifier = z.object({
  type: z.string(),
  value: z.string()
})

export const Field = z.object({
  fieldId: z.string(),
  value: z.union([NumberInputValue, TextInputValue])
})

export const Action = z.object({
  type: z.string(),
  createdBy: z.string(),
  createdAt: z.coerce.date(),
  createdAtLocation: z.string(),
  fields: z.array(Field),
  idenfifiers: z.array(Idenfifier).optional()
})

export const Event = z.object({
  id: z.string(),
  type: z.string(),
  createdAt: z.coerce.date(),
  actions: z.array(Action)
})
