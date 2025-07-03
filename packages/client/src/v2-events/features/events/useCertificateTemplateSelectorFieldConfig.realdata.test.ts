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
  EventDocument,
  JSONSchema,
  SelectField,
  generateEventDocument,
  ActionType,
  tennisClubMembershipEvent
} from '@opencrvs/commons/client'

// Test data based on your provided values
const testDeclaration: EventState = {
  'recommender.none': true,
  'applicant.firstname': 'Me',
  'applicant.surname': 'Test',
  'applicant.dob': '2000-01-01'
} as EventState

// const testEvent: EventDocument = {
//   id: '427f008b-1509-4ce8-9682-389e1482822e',
//   type: 'tennis-club-membership',
//   createdAt: '2025-07-02T10:35:25.023Z',
//   updatedAt: '2025-07-02T12:25:31.509Z',
//   actions: [
//     {
//       createdBy: '6865054f81a118ef3769cbcd',
//       createdByRole: 'LOCAL_REGISTRAR',
//       createdAtLocation: 'dbd2b8b0-35f5-4408-ba9a-dfe6ec049aa0',
//       createdBySignature: null,
//       type: 'CREATE',
//       createdAt: '2025-07-02T10:35:25.023Z',
//       id: '529b3dfd-6c77-4ccd-88da-70807dc8c903',

//       declaration: Object,
//       status: 'Accepted',
//       transactionId: '609281fe-e4b6-41b0-ae9a-2759cc4cadbd'
//     }
//   ],
//   trackingId: 'ILE4YZ'
// } as EventDocument
const testEvent = generateEventDocument({
  configuration: tennisClubMembershipEvent,
  actions: [ActionType.CREATE, ActionType.NOTIFY, ActionType.REGISTER]
})

// Certificate templates for testing
const basicTemplate: CertificateTemplateConfig = {
  id: 'tennis-club-membership-certificate-basic',
  event: 'tennis-club-membership',
  label: {
    id: 'certificates.tennis-club-membership.certificate.basic',
    defaultMessage: 'Basic Tennis Club Membership Certificate',
    description: 'The label for a basic tennis club membership certificate'
  },
  isDefault: true,
  svgUrl: '/certificates/tennis-club-membership-basic.svg',
  svg: '<svg>Basic Certificate</svg>',
  fee: {
    onTime: 10,
    late: 15,
    delayed: 20
  }
} as CertificateTemplateConfig

const premiumTemplateWithConditional: CertificateTemplateConfig = {
  id: 'tennis-club-membership-certificate-premium',
  event: 'tennis-club-membership',
  label: {
    id: 'certificates.tennis-club-membership.certificate.premium',
    defaultMessage: 'Premium Tennis Club Membership Certificate',
    description: 'The label for a premium tennis club membership certificate'
  },
  isDefault: false,
  svgUrl: '/certificates/tennis-club-membership-premium.svg',
  svg: '<svg>Premium Certificate</svg>',
  fee: {
    onTime: 25,
    late: 30,
    delayed: 35
  },
  conditionals: [
    {
      type: 'SHOW',
      conditional: {
        type: 'object',
        properties: {
          $form: {
            type: 'object',
            properties: {
              'recommender.none': {
                type: 'boolean',
                const: true
              }
            },
            required: ['recommender.none']
          }
        },
        required: ['$form']
      } as unknown as JSONSchema
    }
  ]
} as CertificateTemplateConfig

const registeredTemplateWithMetaConditional: CertificateTemplateConfig = {
  id: 'tennis-club-membership-certificate-registered',
  event: 'tennis-club-membership',
  label: {
    id: 'certificates.tennis-club-membership.certificate.registered',
    defaultMessage: 'Registered Tennis Club Membership Certificate',
    description: 'The label for a registered tennis club membership certificate'
  },
  isDefault: false,
  svgUrl: '/certificates/tennis-club-membership-registered.svg',
  svg: '<svg>Registered Certificate</svg>',
  fee: {
    onTime: 20,
    late: 25,
    delayed: 30
  },
  metaBasedConditionals: [
    {
      type: 'SHOW',
      conditional: {
        type: 'object',
        properties: {
          $form: {
            type: 'object',
            properties: {
              actions: {
                type: 'array',
                contains: {
                  type: 'object',
                  properties: {
                    type: {
                      type: 'string',
                      const: 'CREATE'
                    }
                  },
                  required: ['type']
                }
              }
            },
            required: ['actions']
          }
        },
        required: ['$form']
      } as unknown as JSONSchema
    }
  ]
} as CertificateTemplateConfig

let mockTemplates: CertificateTemplateConfig[] = []

