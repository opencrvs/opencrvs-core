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
  event,
  FullDocumentPath,
  SelectField,
  TokenUserType,
  UUID
} from '@opencrvs/commons/client'

import {
  tennisClubMembershipCertificateWithMultiplePrintConditionals,
  tennisClubMembershipCertificateWithoutConditionals,
  tennisClubMembershipCertificateWithPrintCountConditionals,
  tennisClubMembershipDuplicateCertificate,
  tennisClubMembershipReplacementCertificate,
  testDeclarationFormData,
  testEventDocument
} from '../../../tests/v2-events/certificateTestData'

// Mock templates array
let mockTemplates: CertificateTemplateConfig[] = []

const mockUser = {
  id: '67bda93bfc07dee78ae558cf',
  name: [
    {
      use: 'en',
      given: ['Kalusha'],
      family: 'Bwalya'
    }
  ],
  scope: ['record.register', 'record.registration-correct'],
  role: 'SOCIAL_WORKER',
  exp: '1739881718',
  algorithm: 'RS256',
  userType: TokenUserType.enum.user,
  signature: 'signature.png' as FullDocumentPath,
  sub: '677b33fea7efb08730f3abfa33',
  avatar: undefined,
  primaryOfficeId: '028d2c85-ca31-426d-b5d1-2cef545a4902' as UUID
}

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

  describe('Print action conditionals', () => {
    it('should show only basic template when template requires print actions but none exist', async () => {
      mockTemplates = [
        tennisClubMembershipCertificateWithoutConditionals,
        tennisClubMembershipCertificateWithPrintCountConditionals
      ]

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
    })

    it('should show only basic template when template requires multiple print actions but only one exists', async () => {
      const { ActionType, generateActionDocument, tennisClubMembershipEvent } =
        await import('@opencrvs/commons/client')

      mockTemplates = [
        tennisClubMembershipCertificateWithoutConditionals,
        tennisClubMembershipCertificateWithMultiplePrintConditionals
      ]

      const printAction = generateActionDocument({
        configuration: tennisClubMembershipEvent,
        action: ActionType.PRINT_CERTIFICATE,
        context: { user: mockUser }
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

      expect(result.options).toHaveLength(1)
      expect(result.options[0].value).toBe('tennis-club-membership-certificate')
    })
  })

  describe('Template visibility and conditional logic', () => {
    it('shows all templates when none have conditional visibility rules', async () => {
      mockTemplates = [
        tennisClubMembershipCertificateWithoutConditionals,
        tennisClubMembershipReplacementCertificate
      ]

      const { useCertificateTemplateSelectorFieldConfig } = await import(
        './useCertificateTemplateSelectorFieldConfig'
      )

      const result = useCertificateTemplateSelectorFieldConfig(
        'tennis-club-membership',
        testDeclarationFormData,
        testEventDocument
      ) as SelectField

      expect(result.options).toHaveLength(2)
      const certificateIds = result.options.map((opt) => opt.value)
      expect(certificateIds).toContain('tennis-club-membership-certificate')
      expect(certificateIds).toContain(
        'tennis-club-membership-replacement-certificate'
      )
      expect(result.defaultValue).toBe('tennis-club-membership-certificate')
      expect(result.type).toBe('SELECT')
      expect(result.id).toBe('certificateTemplateId')
      expect(result.required).toBe(true)
    })

    it('hides conditional template when print count exceeds maximum allowed', async () => {
      const conditionalTemplate = {
        ...tennisClubMembershipReplacementCertificate,
        conditionals: [
          {
            type: 'SHOW',
            conditional: event
              .hasAction('PRINT_CERTIFICATE')
              .withTemplate('tennis-club-membership-certificate')
              .maxCount(1)
          }
        ]
      } as CertificateTemplateConfig

      mockTemplates = [
        tennisClubMembershipCertificateWithoutConditionals,
        conditionalTemplate
      ]

      const { ActionType, generateActionDocument, tennisClubMembershipEvent } =
        await import('@opencrvs/commons/client')

      // Create two print actions to exceed maxCount(1)
      const printAction1 = generateActionDocument({
        configuration: tennisClubMembershipEvent,
        action: ActionType.PRINT_CERTIFICATE,
        defaults: {
          content: { templateId: 'tennis-club-membership-certificate' }
        },
        context: { user: mockUser }
      })
      const printAction2 = generateActionDocument({
        configuration: tennisClubMembershipEvent,
        action: ActionType.PRINT_CERTIFICATE,
        defaults: {
          content: {
            templateId: 'tennis-club-membership-certificate'
          }
        },
        context: { user: mockUser }
      })

      const eventWithExcessivePrints = {
        ...testEventDocument,
        actions: [...testEventDocument.actions, printAction1, printAction2]
      }

      const { useCertificateTemplateSelectorFieldConfig } = await import(
        './useCertificateTemplateSelectorFieldConfig'
      )

      const result = useCertificateTemplateSelectorFieldConfig(
        'tennis-club-membership',
        testDeclarationFormData,
        eventWithExcessivePrints
      ) as SelectField

      // Should only show basic template since conditional template exceeds maxCount
      expect(result.options).toHaveLength(1)
      expect(result.options[0].value).toBe('tennis-club-membership-certificate')
    })

    it('shows conditional template when required print action exists', async () => {
      const conditionalTemplate = {
        ...tennisClubMembershipReplacementCertificate,
        conditionals: [
          {
            type: 'SHOW',
            conditional: event
              .hasAction('PRINT_CERTIFICATE')
              .withTemplate('tennis-club-membership-certificate')
              .minCount(1)
          }
        ]
      } as CertificateTemplateConfig

      mockTemplates = [
        tennisClubMembershipCertificateWithoutConditionals,
        conditionalTemplate
      ]

      const { ActionType, generateActionDocument, tennisClubMembershipEvent } =
        await import('@opencrvs/commons/client')
      const printBasicAction = generateActionDocument({
        configuration: tennisClubMembershipEvent,
        action: ActionType.PRINT_CERTIFICATE,
        defaults: {
          content: { templateId: 'tennis-club-membership-certificate' }
        },
        context: { user: mockUser }
      })
      const eventWithBasicPrint = {
        ...testEventDocument,
        actions: [...testEventDocument.actions, printBasicAction]
      }

      const { useCertificateTemplateSelectorFieldConfig } = await import(
        './useCertificateTemplateSelectorFieldConfig'
      )

      const result = useCertificateTemplateSelectorFieldConfig(
        'tennis-club-membership',
        testDeclarationFormData,
        eventWithBasicPrint
      ) as SelectField

      expect(result.options).toHaveLength(2)
      const certificateIds = result.options.map((opt) => opt.value)
      expect(certificateIds).toContain('tennis-club-membership-certificate')
      expect(certificateIds).toContain(
        'tennis-club-membership-replacement-certificate'
      )
    })

    it('shows multiple print conditional template when minimum print count is reached', async () => {
      mockTemplates = [
        tennisClubMembershipCertificateWithoutConditionals,
        tennisClubMembershipCertificateWithMultiplePrintConditionals
      ]

      const { ActionType, generateActionDocument, tennisClubMembershipEvent } =
        await import('@opencrvs/commons/client')

      const printAction1 = generateActionDocument({
        configuration: tennisClubMembershipEvent,
        action: ActionType.PRINT_CERTIFICATE,
        context: { user: mockUser }
      })

      const printAction2 = generateActionDocument({
        configuration: tennisClubMembershipEvent,
        action: ActionType.PRINT_CERTIFICATE,
        context: { user: mockUser }
      })

      const eventWithTwoPrintActions = {
        ...testEventDocument,
        actions: [...testEventDocument.actions, printAction1, printAction2]
      }

      const { useCertificateTemplateSelectorFieldConfig } = await import(
        './useCertificateTemplateSelectorFieldConfig'
      )

      const result = useCertificateTemplateSelectorFieldConfig(
        'tennis-club-membership',
        testDeclarationFormData,
        eventWithTwoPrintActions
      ) as SelectField

      expect(result.options).toHaveLength(2)
      const certificateIds = result.options.map((opt) => opt.value)
      expect(certificateIds).toContain('tennis-club-membership-certificate')
      expect(certificateIds).toContain(
        'tennis-club-membership-certificate-multiple-print'
      )
    })

    it('shows template with specific template ID print action conditional', async () => {
      const templateWithSpecificPrintConditional = {
        ...tennisClubMembershipDuplicateCertificate,
        conditionals: [
          {
            type: 'SHOW' as const,
            conditional: event
              .hasAction('PRINT_CERTIFICATE')
              .withTemplate('tennis-club-membership-certificate')
              .minCount(1)
          }
        ]
      }

      mockTemplates = [
        tennisClubMembershipCertificateWithoutConditionals,
        templateWithSpecificPrintConditional
      ]

      const { ActionType, generateActionDocument, tennisClubMembershipEvent } =
        await import('@opencrvs/commons/client')

      const printAction = generateActionDocument({
        configuration: tennisClubMembershipEvent,
        action: ActionType.PRINT_CERTIFICATE,
        defaults: {
          content: {
            templateId: 'tennis-club-membership-certificate'
          }
        },
        context: { user: mockUser }
      })

      const eventWithSpecificPrint = {
        ...testEventDocument,
        actions: [...testEventDocument.actions, printAction]
      }

      const { useCertificateTemplateSelectorFieldConfig } = await import(
        './useCertificateTemplateSelectorFieldConfig'
      )

      const result = useCertificateTemplateSelectorFieldConfig(
        'tennis-club-membership',
        testDeclarationFormData,
        eventWithSpecificPrint
      ) as SelectField

      expect(result.options).toHaveLength(2)
      const certificateIds = result.options.map((opt) => opt.value)
      expect(certificateIds).toContain('tennis-club-membership-certificate')
      expect(certificateIds).toContain(
        'tennis-club-membership-duplicate-certificate'
      )
    })
  })
})
