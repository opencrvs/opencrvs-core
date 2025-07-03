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
  SelectField
} from '@opencrvs/commons/client'

// Import all test data from the separate file
import {
  testDeclaration,
  testEvent,
  tennisClubMembershipCertificateWithoutConditionals,
  tennisClubMembershipCertificateWithFormConditionals,
  tennisClubMembershipCertificateWithMetaConditionals,
  tennisClubMembershipCertificateWithFailingFormConditionals
} from './testData'

let mockTemplates: CertificateTemplateConfig[] = []

describe('useCertificateTemplateSelectorFieldConfig - Debug Tests with Real Data', () => {
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

  describe('Certificate templates without conditionals', () => {
    it('should return basic certificate when no conditionals are present', async () => {
      mockTemplates = [tennisClubMembershipCertificateWithoutConditionals]

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
      expect(result.defaultValue).toBe(
        'tennis-club-membership-certificate-basic'
      )
      expect(result.type).toBe('SELECT')
      expect(result.id).toBe('certificateTemplateId')
      expect(result.required).toBe(true)
    })
  })

  describe('Certificate templates with form-based conditionals', () => {
    it('should show premium certificate when form conditional is met (recommender.none = true)', async () => {
      mockTemplates = [
        tennisClubMembershipCertificateWithoutConditionals,
        tennisClubMembershipCertificateWithFormConditionals
      ]

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

      const certificateIds = result.options.map((opt) => opt.value)
      expect(certificateIds).toContain(
        'tennis-club-membership-certificate-basic'
      )
      expect(certificateIds).toContain(
        'tennis-club-membership-certificate-premium'
      )

      // Default should still be the basic certificate
      expect(result.defaultValue).toBe(
        'tennis-club-membership-certificate-basic'
      )
    })

    it('should hide certificate when form conditional fails (recommender.none = false)', async () => {
      mockTemplates = [
        tennisClubMembershipCertificateWithoutConditionals,
        tennisClubMembershipCertificateWithFailingFormConditionals
      ]

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
  })

  describe('Certificate templates with meta-based conditionals', () => {
    it('should show registered certificate when meta conditional is met', async () => {
      mockTemplates = [
        tennisClubMembershipCertificateWithoutConditionals,
        tennisClubMembershipCertificateWithMetaConditionals
      ]

      const { useCertificateTemplateSelectorFieldConfig } = await import(
        './useCertificateTemplateSelectorFieldConfig'
      )

      const result = useCertificateTemplateSelectorFieldConfig(
        'tennis-club-membership',
        testDeclaration,
        testEvent
      ) as SelectField

      // Should include both certificates since status is REGISTERED in test event data
      expect(result.options).toHaveLength(2)

      const certificateIds = result.options.map((opt) => opt.value)
      expect(certificateIds).toContain(
        'tennis-club-membership-certificate-basic'
      )
      expect(certificateIds).toContain(
        'tennis-club-membership-certificate-registered'
      )

      expect(result.defaultValue).toBe(
        'tennis-club-membership-certificate-basic'
      )
    })
  })

  describe('Complex scenarios with multiple conditionals', () => {
    it('should show all certificates when all conditionals are met', async () => {
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
        testDeclaration,
        testEvent
      ) as SelectField

      // Should include all certificates since both conditionals are met
      expect(result.options).toHaveLength(3)
      expect(result.defaultValue).toBe(
        'tennis-club-membership-certificate-basic'
      )

      const certificateIds = result.options.map((opt) => opt.value)
      expect(certificateIds).toContain(
        'tennis-club-membership-certificate-basic'
      )
      expect(certificateIds).toContain(
        'tennis-club-membership-certificate-premium'
      )
      expect(certificateIds).toContain(
        'tennis-club-membership-certificate-registered'
      )
    })

    it('should filter out certificates with failing conditionals while keeping valid ones', async () => {
      mockTemplates = [
        tennisClubMembershipCertificateWithoutConditionals,
        tennisClubMembershipCertificateWithFormConditionals, // This should pass
        tennisClubMembershipCertificateWithFailingFormConditionals, // This should fail
        tennisClubMembershipCertificateWithMetaConditionals // This should pass
      ]

      const { useCertificateTemplateSelectorFieldConfig } = await import(
        './useCertificateTemplateSelectorFieldConfig'
      )

      const result = useCertificateTemplateSelectorFieldConfig(
        'tennis-club-membership',
        testDeclaration,
        testEvent
      ) as SelectField

      // Should include basic, premium, and registered certificates
      // but NOT the failing certificate
      expect(result.options).toHaveLength(3)

      const certificateIds = result.options.map((opt) => opt.value)
      expect(certificateIds).toContain(
        'tennis-club-membership-certificate-basic'
      )
      expect(certificateIds).toContain(
        'tennis-club-membership-certificate-premium'
      )
      expect(certificateIds).toContain(
        'tennis-club-membership-certificate-registered'
      )
      expect(certificateIds).not.toContain(
        'tennis-club-membership-certificate-failing'
      )
    })
  })

  describe('Field configuration structure', () => {
    it('should return correct field configuration structure with proper labeling', async () => {
      mockTemplates = [tennisClubMembershipCertificateWithoutConditionals]

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

  describe('Edge cases', () => {
    it('should return empty options when no certificates match the event type', async () => {
      mockTemplates = [tennisClubMembershipCertificateWithoutConditionals]

      const { useCertificateTemplateSelectorFieldConfig } = await import(
        './useCertificateTemplateSelectorFieldConfig'
      )

      const result = useCertificateTemplateSelectorFieldConfig(
        'birth', // Different event type
        testDeclaration,
        testEvent
      ) as SelectField

      expect(result.options).toHaveLength(0)
      expect(result.defaultValue).toBeUndefined()
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
        testDeclaration
        // No event document provided
      ) as SelectField

      // Should only include the basic certificate since meta conditionals require event document
      expect(result.options).toHaveLength(1)
      expect(result.options[0].value).toBe(
        'tennis-club-membership-certificate-basic'
      )
    })
  })
})
