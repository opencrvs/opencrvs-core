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
    custom: z.boolean().optional(),
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

const REQUIRED_SECTIONS = ['registration', 'documents'] as const

const REQUIRED_EVENT_ADDRESS_FIELDS = [
  'country',
  'state',
  'district',
  'ruralOrUrban',
  'city',
  'addressLine3UrbanOption',
  'addressLine2UrbanOption',
  'addressLine1UrbanOption',
  'postalCode',
  'addressLine1RuralOption',
  'internationalState',
  'internationalDistrict',
  'internationalCity',
  'internationalAddressLine1',
  'internationalAddressLine2',
  'internationalAddressLine3',
  'internationalPostalCode'
]

const REQUIRED_PRIMARY_ADDRESS_FIELDS = [
  'countryPrimary',
  'statePrimary',
  'districtPrimary',
  'ruralOrUrbanPrimary',
  'cityPrimary',
  'addressLine3UrbanOptionPrimary',
  'addressLine2UrbanOptionPrimary',
  'addressLine1UrbanOptionPrimary',
  'postalCodePrimary',
  'addressLine1RuralOptionPrimary',
  'internationalStatePrimary',
  'internationalDistrictPrimary',
  'internationalCityPrimary',
  'internationalAddressLine1Primary',
  'internationalAddressLine2Primary',
  'internationalAddressLine3Primary',
  'internationalPostalCodePrimary'
]

const REQUIRED_FIELDS_IN_SECTION: Record<string, string[] | undefined> = {
  child: [
    'firstNamesEng',
    'familyNameEng',
    'gender',
    'childBirthDate',
    'placeOfBirthTitle',
    'placeOfBirth',
    'birthLocation',
    ...REQUIRED_EVENT_ADDRESS_FIELDS.map((field) => `${field}Placeofbirth`)
  ],
  mother: [
    'firstNamesEng',
    'familyNameEng',
    'detailsExist',
    'reasonNotApplying',
    'motherBirthDate',
    'nationality',
    ...REQUIRED_PRIMARY_ADDRESS_FIELDS.map((field) => `${field}Mother`)
  ],
  father: [
    'firstNamesEng',
    'familyNameEng',
    'detailsExist',
    'reasonNotApplying',
    'fatherBirthDate',
    'nationality',
    'primaryAddressSameAsOtherPrimary',
    ...REQUIRED_PRIMARY_ADDRESS_FIELDS.map((field) => `${field}Father`)
  ],
  deceased: [
    'firstNamesEng',
    'familyNameEng',
    'gender',
    'deceasedBirthDate',
    'nationality',
    ...REQUIRED_PRIMARY_ADDRESS_FIELDS.map((field) => `${field}Deceased`)
  ],
  deathEvent: [
    'deathDate',
    'placeOfDeathTitle',
    'placeOfDeath',
    'deathLocation',
    ...REQUIRED_EVENT_ADDRESS_FIELDS.map((field) => `${field}Placeofdeath`)
  ],
  marriageEvent: [
    'marriageDate',
    'placeOfMarriageTitle',
    ...REQUIRED_EVENT_ADDRESS_FIELDS.map((field) => `${field}Placeofmarriage`)
  ],
  groom: [
    'firstNamesEng',
    'familyNameEng',
    'groomBirthDate',
    'nationality',
    ...REQUIRED_PRIMARY_ADDRESS_FIELDS.map((field) => `${field}Groom`)
  ],
  bride: [
    'firstNamesEng',
    'familyNameEng',
    'brideBirthDate',
    'nationality',
    ...REQUIRED_PRIMARY_ADDRESS_FIELDS.map((field) => `${field}Bride`)
  ],
  informant: [
    'informantType',
    'otherInformantType',
    'firstNamesEng',
    'familyNameEng',
    'informantBirthDate',
    'nationality',
    ...REQUIRED_PRIMARY_ADDRESS_FIELDS.map((field) => `${field}Informant`)
  ],
  witnessOne: [
    'firstNamesEng',
    'familyNameEng',
    'relationship',
    'otherRelationship'
  ],
  witnessTwo: [
    'firstNamesEng',
    'familyNameEng',
    'relationship',
    'otherRelationship'
  ]
}

