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
  isDefault: false
} as CertificateTemplateConfig

const deathCertificateTemplateWithNoConditional = {
  id: 'death-certificate',
  event: 'death',
  label: {
    id: 'certificates.death.certificate',
    defaultMessage: 'Death Certificate',
    description: 'The label for a death certificate'
  },
  isDefault: false
} as CertificateTemplateConfig

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
  'child.dob': dateToday.toISOString()
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
