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

import formatISO from 'date-fns/formatISO'
import {
  CertificateTemplateConfig,
  JSONSchema,
  ActionType,
  generateEventDocument,
  tennisClubMembershipEvent,
  EventDocument,
  ActionStatus
} from '@opencrvs/commons/client'

// Test event document with proper structure using generateEventDocument
export const testEventDocument = generateEventDocument({
  configuration: tennisClubMembershipEvent,
  actions: [ActionType.CREATE, ActionType.REGISTER]
})

// Test declaration data (form data) - EventState structure (flat record)
export const testDeclarationFormData = {
  // Child data - flattened to conform to EventState type
  'child.firstNamesEng': 'Baby',
  'child.familyNameEng': 'Test',
  'child.gender': 'male',
  'child.birthDate': '2024-01-01',
  'child.multipleBirth': 1,
  'child.birthType': 'SINGLE',
  'child.weightAtBirth': '3.5',
  'child.attendantAtBirth': 'PHYSICIAN',
  'child.childBirthDate': '2024-01-01',
  'child.placeOfBirth': 'HEALTH_FACILITY',
  'child.birthLocation': 'Hospital XYZ',
  'child.country': 'FAR',
  'child.state': 'Pualula',
  'child.district': 'Sulaka',
  'child.city': 'Zobole',
  'child.addressLine1': '40 Sulaka rd',

  // Informant data - flattened
  'informant.relationship': 'MOTHER',
  'informant.firstNamesEng': 'Jane',
  'informant.familyNameEng': 'Doe',
  'informant.nationality': 'FAR',
  'informant.birthDate': '1990-01-01',
  'informant.maritalStatus': 'MARRIED',
  'informant.occupation': 'Teacher',

  // Mother data - flattened
  'mother.firstNamesEng': 'Jane',
  'mother.familyNameEng': 'Doe',
  'mother.nationality': 'FAR',
  'mother.birthDate': '1990-01-01',
  'mother.maritalStatus': 'MARRIED',
  'mother.occupation': 'Teacher',
  'mother.detailsExist': true,

  // Father data - flattened
  'father.firstNamesEng': 'John',
  'father.familyNameEng': 'Doe',
  'father.nationality': 'FAR',
  'father.birthDate': '1985-05-15',
  'father.maritalStatus': 'MARRIED',
  'father.occupation': 'Engineer',
  'father.detailsExist': true,

  // Registration data - flattened
  'registration.informantType': 'MOTHER',
  'registration.registrationPhone': '123-456-7890',
  'registration.trackingId': 'TEST-12345',
  'registration.registrationNumber': 'REG-123456'
}

// Test declaration data (form data) - NEW UNIFIED STRUCTURE
export const testDeclaration = {
  // Event metadata as the 'event' property
  event: testEventDocument,

  // Form data directly in the declaration object
  ...testDeclarationFormData
}

// Test event document with modified metadata for print count testing
export const testEventDocumentWithPrintCount = {
  ...testEventDocument,
  metadata: {
    ...testEventDocument,
    copiesPrintedForTemplate: 3
  }
}

// Mock event document with multiple print actions
export const testEventDocumentWithMultiplePrints: EventDocument =
  generateEventDocument({
    configuration: tennisClubMembershipEvent,
    actions: [
      ActionType.CREATE,
      ActionType.REGISTER,
      ActionType.PRINT_CERTIFICATE,
      ActionType.PRINT_CERTIFICATE
    ]
  })

// Certificate Templates using the NEW UNIFIED CONDITIONAL SCHEMA