const OPTIONAL_FIELDS_IN_SECTION: Record<string, string[] | undefined> = {
  child: ['attendantAtBirth', 'birthType', 'weightAtBirth'],
  mother: [
    'primaryAddress',
    'exactDateOfBirthUnknown',
    'ageOfIndividualInYears',
    'iD',
    'motherNidVerification',
    'maritalStatus',
    'multipleBirth',
    'occupation',
    'educationalAttainment'
  ],
  father: [
    'primaryAddress',
    'exactDateOfBirthUnknown',
    'ageOfIndividualInYears',
    'iD',
    'fatherNidVerification',
    'maritalStatus',
    'occupation',
    'educationalAttainment'
  ],
  deceased: [
    'primaryAddress',
    'exactDateOfBirthUnknown',
    'ageOfIndividualInYears',
    'deceasedID',
    'maritalStatus'
  ],
  deathEvent: [
    'mannerOfDeath',
    'causeOfDeathEstablished',
    'causeOfDeathMethod',
    'deathDescription'
  ],
  marriageEvent: ['typeOfMarriage'],
  groom: [
    'primaryAddress',
    'exactDateOfBirthUnknown',
    'ageOfIndividualInYears',
    'iD',
    'marriedLastNameEng'
  ],
  bride: [
    'primaryAddress',
    'exactDateOfBirthUnknown',
    'ageOfIndividualInYears',
    'iD',
    'marriedLastNameEng'
  ],
  informant: [
    'primaryAddress',
    'registrationPhone',
    'registrationEmail',
    'exactDateOfBirthUnknown',
    'ageOfIndividualInYears',
    'informantID',
    'informantNidVerification',
    'primaryAddressSameAsOtherPrimary'
  ],
  witnessOne: [],
  witnessTwo: []
}

const form = z.object({
  sections: z
    .array(
      section
        .refine(
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
        .refine(
          (sec) => {
            const fieldsInSection = sec.groups.flatMap((group) =>
              group.fields.map(({ name }) => name)
            )
            return (
              (REQUIRED_FIELDS_IN_SECTION[sec.id]?.filter(
                (reqField) => !fieldsInSection.includes(reqField)
              ).length ?? 0) === 0
            )
          },
          (sec) => {
            const fieldsInSection = sec.groups.flatMap((group) =>
              group.fields.map(({ name }) => name)
            )
            const notIncludedRequiredFields = (
              REQUIRED_FIELDS_IN_SECTION[sec.id] ?? []
            ).filter((reqField) => !fieldsInSection.includes(reqField))
            return {
              message: `Missing required fields "${notIncludedRequiredFields.join(
                ', '
              )}" found`
            }
          }
        )
        .refine(
          (sec) => {
            if (!REQUIRED_FIELDS_IN_SECTION[sec.id]) {
              return true
            }
            const nonCustomfieldsInSection = sec.groups.flatMap((group) =>
              group.fields
                .filter(({ custom }) => !Boolean(custom))
                .filter(({ type }) => type !== 'DIVIDER')
                .filter(
                  ({ name }) =>
                    !(REQUIRED_FIELDS_IN_SECTION[sec.id] ?? []).includes(name)
                )
                .map(({ name }) => name)
            )
            return (
              nonCustomfieldsInSection.filter(
                (nonCustomField) =>
                  !(OPTIONAL_FIELDS_IN_SECTION[sec.id] ?? []).includes(
                    nonCustomField
                  )
              ).length === 0
            )
          },
          (sec) => {
            const nonCustomfieldsInSection = sec.groups.flatMap((group) =>
              group.fields
                .filter(({ custom }) => !Boolean(custom))
                .filter(({ type }) => type !== 'DIVIDER')
                .filter(
                  ({ name }) =>
                    !(REQUIRED_FIELDS_IN_SECTION[sec.id] ?? []).includes(name)
                )
                .map(({ name }) => name)
            )
            const unrecognizedFields = nonCustomfieldsInSection.filter(
              (nonCustomField) =>
                !(OPTIONAL_FIELDS_IN_SECTION[sec.id] ?? []).includes(
                  nonCustomField
                )
            )
            return {
              message: `Use "custom" property to make a field custom. Unrecognized non custom fields "${unrecognizedFields.join(
                ', '
              )}" found`
            }
          }
        )
    )
    .refine(
      (sections) =>
        sections.filter(({ id }) =>
          REQUIRED_SECTIONS.includes(id as typeof REQUIRED_SECTIONS[number])
        ).length >= 2,
      {
        message: `${REQUIRED_SECTIONS.map((sec) => `"${sec}"`).join(
          ' & '
        )} sections are required`
      }
    )
    .refine(
      (sections) =>
        findDuplicates(
          sections
            .flatMap((sec) => [
              ...(sec.mapping?.template ?? []).map(({ fieldName }) => {
                // Log the following to observe all available handlebars
                // console.log('section handlebar: ', fieldName)
                return fieldName
              }),
              ...sec.groups
                .flatMap((group) => group.fields)
                .map(({ mapping }) => {
                  // Log the following to observe all available handlebars
                  // console.log('field handlebar: ', mapping?.template?.fieldName)
                  return mapping?.template?.fieldName
                })
            ])
            .filter((maybeName): maybeName is string => Boolean(maybeName))
        ).length === 0,
      (sections) => {
        const duplicateCertificateHandlebars = findDuplicates(
          sections
            .flatMap((sec) => [
              ...(sec.mapping?.template ?? []).map(
                ({ fieldName }) => fieldName
              ),
              ...sec.groups
                .flatMap((group) => group.fields)
                .map(({ mapping }) => mapping?.template?.fieldName)
            ])
            .filter((maybeName): maybeName is string => Boolean(maybeName))
        )
        return {
          message: `All the certificate handlebars should be unique for an event. Duplicate handlebars for "${duplicateCertificateHandlebars.join(
            ', '
          )}"`
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
