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
import { z } from 'zod'

const handlebarTemplate = z.object({
  fieldName: z.string(),
  operation: z.string(),
  parameters: z.array(z.any()).optional()
})

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
    conditionals: z.array(conditional).optional(),
    mapping: z
      .object({ template: handlebarTemplate.optional() })
      .passthrough()
      .optional()
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
  mapping: z
    .object({ template: z.array(handlebarTemplate).optional() })
    .passthrough()
    .optional()
})

function findDuplicates(arr: string[]): string[] {
  const freqCount = arr.reduce((counter, str) => {
    if (counter.has(str)) {
      counter.set(str, counter.get(str)! + 1)
    } else {
      counter.set(str, 1)
    }
    return counter
  }, new Map<string, number>())
  return [...freqCount.entries()]
    .filter(([_, count]) => count > 1)
    .map(([name, _]) => name)
}

const requiredSections = ['registration', 'documents']

const form = z.object({
  sections: z
    .array(
      section.refine(
        (sec) =>
          findDuplicates(
            sec.groups.flatMap(({ fields }) => fields.map(({ name }) => name))
          ).length === 0,
        (sec) => ({
          message: `Field names in a section should all be unique. Duplicate field(s): ${findDuplicates(
            sec.groups.flatMap(({ fields }) => fields.map(({ name }) => name))
          ).join(', ')} found`
        })
      )
    )
    .refine(
      (sections) =>
        sections.filter(({ id }) => requiredSections.includes(id)).length >= 2,
      {
        message: `${requiredSections
          .map((sec) => `"${sec}"`)
          .join(' & ')} sections are required`
      }
    )
    .refine(
      (sections) => {
        findDuplicates(
          sections
            .flatMap((sec) => sec.groups)
            .flatMap((group) => group.fields)
            .map(({ mapping }) => mapping?.template?.fieldName)
            .filter((maybeName): maybeName is string => Boolean(maybeName))
        ).length === 0
      },
      (sections) => {
        const duplicateCertificateHandlebars = findDuplicates(
          sections
            .flatMap((sec) => sec.groups)
            .flatMap((group) => group.fields)
            .map(({ mapping }) => mapping?.template?.fieldName)
            .filter((maybeName): maybeName is string => Boolean(maybeName))
        )
        return {
          message: `All the certificate handlebars should be unique for an event. Duplicates found for: ${duplicateCertificateHandlebars.join(
            ', '
          )}`
        }
      }
    )
})

export const registrationForms = z.object({
  version: z.string(),
  birth: form,
  death: form,
  marriage: form
})
