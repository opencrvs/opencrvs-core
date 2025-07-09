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

import {
  CertificateTemplateConfig,
  JSONSchema,
  ActionType,
  generateEventDocument,
  tennisClubMembershipEvent
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