export const tennisClubMembershipCertificateWithoutConditionals: CertificateTemplateConfig =
  {
    id: 'tennis-club-membership-certificate',
    event: 'tennis-club-membership',
    label: {
      id: 'certificates.tennis-club-membership.certificate.basic',
      defaultMessage: 'Tennis Club Membership Certificate',
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
  }

export const tennisClubMembershipCertificateWithFormConditionals: CertificateTemplateConfig =
  {
    id: 'tennis-club-membership-certificate-form-conditionals',
    event: 'tennis-club-membership',
    label: {
      id: 'certificates.tennis-club-membership.certificate.form',
      defaultMessage: 'Tennis Club Membership Certificate (Form Conditionals)',
      description:
        'The label for a tennis club membership certificate with form conditionals'
    },
    isDefault: false,
    svgUrl: '/certificates/tennis-club-membership-form.svg',
    svg: '<svg>Form Certificate</svg>',
    fee: {
      onTime: 15,
      late: 20,
      delayed: 25
    },
    conditionals: [
      {
        type: 'SHOW',
        conditional: {
          type: 'object',
          properties: {
            'child.gender': { const: 'male' }
          },
          required: ['child.gender']
        } as unknown as JSONSchema
      }
    ]
  }

export const tennisClubMembershipCertificateWithMetaConditionals: CertificateTemplateConfig =
  {
    id: 'tennis-club-membership-certificate-meta-conditionals',
    event: 'tennis-club-membership',
    label: {
      id: 'certificates.tennis-club-membership.certificate.meta',
      defaultMessage: 'Tennis Club Membership Certificate (Meta Conditionals)',
      description:
        'The label for a tennis club membership certificate with meta conditionals'
    },
    isDefault: false,
    svgUrl: '/certificates/tennis-club-membership-meta.svg',
    svg: '<svg>Meta Certificate</svg>',
    fee: {
      onTime: 20,
      late: 25,
      delayed: 30
    },
    conditionals: [
      {
        type: 'SHOW',
        conditional: {
          type: 'object',
          properties: {
            event: {
              type: 'object',
              properties: {
                actions: {
                  type: 'array',
                  contains: {
                    type: 'object',
                    properties: {
                      type: { const: 'REGISTER' }
                    },
                    required: ['type']
                  }
                }
              },
              required: ['actions']
            }
          },
          required: ['event']
        } as unknown as JSONSchema
      }
    ]
  }

export const tennisClubMembershipCertificateWithEventStatusConditional: CertificateTemplateConfig =
  {
    id: 'tennis-club-membership-certificate-event-status',
    event: 'tennis-club-membership',
    label: {
      id: 'certificates.tennis-club-membership.certificate.event-status',
      defaultMessage: 'Tennis Club Membership Certificate (Event Status)',
      description:
        'The label for a tennis club membership certificate with event status conditionals'
    },
    isDefault: false,
    svgUrl: '/certificates/tennis-club-membership-event-status.svg',
    svg: '<svg>Event Status Certificate</svg>',
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
            event: {
              type: 'object',
              properties: {
                status: {
                  type: 'array',
                  contains: {
                    type: 'object',
                    properties: {
                      type: { const: 'REGISTERED' }
                    },
                    required: ['type']
                  }
                }
              },
              required: ['status']
            }
          },
          required: ['event']
        } as unknown as JSONSchema
      }
    ]
  }

export const tennisClubMembershipCertificateWithFailingFormConditionals: CertificateTemplateConfig =
  {
    id: 'tennis-club-membership-certificate-failing-form',
    event: 'tennis-club-membership',
    label: {
      id: 'certificates.tennis-club-membership.certificate.failing-form',
      defaultMessage: 'Tennis Club Membership Certificate (Failing Form)',
      description:
        'The label for a tennis club membership certificate with failing form conditionals'
    },
    isDefault: false,
    svgUrl: '/certificates/tennis-club-membership-failing-form.svg',
    svg: '<svg>Failing Form Certificate</svg>',
    fee: {
      onTime: 30,
      late: 35,
      delayed: 40
    },
    conditionals: [
      {
        type: 'SHOW',
        conditional: {
          type: 'object',
          properties: {
            'child.gender': { const: 'female' }
          },
          required: ['child.gender']
        } as unknown as JSONSchema
      }
    ]
  }

export const tennisClubMembershipCertificateWithPrintCountConditionals: CertificateTemplateConfig =
  {
    id: 'tennis-club-membership-certificate-print-count',
    event: 'tennis-club-membership',
    label: {
      id: 'certificates.tennis-club-membership.certificate.print-count',
      defaultMessage: 'Tennis Club Membership Certificate (Replacement Copy)',
      description:
        'The label for a replacement tennis club membership certificate shown after multiple prints'
    },
    isDefault: false,
    svgUrl: '/certificates/tennis-club-membership-print-count.svg',
    svg: '<svg>Replacement Certificate</svg>',
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
            event: {
              type: 'object',
              properties: {
                actions: {
                  type: 'array',
                  contains: {
                    type: 'object',
                    properties: {
                      type: { const: 'PRINT_CERTIFICATE' }
                    },
                    required: ['type']
                  }
                }
              },
              required: ['actions']
            }
          },
          required: ['event']
        } as unknown as JSONSchema
      }
    ]
  }

export const tennisClubMembershipCertificateWithMultiplePrintConditionals: CertificateTemplateConfig =
  {
    id: 'tennis-club-membership-certificate-multiple-print',
    event: 'tennis-club-membership',
    label: {
      id: 'certificates.tennis-club-membership.certificate.multiple-print',
      defaultMessage: 'Tennis Club Membership Certificate (Multiple Prints)',
      description:
        'The label for a tennis club membership certificate shown after multiple prints'
    },
    isDefault: false,
    svgUrl: '/certificates/tennis-club-membership-multiple-print.svg',
    svg: '<svg>Multiple Print Certificate</svg>',
    fee: {
      onTime: 30,
      late: 35,
      delayed: 40
    },
    conditionals: [
      {
        type: 'SHOW',
        conditional: {
          type: 'object',
          properties: {
            event: {
              type: 'object',
              properties: {
                actions: {
                  type: 'array',
                  minContains: 2,
                  contains: {
                    type: 'object',
                    properties: {
                      type: {
                        const: 'PRINT_CERTIFICATE'
                      }
                    },
                    required: ['type']
                  }
                }
              },
              required: ['actions']
            }
          },
          required: ['event']
        } as unknown as JSONSchema
      }
    ]
  }

