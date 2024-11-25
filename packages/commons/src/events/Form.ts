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
import { Field } from './Field'
import { Translation } from './Translation'

export const Form = z.object({
  id: z
    .string()
    .describe('Form version. Semantic versioning recommended. Example: 0.0.1'),
  label: Translation.describe('Human readable description of the form'),
  pages: z.array(
    z.object({
      id: z.string().describe('Unique identifier for the page'),
      title: Translation.describe('Header title of the page'),
      fields: z.array(Field).describe('Fields to be rendered on the page')
    })
  )
})

export type Form = z.infer<typeof Form>