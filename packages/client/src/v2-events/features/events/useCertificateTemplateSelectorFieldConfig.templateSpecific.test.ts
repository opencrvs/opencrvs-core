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

import {
  testDeclarationFormData,
  testEventDocument,
  tennisClubMembershipCertificateWithoutConditionals,
  tennisClubMembershipReplacementCertificate,
  tennisClubMembershipThirdCopyCertificate,
  tennisClubMembershipDuplicateCertificate,
  tennisClubMembershipReorderCertificate
} from './testData'

// Mock templates array
let mockTemplates: CertificateTemplateConfig[] = []

// Mock the useAppConfig hook
vi.mock('@client/v2-events/hooks/useAppConfig', () => ({
  useAppConfig: () => ({
    certificateTemplates: mockTemplates
  })
}))

describe('useCertificateTemplateSelectorFieldConfig - Template-Specific Print Count Conditionals', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    mockTemplates = []
  })

  it('should show replacement certificate only after the basic template has been printed', async () => {
    const { ActionType, generateActionDocument, tennisClubMembershipEvent } =
      await import('@opencrvs/commons/client')

    mockTemplates = [
      tennisClubMembershipCertificateWithoutConditionals,
      tennisClubMembershipReplacementCertificate
    ]

    // Create event with a print action for the basic template
    const printBasicAction = generateActionDocument({
      configuration: tennisClubMembershipEvent,
      action: ActionType.PRINT_CERTIFICATE,
      defaults: { templateId: 'tennis-club-membership-certificate' }
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

    // Should show both basic and replacement certificates
    expect(result.options).toHaveLength(2)
    const certificateIds = result.options.map((opt) => opt.value)
    expect(certificateIds).toContain('tennis-club-membership-certificate')
    expect(certificateIds).toContain(
      'tennis-club-membership-replacement-certificate'
    )
  })

  it('should hide replacement certificate when basic template has not been printed', async () => {
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
      testEventDocument // No print actions
    ) as SelectField

    // Should only show the basic certificate
    expect(result.options).toHaveLength(1)
    expect(result.options[0].value).toBe('tennis-club-membership-certificate')
  })

  it('should show third copy certificate only after basic template has been printed 2+ times', async () => {
    const { ActionType, generateActionDocument, tennisClubMembershipEvent } =
      await import('@opencrvs/commons/client')

    mockTemplates = [
      tennisClubMembershipCertificateWithoutConditionals,
      tennisClubMembershipThirdCopyCertificate
    ]

    // Create event with 2 print actions for the basic template
    const printBasicAction1 = generateActionDocument({
      configuration: tennisClubMembershipEvent,
      action: ActionType.PRINT_CERTIFICATE,
      defaults: { templateId: 'tennis-club-membership-certificate' }
    })

    const printBasicAction2 = generateActionDocument({
      configuration: tennisClubMembershipEvent,
      action: ActionType.PRINT_CERTIFICATE,
      defaults: { templateId: 'tennis-club-membership-certificate' }
    })

    const eventWithTwoBasicPrints = {
      ...testEventDocument,
      actions: [
        ...testEventDocument.actions,
        printBasicAction1,
        printBasicAction2
      ]
    }

    const { useCertificateTemplateSelectorFieldConfig } = await import(
      './useCertificateTemplateSelectorFieldConfig'
    )

    const result = useCertificateTemplateSelectorFieldConfig(
      'tennis-club-membership',
      testDeclarationFormData,
      eventWithTwoBasicPrints
    ) as SelectField

    // Should show both basic and third copy certificates
    expect(result.options).toHaveLength(2)
    const certificateIds = result.options.map((opt) => opt.value)
    expect(certificateIds).toContain('tennis-club-membership-certificate')
    expect(certificateIds).toContain(
      'tennis-club-membership-third-copy-certificate'
    )
  })

  it('should hide third copy certificate when basic template has been printed only once', async () => {
    const { ActionType, generateActionDocument, tennisClubMembershipEvent } =
      await import('@opencrvs/commons/client')

    mockTemplates = [
      tennisClubMembershipCertificateWithoutConditionals,
      tennisClubMembershipThirdCopyCertificate
    ]

    // Create event with only 1 print action for the basic template
    const printBasicAction = generateActionDocument({
      configuration: tennisClubMembershipEvent,
      action: ActionType.PRINT_CERTIFICATE,
      defaults: { templateId: 'tennis-club-membership-certificate' }
    })

    const eventWithOneBasicPrint = {
      ...testEventDocument,
      actions: [...testEventDocument.actions, printBasicAction]
    }

    const { useCertificateTemplateSelectorFieldConfig } = await import(
      './useCertificateTemplateSelectorFieldConfig'
    )

    const result = useCertificateTemplateSelectorFieldConfig(
      'tennis-club-membership',
      testDeclarationFormData,
      eventWithOneBasicPrint
    ) as SelectField

    // Should only show the basic certificate (third copy requires 2+ prints)
    expect(result.options).toHaveLength(1)
    expect(result.options[0].value).toBe('tennis-club-membership-certificate')
  })

  it('should show certified copy certificate only after the basic template has been printed', async () => {
    const { ActionType, generateActionDocument, tennisClubMembershipEvent } =
      await import('@opencrvs/commons/client')

    mockTemplates = [
      tennisClubMembershipCertificateWithoutConditionals,
      tennisClubMembershipDuplicateCertificate
    ]

    // Create event with a print action for the basic template
    const printBasicAction = generateActionDocument({
      configuration: tennisClubMembershipEvent,
      action: ActionType.PRINT_CERTIFICATE,
      defaults: { templateId: 'tennis-club-membership-certificate' }
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

    // Should show both basic and certified copy certificates
    expect(result.options).toHaveLength(2)
    const certificateIds = result.options.map((opt) => opt.value)
    expect(certificateIds).toContain('tennis-club-membership-certificate')
    expect(certificateIds).toContain(
      'tennis-club-membership-duplicate-certificate'
    )
  })

  it('should handle mixed template print conditions correctly', async () => {
    const { ActionType, generateActionDocument, tennisClubMembershipEvent } =
      await import('@opencrvs/commons/client')

    mockTemplates = [
      tennisClubMembershipCertificateWithoutConditionals,
      tennisClubMembershipReplacementCertificate, // Requires 1+ basic prints
      tennisClubMembershipThirdCopyCertificate, // Requires 2+ basic prints
      tennisClubMembershipDuplicateCertificate // Requires 1+ basic prints (certified copy)
    ]

    // Create event with 2 basic prints
    const printBasicAction1 = generateActionDocument({
      configuration: tennisClubMembershipEvent,
      action: ActionType.PRINT_CERTIFICATE,
      defaults: { templateId: 'tennis-club-membership-certificate' }
    })

    const printBasicAction2 = generateActionDocument({
      configuration: tennisClubMembershipEvent,
      action: ActionType.PRINT_CERTIFICATE,
      defaults: { templateId: 'tennis-club-membership-certificate' }
    })

    const eventWithTwoBasicPrints = {
      ...testEventDocument,
      actions: [
        ...testEventDocument.actions,
        printBasicAction1,
        printBasicAction2
      ]
    }

    const { useCertificateTemplateSelectorFieldConfig } = await import(
      './useCertificateTemplateSelectorFieldConfig'
    )

    const result = useCertificateTemplateSelectorFieldConfig(
      'tennis-club-membership',
      testDeclarationFormData,
      eventWithTwoBasicPrints
    ) as SelectField

    // Should show all 4 certificates:
    // - basic (always shown)
    // - replacement (1+ basic prints: ✓)
    // - third copy (2+ basic prints: ✓)
    // - certified copy (1+ basic prints: ✓)
    expect(result.options).toHaveLength(4)
    const certificateIds = result.options.map((opt) => opt.value)
    expect(certificateIds).toContain('tennis-club-membership-certificate')
    expect(certificateIds).toContain(
      'tennis-club-membership-replacement-certificate'
    )
    expect(certificateIds).toContain(
      'tennis-club-membership-third-copy-certificate'
    )
    expect(certificateIds).toContain(
      'tennis-club-membership-duplicate-certificate'
    )
  })

  it('should not show template-specific conditionals for different templates', async () => {
    const { ActionType, generateActionDocument, tennisClubMembershipEvent } =
      await import('@opencrvs/commons/client')

    mockTemplates = [
      tennisClubMembershipCertificateWithoutConditionals,
      tennisClubMembershipReplacementCertificate // Requires basic template prints
    ]

    // Create event with print of a different template ID
    const printDifferentAction = generateActionDocument({
      configuration: tennisClubMembershipEvent,
      action: ActionType.PRINT_CERTIFICATE,
      defaults: { templateId: 'some-other-template-id' }
    })

    // Verify the action was created correctly
    expect(
      'templateId' in printDifferentAction
        ? printDifferentAction.templateId
        : 'missing'
    ).toBe('some-other-template-id')

    const eventWithDifferentPrint = {
      ...testEventDocument,
      actions: [...testEventDocument.actions, printDifferentAction]
    }

    const { useCertificateTemplateSelectorFieldConfig } = await import(
      './useCertificateTemplateSelectorFieldConfig'
    )

    const result = useCertificateTemplateSelectorFieldConfig(
      'tennis-club-membership',
      testDeclarationFormData,
      eventWithDifferentPrint
    ) as SelectField

    // Should only show basic certificate (replacement requires specific template ID)
    expect(result.options).toHaveLength(1)
    expect(result.options[0].value).toBe('tennis-club-membership-certificate')

    // Double-check that replacement certificate is NOT included
    const certificateIds = result.options.map((opt) => opt.value)
    expect(certificateIds).not.toContain(
      'tennis-club-membership-replacement-certificate'
    )
    expect(result.options[0].value).toBe('tennis-club-membership-certificate')
  })

  it('should handle template availability based on print history (bootstrap scenario)', async () => {
    const { ActionType, generateActionDocument, tennisClubMembershipEvent } =
      await import('@opencrvs/commons/client')

    mockTemplates = [
      tennisClubMembershipCertificateWithoutConditionals,
      tennisClubMembershipReplacementCertificate, // Shows after basic has been printed
      tennisClubMembershipThirdCopyCertificate // Shows after basic has been printed 2+ times
    ]

    // Step 1: Initially, only basic certificate is available
    const { useCertificateTemplateSelectorFieldConfig } = await import(
      './useCertificateTemplateSelectorFieldConfig'
    )

    const initialResult = useCertificateTemplateSelectorFieldConfig(
      'tennis-club-membership',
      testDeclarationFormData,
      testEventDocument // No print actions
    ) as SelectField

    // Should only show the basic certificate initially
    expect(initialResult.options).toHaveLength(1)
    expect(initialResult.options[0].value).toBe(
      'tennis-club-membership-certificate'
    )

    // Step 2: After basic certificate has been printed once
    const printBasicAction = generateActionDocument({
      configuration: tennisClubMembershipEvent,
      action: ActionType.PRINT_CERTIFICATE,
      defaults: { templateId: 'tennis-club-membership-certificate' }
    })

    const eventWithBasicPrint = {
      ...testEventDocument,
      actions: [...testEventDocument.actions, printBasicAction]
    }

    const resultAfterBasicPrint = useCertificateTemplateSelectorFieldConfig(
      'tennis-club-membership',
      testDeclarationFormData,
      eventWithBasicPrint
    ) as SelectField

    // Should now show basic and replacement certificates
    expect(resultAfterBasicPrint.options).toHaveLength(2)
    const certificateIds = resultAfterBasicPrint.options.map((opt) => opt.value)
    expect(certificateIds).toContain('tennis-club-membership-certificate')
    expect(certificateIds).toContain(
      'tennis-club-membership-replacement-certificate'
    )

    // Step 3: After basic certificate has been printed twice
    const printBasicAction2 = generateActionDocument({
      configuration: tennisClubMembershipEvent,
      action: ActionType.PRINT_CERTIFICATE,
      defaults: { templateId: 'tennis-club-membership-certificate' }
    })

    const eventWithTwoBasicPrints = {
      ...testEventDocument,
      actions: [
        ...testEventDocument.actions,
        printBasicAction,
        printBasicAction2
      ]
    }

    const resultAfterTwoBasicPrints = useCertificateTemplateSelectorFieldConfig(
      'tennis-club-membership',
      testDeclarationFormData,
      eventWithTwoBasicPrints
    ) as SelectField

    // Should now show all three certificates
    expect(resultAfterTwoBasicPrints.options).toHaveLength(3)
    const allCertificateIds = resultAfterTwoBasicPrints.options.map(
      (opt) => opt.value
    )
    expect(allCertificateIds).toContain('tennis-club-membership-certificate')
    expect(allCertificateIds).toContain(
      'tennis-club-membership-replacement-certificate'
    )
    expect(allCertificateIds).toContain(
      'tennis-club-membership-third-copy-certificate'
    )
  })
})