// Template that shows only after the basic template has been printed at least once
export const tennisClubMembershipReplacementCertificate: CertificateTemplateConfig =
  {
    id: 'tennis-club-membership-replacement-certificate',
    event: 'tennis-club-membership',
    label: {
      id: 'certificates.tennis-club-membership.certificate.replacement',
      defaultMessage: 'Replacement Tennis Club Membership Certificate',
      description:
        'A replacement certificate shown after the original has been printed'
    },
    isDefault: false,
    svgUrl: '/certificates/tennis-club-membership-replacement.svg',
    svg: '<svg>Replacement Certificate</svg>',
    fee: {
      onTime: 15, // Higher fee for replacement
      late: 20,
      delayed: 25
    },
    conditionals: [
      {
        type: 'SHOW',
        conditional: {
          type: 'object',
          properties: {
            event: {
              type: 'object',
              properties: {
                actions: {
                  type: 'array',
                  contains: {
                    type: 'object',
                    properties: {
                      type: { const: 'PRINT_CERTIFICATE' },
                      templateId: {
                        const: 'tennis-club-membership-certificate'
                      }
                    },
                    required: ['type', 'templateId']
                  }
                }
              },
              required: ['actions']
            }
          },
          required: ['event']
        } as unknown as JSONSchema
      }
    ]
  }

// Template that shows only after the basic template has been printed 2+ times
export const tennisClubMembershipThirdCopyCertificate: CertificateTemplateConfig =
  {
    id: 'tennis-club-membership-third-copy-certificate',
    event: 'tennis-club-membership',
    label: {
      id: 'certificates.tennis-club-membership.certificate.third-copy',
      defaultMessage: 'Third Copy Tennis Club Membership Certificate',
      description:
        'A third copy certificate shown after 2+ prints of the original'
    },
    isDefault: false,
    svgUrl: '/certificates/tennis-club-membership-third-copy.svg',
    svg: '<svg>Third Copy Certificate</svg>',
    fee: {
      onTime: 25, // Even higher fee for third copy
      late: 30,
      delayed: 35
    },
    conditionals: [
      {
        type: 'SHOW',
        conditional: {
          type: 'object',
          properties: {
            event: {
              type: 'object',
              properties: {
                actions: {
                  type: 'array',
                  minContains: 2,
                  contains: {
                    type: 'object',
                    properties: {
                      type: { const: 'PRINT_CERTIFICATE' },
                      templateId: {
                        const: 'tennis-club-membership-certificate'
                      }
                    },
                    required: ['type', 'templateId']
                  }
                }
              },
              required: ['actions']
            }
          },
          required: ['event']
        } as unknown as JSONSchema
      }
    ]
  }

// Template that shows as a certified copy after the basic template has been printed
export const tennisClubMembershipDuplicateCertificate: CertificateTemplateConfig =
  {
    id: 'tennis-club-membership-duplicate-certificate',
    event: 'tennis-club-membership',
    label: {
      id: 'certificates.tennis-club-membership.certificate.duplicate',
      defaultMessage: 'Certified Copy Tennis Club Membership Certificate',
      description:
        'A certified copy certificate available after the basic template has been printed'
    },
    isDefault: false,
    svgUrl: '/certificates/tennis-club-membership-duplicate.svg',
    svg: '<svg>Certified Copy Certificate</svg>',
    fee: {
      onTime: 20,
      late: 25,
      delayed: 30
    },
    conditionals: [
      {
        type: 'SHOW',
        conditional: {
          type: 'object',
          properties: {
            event: {
              type: 'object',
              properties: {
                actions: {
                  type: 'array',
                  contains: {
                    type: 'object',
                    properties: {
                      type: { const: 'PRINT_CERTIFICATE' },
                      templateId: {
                        const: 'tennis-club-membership-certificate'
                      }
                    },
                    required: ['type', 'templateId']
                  }
                }
              },
              required: ['actions']
            }
          },
          required: ['event']
        } as unknown as JSONSchema
      }
    ]
  }

// Template that can be re-ordered after it has been printed (self-referential)
export const tennisClubMembershipReorderCertificate: CertificateTemplateConfig =
  {
    id: 'tennis-club-membership-reorder-certificate',
    event: 'tennis-club-membership',
    label: {
      id: 'certificates.tennis-club-membership.certificate.reorder',
      defaultMessage: 'Re-order Tennis Club Membership Certificate',
      description:
        'A certificate that can be re-ordered after it has been printed once'
    },
    isDefault: false,
    svgUrl: '/certificates/tennis-club-membership-reorder.svg',
    svg: '<svg>Re-order Certificate</svg>',
    fee: {
      onTime: 30,
      late: 35,
      delayed: 40
    },
    conditionals: [
      {
        type: 'SHOW',
        conditional: {
          type: 'object',
          properties: {
            event: {
              type: 'object',
              properties: {
                actions: {
                  type: 'array',
                  contains: {
                    type: 'object',
                    properties: {
                      type: { const: 'PRINT_CERTIFICATE' },
                      templateId: {
                        const: 'tennis-club-membership-reorder-certificate'
                      }
                    },
                    required: ['type', 'templateId']
                  }
                }
              },
              required: ['actions']
            }
          },
          required: ['event']
        } as unknown as JSONSchema
      }
    ]
  }