describe('useCertificateTemplateSelectorFieldConfig - Real Data Test', () => {
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

  it('should handle certificate without conditionals', async () => {
    mockTemplates = [basicTemplate]

    const { useCertificateTemplateSelectorFieldConfig } = await import(
      './useCertificateTemplateSelectorFieldConfig'
    )

    const result = useCertificateTemplateSelectorFieldConfig(
      'tennis-club-membership',
      testDeclaration,
      testEvent
    ) as SelectField

    expect(result.options).toHaveLength(1)
    expect(result.options[0].value).toBe(
      'tennis-club-membership-certificate-basic'
    )
    expect(result.defaultValue).toBe('tennis-club-membership-certificate-basic')
    expect(result.type).toBe('SELECT')
    expect(result.id).toBe('certificateTemplateId')
  })

  it('should show premium certificate when form conditional is met', async () => {
    mockTemplates = [basicTemplate, premiumTemplateWithConditional]

    const { useCertificateTemplateSelectorFieldConfig } = await import(
      './useCertificateTemplateSelectorFieldConfig'
    )

    const result = useCertificateTemplateSelectorFieldConfig(
      'tennis-club-membership',
      testDeclaration,
      testEvent
    ) as SelectField

    // Should include both certificates since recommender.none is true in test data
    expect(result.options).toHaveLength(2)
    expect(
      result.options.some(
        (opt) => opt.value === 'tennis-club-membership-certificate-premium'
      )
    ).toBe(true)
    expect(result.defaultValue).toBe('tennis-club-membership-certificate-basic')
  })

  it.only('should show registered certificate when meta conditional is met', async () => {
    mockTemplates = [basicTemplate, registeredTemplateWithMetaConditional]

    const { useCertificateTemplateSelectorFieldConfig } = await import(
      './useCertificateTemplateSelectorFieldConfig'
    )

    const result = useCertificateTemplateSelectorFieldConfig(
      'tennis-club-membership',
      testDeclaration,
      testEvent
    ) as SelectField

    // Should include both certificates since status is REGISTERED in test data
    expect(result.options).toHaveLength(2)
    expect(
      result.options.some(
        (opt) => opt.value === 'tennis-club-membership-certificate-registered'
      )
    ).toBe(true)
  })

  it('should show all certificates when all conditionals are met', async () => {
    mockTemplates = [
      basicTemplate,
      premiumTemplateWithConditional,
      registeredTemplateWithMetaConditional
    ]

    const { useCertificateTemplateSelectorFieldConfig } = await import(
      './useCertificateTemplateSelectorFieldConfig'
    )

    const result = useCertificateTemplateSelectorFieldConfig(
      'tennis-club-membership',
      testDeclaration,
      testEvent
    ) as SelectField

    // Should include all certificates since both conditionals are met
    expect(result.options).toHaveLength(3)
    expect(result.defaultValue).toBe('tennis-club-membership-certificate-basic')

    const certificateIds = result.options.map((opt) => opt.value)
    expect(certificateIds).toContain('tennis-club-membership-certificate-basic')
    expect(certificateIds).toContain(
      'tennis-club-membership-certificate-premium'
    )
    expect(certificateIds).toContain(
      'tennis-club-membership-certificate-registered'
    )
  })

  it('should hide certificate when form conditional fails', async () => {
    // Create a certificate that requires recommender.none to be false
    const failingTemplate: CertificateTemplateConfig = {
      ...premiumTemplateWithConditional,
      id: 'tennis-club-membership-certificate-failing',
      conditionals: [
        {
          type: 'SHOW',
          conditional: {
            type: 'object',
            properties: {
              $form: {
                type: 'object',
                properties: {
                  'recommender.none': {
                    type: 'boolean',
                    const: false
                  }
                },
                required: ['recommender.none']
              }
            },
            required: ['$form']
          } as unknown as JSONSchema
        }
      ]
    }

    mockTemplates = [basicTemplate, failingTemplate]

    const { useCertificateTemplateSelectorFieldConfig } = await import(
      './useCertificateTemplateSelectorFieldConfig'
    )

    const result = useCertificateTemplateSelectorFieldConfig(
      'tennis-club-membership',
      testDeclaration,
      testEvent
    ) as SelectField

    // Should only have the basic certificate, not the failing one
    expect(result.options).toHaveLength(1)
    expect(result.options[0].value).toBe(
      'tennis-club-membership-certificate-basic'
    )
  })

  it('should return correct field configuration structure', async () => {
    mockTemplates = [basicTemplate]

    const { useCertificateTemplateSelectorFieldConfig } = await import(
      './useCertificateTemplateSelectorFieldConfig'
    )

    const result = useCertificateTemplateSelectorFieldConfig(
      'tennis-club-membership',
      testDeclaration,
      testEvent
    ) as SelectField

    expect(result).toMatchObject({
      id: 'certificateTemplateId',
      type: 'SELECT',
      required: true,
      label: {
        defaultMessage: 'Type',
        description: 'This is the label for the field',
        id: 'v2.event.default.action.certificate.template.type.label'
      },
      defaultValue: 'tennis-club-membership-certificate-basic',
      options: [
        {
          label: {
            id: 'certificates.tennis-club-membership.certificate.basic',
            defaultMessage: 'Basic Tennis Club Membership Certificate',
            description:
              'The label for a basic tennis club membership certificate'
          },
          value: 'tennis-club-membership-certificate-basic'
        }
      ]
    })
  })
})
