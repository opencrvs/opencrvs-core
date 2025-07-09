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

// Import test data
import {
  testDeclarationFormData,
  testEventDocument,
  tennisClubMembershipCertificateWithoutConditionals,
  tennisClubMembershipCertificateWithFormConditionals,
  tennisClubMembershipCertificateWithMetaConditionals,
  tennisClubMembershipCertificateWithFailingFormConditionals
} from './testData'

// Mock templates array
let mockTemplates: CertificateTemplateConfig[] = []

// Mock the useAppConfig hook
vi.mock('@client/v2-events/hooks/useAppConfig', () => ({
  useAppConfig: () => ({
    certificateTemplates: mockTemplates
  })
}))

describe('useCertificateTemplateSelectorFieldConfig', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    mockTemplates = []
  })

  describe('Basic functionality', () => {
    it('should return certificate as option when no conditionals are present', async () => {
      mockTemplates = [tennisClubMembershipCertificateWithoutConditionals]

      const { useCertificateTemplateSelectorFieldConfig } = await import(
        './useCertificateTemplateSelectorFieldConfig'
      )

      const result = useCertificateTemplateSelectorFieldConfig(
        'tennis-club-membership',
        testDeclarationFormData,
        testEventDocument
      ) as SelectField

      expect(result.options).toHaveLength(1)
      expect(result.options[0].value).toBe('tennis-club-membership-certificate')
      expect(result.defaultValue).toBe('tennis-club-membership-certificate')
      expect(result.type).toBe('SELECT')
      expect(result.id).toBe('certificateTemplateId')
      expect(result.required).toBe(true)
    })

    it('should return empty options when no certificates match the event type', async () => {
      mockTemplates = [tennisClubMembershipCertificateWithoutConditionals]

      const { useCertificateTemplateSelectorFieldConfig } = await import(
        './useCertificateTemplateSelectorFieldConfig'
      )

      const result = useCertificateTemplateSelectorFieldConfig(
        'birth', // Different event type
        testDeclarationFormData,
        testEventDocument
      ) as SelectField

      expect(result.options).toHaveLength(0)
      expect(result.defaultValue).toBeUndefined()
    })

    it('should set default value to certificate marked as default', async () => {
      const basicTemplate = {
        ...tennisClubMembershipCertificateWithoutConditionals,
        isDefault: false
      }
      const defaultTemplate = {
        ...tennisClubMembershipCertificateWithoutConditionals,
        id: 'tennis-club-membership-certificate-default',
        isDefault: true
      }

      mockTemplates = [basicTemplate, defaultTemplate]

      const { useCertificateTemplateSelectorFieldConfig } = await import(
        './useCertificateTemplateSelectorFieldConfig'
      )

      const result = useCertificateTemplateSelectorFieldConfig(
        'tennis-club-membership',
        testDeclarationFormData,
        testEventDocument
      ) as SelectField

      expect(result.defaultValue).toBe(
        'tennis-club-membership-certificate-default'
      )
      expect(result.options).toHaveLength(2)
    })
  })

  describe('Form-based conditionals', () => {
    it('should show certificate when form conditional is met', async () => {
      mockTemplates = [
        tennisClubMembershipCertificateWithoutConditionals,
        tennisClubMembershipCertificateWithFormConditionals
      ]

      const { useCertificateTemplateSelectorFieldConfig } = await import(
        './useCertificateTemplateSelectorFieldConfig'
      )

      const result = useCertificateTemplateSelectorFieldConfig(
        'tennis-club-membership',
        testDeclarationFormData,
        testEventDocument
      ) as SelectField

      // Should include both certificates since child.gender is male in test data
      expect(result.options).toHaveLength(2)

      const certificateIds = result.options.map((opt) => opt.value)
      expect(certificateIds).toContain('tennis-club-membership-certificate')
      expect(certificateIds).toContain(
        'tennis-club-membership-certificate-form-conditionals'
      )
    })

    it('should hide certificate when form conditional fails', async () => {
      mockTemplates = [
        tennisClubMembershipCertificateWithoutConditionals,
        tennisClubMembershipCertificateWithFailingFormConditionals
      ]

      const { useCertificateTemplateSelectorFieldConfig } = await import(
        './useCertificateTemplateSelectorFieldConfig'
      )

      const result = useCertificateTemplateSelectorFieldConfig(
        'tennis-club-membership',
        testDeclarationFormData,
        testEventDocument
      ) as SelectField

      // Should only have the basic certificate (child.gender is male, not female)
      expect(result.options).toHaveLength(1)
      expect(result.options[0].value).toBe('tennis-club-membership-certificate')
    })

    it('should work with date-based conditionals', async () => {
      // Create dynamic dates relative to today
      const today = new Date()
      const twoYearsAgo = new Date(
        today.getFullYear() - 2,
        today.getMonth(),
        today.getDate()
      )
      const oneYearAgo = new Date(
        today.getFullYear() - 1,
        today.getMonth(),
        today.getDate()
      )

      // Format dates as YYYY-MM-DD strings
      const twoYearsAgoStr = twoYearsAgo.toISOString().split('T')[0]
      const oneYearAgoStr = oneYearAgo.toISOString().split('T')[0]

      const oneYearAgoDeclaration: EventState = {
        'child.dob': twoYearsAgoStr
      }

      const dateConditionalTemplate: CertificateTemplateConfig = {
        id: 'tennis-club-membership-certificate-date',
        event: 'tennis-club-membership',
        label: {
          id: 'certificates.tennis-club-membership.certificate.date',
          defaultMessage: 'Date Conditional Certificate',
          description: 'Certificate with date conditional'
        },
        isDefault: false,
        svgUrl: '/certificates/test.svg',
        svg: '<svg>Test</svg>',
        fee: { onTime: 10, late: 15, delayed: 20 },
        conditionals: [
          {
            type: 'SHOW',
            conditional: {
              type: 'object',
              properties: {
                'child.dob': {
                  type: 'string',
                  format: 'date',
                  formatMaximum: oneYearAgoStr
                }
              },
              required: ['child.dob']
            } as unknown as JSONSchema
          }
        ]
      }

      mockTemplates = [dateConditionalTemplate]

      const { useCertificateTemplateSelectorFieldConfig } = await import(
        './useCertificateTemplateSelectorFieldConfig'
      )

      const result = useCertificateTemplateSelectorFieldConfig(
        'tennis-club-membership',
        oneYearAgoDeclaration,
        testEventDocument
      ) as SelectField

      expect(result.options).toHaveLength(1)
      expect(result.options[0].value).toBe(
        'tennis-club-membership-certificate-date'
      )
    })
  })

  describe('Event metadata-based conditionals', () => {
    it('should show certificate when event metadata conditional is met', async () => {
      mockTemplates = [
        tennisClubMembershipCertificateWithoutConditionals,
        tennisClubMembershipCertificateWithMetaConditionals
      ]

      const { useCertificateTemplateSelectorFieldConfig } = await import(
        './useCertificateTemplateSelectorFieldConfig'
      )

      const result = useCertificateTemplateSelectorFieldConfig(
        'tennis-club-membership',
        testDeclarationFormData,
        testEventDocument
      ) as SelectField

      // Should include both certificates since status is REGISTERED in test event data
      expect(result.options).toHaveLength(2)

      const certificateIds = result.options.map((opt) => opt.value)
      expect(certificateIds).toContain('tennis-club-membership-certificate')
      expect(certificateIds).toContain(
        'tennis-club-membership-certificate-meta-conditionals'
      )
    })

    it('should handle missing event document gracefully for meta conditionals', async () => {
      mockTemplates = [
        tennisClubMembershipCertificateWithoutConditionals,
        tennisClubMembershipCertificateWithMetaConditionals
      ]

      const { useCertificateTemplateSelectorFieldConfig } = await import(
        './useCertificateTemplateSelectorFieldConfig'
      )

      const result = useCertificateTemplateSelectorFieldConfig(
        'tennis-club-membership',
        testDeclarationFormData
        // No event document provided
      ) as SelectField

      // Should only include the basic certificate since meta conditionals require event document
      expect(result.options).toHaveLength(1)
      expect(result.options[0].value).toBe('tennis-club-membership-certificate')
    })
  })

  describe('Complex scenarios', () => {
    it('should handle multiple certificates with mixed conditional types', async () => {
      mockTemplates = [
        tennisClubMembershipCertificateWithoutConditionals,
        tennisClubMembershipCertificateWithFormConditionals,
        tennisClubMembershipCertificateWithMetaConditionals
      ]

      const { useCertificateTemplateSelectorFieldConfig } = await import(
        './useCertificateTemplateSelectorFieldConfig'
      )

      const result = useCertificateTemplateSelectorFieldConfig(
        'tennis-club-membership',
        testDeclarationFormData,
        testEventDocument
      ) as SelectField

      // Should include all certificates since both conditionals are met
      expect(result.options).toHaveLength(3)

      const certificateIds = result.options.map((opt) => opt.value)
      expect(certificateIds).toContain('tennis-club-membership-certificate')
      expect(certificateIds).toContain(
        'tennis-club-membership-certificate-form-conditionals'
      )
      expect(certificateIds).toContain(
        'tennis-club-membership-certificate-meta-conditionals'
      )
    })

    it('should filter out certificates with failing conditionals while keeping valid ones', async () => {
      mockTemplates = [
        tennisClubMembershipCertificateWithoutConditionals,
        tennisClubMembershipCertificateWithFormConditionals, // Should pass
        tennisClubMembershipCertificateWithFailingFormConditionals, // Should fail
        tennisClubMembershipCertificateWithMetaConditionals // Should pass
      ]

      const { useCertificateTemplateSelectorFieldConfig } = await import(
        './useCertificateTemplateSelectorFieldConfig'
      )

      const result = useCertificateTemplateSelectorFieldConfig(
        'tennis-club-membership',
        testDeclarationFormData,
        testEventDocument
      ) as SelectField

      // Should include 3 certificates (excluding the failing one)
      expect(result.options).toHaveLength(3)

      const certificateIds = result.options.map((opt) => opt.value)
      expect(certificateIds).toContain('tennis-club-membership-certificate')
      expect(certificateIds).toContain(
        'tennis-club-membership-certificate-form-conditionals'
      )
      expect(certificateIds).toContain(
        'tennis-club-membership-certificate-meta-conditionals'
      )
      expect(certificateIds).not.toContain(
        'tennis-club-membership-certificate-failing-form'
      )
    })
  })

  describe('Field configuration structure', () => {
    it('should return correct field configuration structure', async () => {
      mockTemplates = [tennisClubMembershipCertificateWithoutConditionals]

      const { useCertificateTemplateSelectorFieldConfig } = await import(
        './useCertificateTemplateSelectorFieldConfig'
      )

      const result = useCertificateTemplateSelectorFieldConfig(
        'tennis-club-membership',
        testDeclarationFormData,
        testEventDocument
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
        defaultValue: 'tennis-club-membership-certificate',
        options: [
          {
            label: {
              id: 'certificates.tennis-club-membership.certificate.basic',
              defaultMessage: 'Tennis Club Membership Certificate',
              description:
                'The label for a basic tennis club membership certificate'
            },
            value: 'tennis-club-membership-certificate'
          }
        ]
      })
    })
  })
})
