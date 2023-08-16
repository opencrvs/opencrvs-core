/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import { TypeOf, z } from 'zod'

const messageDescriptor = z.object({
  defaultMessage: z.string().optional(),
  id: z.string(),
  description: z.string().optional()
})

const previewGroup = z.object({
  id: z.string(),
  label: messageDescriptor,
  fieldToRedirect: z.string().optional(),
  delimiter: z.string().optional(),
  required: z.boolean().optional(),
  initialValue: z.string().optional()
})

const conditional = z.object({
  description: z.string().optional(),
  action: z.string(),
  expression: z.string()
})

/*
 * TODO: The field validation needs to be made stricter
 */
const field = z
  .object({
    name: z.string(),
    type: z.string(),
    label: messageDescriptor,
    conditionals: z.array(conditional).optional()
  })
  .passthrough()

const group = z.object({
  id: z.string(),
  title: messageDescriptor.optional(),
  fields: z.array(field),
  previewGroups: z.array(previewGroup).optional(),
  conditionals: z.array(conditional).optional(),
  preventContinueIfError: z.boolean().optional()
})

const section = z.object({
  id: z.string(),
  viewType: z.enum(['form', 'hidden']),
  name: messageDescriptor,
  title: messageDescriptor.optional(),
  groups: z.array(group),
  mapping: z.object({}).passthrough().optional()
})

function duplicateFieldNames(sec: TypeOf<typeof section>): string[] {
  const fieldsCount = sec.groups
    .flatMap((group) => group.fields)
    .reduce((counter, field) => {
      if (counter.has(field.name)) {
        counter.set(field.name, counter.get(field.name)! + 1)
      } else {
        counter.set(field.name, 1)
      }
      return counter
    }, new Map<string, number>())
  return [...fieldsCount.entries()]
    .filter(([_, count]) => count > 1)
    .map(([name, _]) => name)
}

const requiredSections = ['registration', 'documents']

const form = z.object({
  sections: z
    .array(
      section.refine(
        (sec) => duplicateFieldNames(sec).length === 0,
        (sec) => ({
          message: `Duplicate fields: ${duplicateFieldNames(sec).join(
            ', '
          )} found in section: ${sec.name}`
        })
      )
    )
    .refine(
      (sections) => {
        sections.filter(({ id }) => requiredSections.includes(id)).length >= 2
      },
      {
        message: `${requiredSections
          .map((sec) => `"${sec}"`)
          .join(' & ')} sections are required`
      }
    )
})

export const registrationForms = z.object({
  version: z.string(),
  birth: form,
  death: form,
  marriage: form
})
