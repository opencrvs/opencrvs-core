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

import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  CertificateTemplateConfig,
  EventState,
  JSONSchema,
  SelectField
} from '@opencrvs/commons/client'

const birthCertificateTemplateWithNoConditional = {
  id: 'birth-certificate',
  event: 'birth',
  label: {
    id: 'certificates.birth.certificate.copy',
    defaultMessage: 'Birth Certificate',
    description: 'The label for a birth certificate'
  },
  isDefault: false,
  fee: {
    onTime: 8,
    late: 11.5,
    delayed: 17
  },
  svgUrl: '/api/countryconfig/certificates/birth-certificate.svg',
  fonts: {
    'Noto Sans': {
      normal:
        'http://localhost:3000/api/countryconfig/fonts/NotoSans-Regular.ttf',
      bold: 'http://localhost:3000/api/countryconfig/fonts/NotoSans-Bold.ttf',
      italics:
        'http://localhost:3000/api/countryconfig/fonts/NotoSans-Regular.ttf',
      bolditalics:
        'http://localhost:3000/api/countryconfig/fonts/NotoSans-Regular.ttf'
    }
  },
  hash: '355011756a1cef0be4a032961d0e87b16c01f495-gzip',
  svg: ''
}

const deathCertificateTemplateWithNoConditional: CertificateTemplateConfig = {
  id: 'death-certificate',
  event: 'death',
  label: {
    id: 'certificates.death.certificate',
    defaultMessage: 'Death Certificate',
    description: 'The label for a death certificate'
  },
  isDefault: true,
  fee: {
    onTime: 3,
    late: 5.7,
    delayed: 12
  },
  svgUrl: '/api/countryconfig/certificates/death-certificate.svg',
  fonts: {
    'Noto Sans': {
      normal:
        'http://localhost:3000/api/countryconfig/fonts/NotoSans-Regular.ttf',
      bold: 'http://localhost:3000/api/countryconfig/fonts/NotoSans-Bold.ttf',
      italics:
        'http://localhost:3000/api/countryconfig/fonts/NotoSans-Regular.ttf',
      bolditalics:
        'http://localhost:3000/api/countryconfig/fonts/NotoSans-Regular.ttf'
    }
  },
  hash: 'bf292f852fe65806734c4168ab3c86c12a1a0168-gzip',
  svg: ''
}

const dateToday = new Date()

function birthCertificateTemplateWithMinimumAge(
  minimumAge: number
): CertificateTemplateConfig {
  return {
    ...birthCertificateTemplateWithNoConditional,
    conditionals: [
      {
        type: 'SHOW',
        conditional: {
          type: 'object',
          properties: {
            $form: {
              type: 'object',
              properties: {
                'child.dob': {
                  type: 'string',
                  format: 'date',
                  formatMaximum: new Date(
                    dateToday.getFullYear() - minimumAge,
                    dateToday.getMonth(),
                    dateToday.getDate()
                  ).toISOString()
                }
              },
              required: ['child.dob']
            }
          },
          required: ['$form']
        } as unknown as JSONSchema
      }
    ]
  }
}
const declaration = {
  'mother.firstname': 'Mom',
  'mother.surname': 'Test',
  'mother.dobUnknown': true,
  'mother.age': '80',
  'mother.nationality': 'FAR',
  'mother.idType': 'NATIONAL_ID',
  'mother.nid': '9898989898',
  'mother.address': {
    country: 'ZAF',
    addressType: 'INTERNATIONAL',
    state: 'Western Cape',
    district2: 'City Centre',
    cityOrTown: 'Cape Town'
  },
  'mother.maritalStatus': 'SINGLE',
  'mother.educationalAttainment': 'NO_SCHOOLING',
  'mother.occupation': '',
  'father.detailsNotAvailable': true,
  'father.reason': 'Ran',
  'informant.relation': 'MOTHER',
  'informant.phoneNo': '0791234567',
  'informant.email': 'mom@example.com',
  'child.firstname': 'Kido',
  'child.surname': 'Test',
  'child.gender': 'male',
  'child.dob': dateToday.toISOString(),
  'child.reason': 'Procastination',
  'child.placeOfBirth': 'HEALTH_FACILITY',
  'child.birthLocation': '278fe332-e9d9-42e9-9ce3-80df8d37e97f',
  'child.attendantAtBirth': 'PHYSICIAN',
  'child.birthType': 'SINGLE',
  'child.weightAtBirth': 2.5
} as EventState

let mockTemplates: CertificateTemplateConfig[] = []
describe('useCertificateTemplateSelectorFieldConfig', () => {
  vi.mock('@client/v2-events/hooks/useAppConfig', () => ({
    useAppConfig: () => ({
      certificateTemplates: mockTemplates
    })
  }))

  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    mockTemplates = []
  })

  it('should return a certificate as an option if it does not have a conditional and matches event type', async () => {
    mockTemplates = [
      { ...birthCertificateTemplateWithNoConditional },
      { ...deathCertificateTemplateWithNoConditional }
    ]

    const { useCertificateTemplateSelectorFieldConfig } = await import(
      './useCertificateTemplateSelectorFieldConfig'
    )
    const result = useCertificateTemplateSelectorFieldConfig(
      'v2.birth',
      declaration
    ) as SelectField
  })

  it('does not include birth-certified-certificate if age is less than a year old', async () => {
    mockTemplates = [birthCertificateTemplateWithMinimumAge(1)]

    const { useCertificateTemplateSelectorFieldConfig } = await import(
      './useCertificateTemplateSelectorFieldConfig'
    )

    const birthResult = useCertificateTemplateSelectorFieldConfig(
      'birth',
      declaration
    ) as SelectField

    expect(birthResult.options).toHaveLength(0)
  })

  it('returns correct label and required fields in the config', async () => {
    mockTemplates = [{ ...birthCertificateTemplateWithNoConditional }]

    const { useCertificateTemplateSelectorFieldConfig } = await import(
      './useCertificateTemplateSelectorFieldConfig'
    )
    const result = useCertificateTemplateSelectorFieldConfig(
      'birth',
      declaration
    ) as SelectField
    expect(result.label).toBeDefined()
    expect(result.required).toBe(true)
  })

  it('returns the defaultValue if a template is marked as isDefault', async () => {
    mockTemplates = [
      { ...birthCertificateTemplateWithNoConditional, isDefault: true }
    ]

    const { useCertificateTemplateSelectorFieldConfig } = await import(
      './useCertificateTemplateSelectorFieldConfig'
    )
    const result = useCertificateTemplateSelectorFieldConfig(
      'birth',
      declaration
    ) as SelectField
    expect(result.defaultValue).toBe('birth-certificate')
  })
})
