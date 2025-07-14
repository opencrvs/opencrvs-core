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

import {
  testDeclarationFormData,
  testEventDocument,
  testEventDocumentWithMultiplePrints,
  tennisClubMembershipCertificateWithoutConditionals,
  tennisClubMembershipCertificateWithFormConditionals,
  tennisClubMembershipCertificateWithMetaConditionals,
  tennisClubMembershipCertificateWithFailingFormConditionals,
  tennisClubMembershipCertificateWithPrintCountConditionals,
  tennisClubMembershipCertificateWithMultiplePrintConditionals
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

    it('should show certificate when date conditional is satisfied', async () => {
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

    it('should show certificate when print action exists', async () => {
      const { ActionType, generateActionDocument, tennisClubMembershipEvent } =
        await import('@opencrvs/commons/client')

      mockTemplates = [
        tennisClubMembershipCertificateWithoutConditionals,
        tennisClubMembershipCertificateWithPrintCountConditionals
      ]

      const eventWithPrintAction = testEventDocumentWithMultiplePrints

      const { useCertificateTemplateSelectorFieldConfig } = await import(
        './useCertificateTemplateSelectorFieldConfig'
      )

      const result = useCertificateTemplateSelectorFieldConfig(
        'tennis-club-membership',
        testDeclarationFormData,
        eventWithPrintAction
      ) as SelectField

      // Should include both certificates since there is a PRINT_CERTIFICATE action
      expect(result.options).toHaveLength(2)

      const certificateIds = result.options.map((opt) => opt.value)
      expect(certificateIds).toContain('tennis-club-membership-certificate')
      expect(certificateIds).toContain(
        'tennis-club-membership-certificate-print-count'
      )
    })

    it('should hide certificate when no print actions exist', async () => {
      mockTemplates = [
        tennisClubMembershipCertificateWithoutConditionals,
        tennisClubMembershipCertificateWithPrintCountConditionals
      ]

      // Use the original test event document (no PRINT_CERTIFICATE actions)
      const { useCertificateTemplateSelectorFieldConfig } = await import(
        './useCertificateTemplateSelectorFieldConfig'
      )

      const result = useCertificateTemplateSelectorFieldConfig(
        'tennis-club-membership',
        testDeclarationFormData,
        testEventDocument
      ) as SelectField

      // Should only include the basic certificate since there are no PRINT_CERTIFICATE actions
      expect(result.options).toHaveLength(1)
      expect(result.options[0].value).toBe('tennis-club-membership-certificate')
    })

    it('should show certificate only when at least 2 print actions exist (using minContains)', async () => {
      mockTemplates = [
        tennisClubMembershipCertificateWithoutConditionals,
        tennisClubMembershipCertificateWithMultiplePrintConditionals
      ]

      const { useCertificateTemplateSelectorFieldConfig } = await import(
        './useCertificateTemplateSelectorFieldConfig'
      )

      // Test with event that has 2 print actions (should show the template)
      const result = useCertificateTemplateSelectorFieldConfig(
        'tennis-club-membership',
        testDeclarationFormData,
        testEventDocumentWithMultiplePrints
      ) as SelectField

      expect(result.options).toHaveLength(2)
      const certificateIds = result.options.map((opt) => opt.value)
      expect(certificateIds).toContain('tennis-club-membership-certificate')
      expect(certificateIds).toContain(
        'tennis-club-membership-certificate-multiple-print'
      )
    })

    it('should hide certificate when only 1 print action exists (using minContains)', async () => {
      const { ActionType, generateActionDocument, tennisClubMembershipEvent } =
        await import('@opencrvs/commons/client')

      mockTemplates = [
        tennisClubMembershipCertificateWithoutConditionals,
        tennisClubMembershipCertificateWithMultiplePrintConditionals
      ]

      // Create event document with only 1 print action
      const printAction = generateActionDocument({
        configuration: tennisClubMembershipEvent,
        action: ActionType.PRINT_CERTIFICATE
      })

      const eventDocumentWithOnePrint = {
        ...testEventDocument,
        actions: [...testEventDocument.actions, printAction]
      }

      const { useCertificateTemplateSelectorFieldConfig } = await import(
        './useCertificateTemplateSelectorFieldConfig'
      )

      const result = useCertificateTemplateSelectorFieldConfig(
        'tennis-club-membership',
        testDeclarationFormData,
        eventDocumentWithOnePrint
      ) as SelectField

      // Should only show the basic certificate, not the multiple-print one
      expect(result.options).toHaveLength(1)
      expect(result.options[0].value).toBe('tennis-club-membership-certificate')
    })
  })
})
