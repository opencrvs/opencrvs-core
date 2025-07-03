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
  EventDocument,
  EventState
} from '@opencrvs/commons/client'

// Mock test data based on real tennis-club-membership data
const fullTestData = {
  id: '427f008b-1509-4ce8-9682-389e1482822e',
  type: 'tennis-club-membership',
  status: 'REGISTERED',
  legalStatuses: {
    DECLARED: {
      createdAt: '2025-07-02T10:35:48.644Z',
      createdBy: '6865054f81a118ef3769cbcd',
      createdAtLocation: 'dbd2b8b0-35f5-4408-ba9a-dfe6ec049aa0',
      acceptedAt: '2025-07-02T10:35:48.644Z',
      createdByRole: 'LOCAL_REGISTRAR'
    },
    REGISTERED: {
      createdAt: '2025-07-02T10:35:49.963Z',
      createdBy: '6865054f81a118ef3769cbcd',
      createdAtLocation: 'dbd2b8b0-35f5-4408-ba9a-dfe6ec049aa0',
      acceptedAt: '2025-07-02T10:35:49.963Z',
      createdByRole: 'LOCAL_REGISTRAR',
      registrationNumber: 'X3XSFNURG74S'
    }
  },
  createdAt: '2025-07-02T10:35:25.023Z',
  createdBy: '6865054f81a118ef3769cbcd',
  createdAtLocation: 'dbd2b8b0-35f5-4408-ba9a-dfe6ec049aa0',
  updatedAt: '2025-07-02T10:35:49.963Z',
  assignedTo: '6865054f81a118ef3769cbcd',
  updatedBy: '6865054f81a118ef3769cbcd',
  updatedAtLocation: 'dbd2b8b0-35f5-4408-ba9a-dfe6ec049aa0',
  declaration: {
    'recommender.none': true,
    'applicant.firstname': 'Me',
    'applicant.surname': 'Test',
    'applicant.dob': '2000-01-01',
    'applicant.image.label': ''
  },
  trackingId: 'ILE4YZ',
  updatedByUserRole: 'LOCAL_REGISTRAR',
  dateOfEvent: '2025-07-02',
  flags: [],
  copiesPrintedForTemplate: 0
}

// Extract just the form data (declaration.declaration) for the function
export const testDeclaration: EventState =
  fullTestData.declaration as EventState

// Also export the full event state for reference
export const testEventState = fullTestData

export const testEvent: EventDocument = {
  id: '427f008b-1509-4ce8-9682-389e1482822e',
  type: 'tennis-club-membership',
  createdAt: '2025-07-02T10:35:25.023Z',
  updatedAt: '2025-07-02T12:25:31.509Z',
  actions: [
    {
      id: '529b3dfd-6c77-4ccd-88da-70807dc8c903',
      transactionId: '609281fe-e4b6-41b0-ae9a-2759cc4cadbd',
      createdAt: '2025-07-02T10:35:25.023Z',
      createdBy: '6865054f81a118ef3769cbcd',
      createdByRole: 'LOCAL_REGISTRAR',
      createdBySignature: null,
      createdAtLocation: 'dbd2b8b0-35f5-4408-ba9a-dfe6ec049aa0',
      declaration: {},
      status: 'Accepted',
      type: 'CREATE'
    },
    {
      id: '427f008b-1509-4ce8-9682-389e1482822e',
      transactionId: '77492dc6-66c7-453d-9d85-84f195b90632',
      createdAt: '2025-07-02T10:35:25.023Z',
      createdBy: '6865054f81a118ef3769cbcd',
      createdByRole: 'LOCAL_REGISTRAR',
      createdBySignature: null,
      createdAtLocation: 'dbd2b8b0-35f5-4408-ba9a-dfe6ec049aa0',
      declaration: {},
      status: 'Accepted',
      type: 'ASSIGN',
      assignedTo: '6865054f81a118ef3769cbcd'
    },
    {
      id: '0c9a0ac9-acb5-42f9-a8ee-56b48c74533c',
      transactionId: '83a5ad5d-c074-49c1-857d-9d22456b1919',
      createdAt: '2025-07-02T10:35:44.945Z',
      createdBy: '6865054f81a118ef3769cbcd',
      createdByRole: 'LOCAL_REGISTRAR',
      createdBySignature: null,
      createdAtLocation: 'dbd2b8b0-35f5-4408-ba9a-dfe6ec049aa0',
      declaration: {},
      status: 'Accepted',
      type: 'READ'
    },
    {
      id: '7ccd77df-f576-417b-bb5f-566efe1ad6bd',
      transactionId: '94fc48df-8bd8-4ac5-9cf4-905b1f5c54dc',
      createdAt: '2025-07-02T10:35:48.644Z',
      createdBy: '6865054f81a118ef3769cbcd',
      createdByRole: 'LOCAL_REGISTRAR',
      createdBySignature: null,
      createdAtLocation: 'dbd2b8b0-35f5-4408-ba9a-dfe6ec049aa0',
      declaration: {
        'recommender.none': true,
        'applicant.firstname': 'Me',
        'applicant.surname': 'Test',
        'applicant.dob': '2000-01-01',
        'applicant.image.label': ''
      },
      annotation: {},
      status: 'Accepted',
      type: 'DECLARE'
    },
    {
      id: '569a48cf-dadc-4f69-baa3-1ebe33102251',
      transactionId: '311a2f76-a2dd-41e7-bca5-a7204cc68d53',
      createdAt: '2025-07-02T10:35:48.883Z',
      createdBy: '6865054f81a118ef3769cbcd',
      createdByRole: 'LOCAL_REGISTRAR',
      createdBySignature: null,
      createdAtLocation: 'dbd2b8b0-35f5-4408-ba9a-dfe6ec049aa0',
      declaration: {},
      annotation: {},
      status: 'Accepted',
      type: 'VALIDATE'
    },
    {
      id: '76d6057b-e5d6-433f-9c85-afc80fb70636',
      transactionId: '6bab6e36-b3c8-492b-8141-199de5803a41',
      createdAt: '2025-07-02T10:35:49.963Z',
      createdBy: '6865054f81a118ef3769cbcd',
      createdByRole: 'LOCAL_REGISTRAR',
      createdBySignature: null,
      createdAtLocation: 'dbd2b8b0-35f5-4408-ba9a-dfe6ec049aa0',
      declaration: {},
      annotation: {},
      status: 'Accepted',
      type: 'REGISTER',
      registrationNumber: 'X3XSFNURG74S'
    },
    {
      id: '76d6057b-e5d6-433f-9c85-afc80fb70636',
      transactionId: 'e8a64db5-36fd-43a9-b107-d1cc9b3b4069',
      createdAt: '2025-07-02T10:35:49.963Z',
      createdBy: '6865054f81a118ef3769cbcd',
      createdByRole: 'LOCAL_REGISTRAR',
      createdBySignature: null,
      createdAtLocation: 'dbd2b8b0-35f5-4408-ba9a-dfe6ec049aa0',
      declaration: {},
      annotation: {},
      status: 'Accepted',
      type: 'UNASSIGN',
      assignedTo: null
    },
    {
      id: '9a5b3b84-b64b-4452-b095-b69bcf80246f',
      transactionId: '19f99bdc-0063-4a6e-82f3-e6e2cc250a0a',
      createdAt: '2025-07-02T10:35:59.460Z',
      createdBy: '6865054f81a118ef3769cbcd',
      createdByRole: 'LOCAL_REGISTRAR',
      createdBySignature: null,
      createdAtLocation: 'dbd2b8b0-35f5-4408-ba9a-dfe6ec049aa0',
      declaration: {},
      annotation: {},
      status: 'Accepted',
      type: 'ASSIGN',
      assignedTo: '6865054f81a118ef3769cbcd'
    },
    {
      id: 'd97a2710-62a6-49f6-b344-9b1080339767',
      transactionId: 'e56d12f2-57d7-483e-9f35-3f749dd04b88',
      createdAt: '2025-07-02T10:36:42.956Z',
      createdBy: '6865054f81a118ef3769cbcd',
      createdByRole: 'LOCAL_REGISTRAR',
      createdBySignature: null,
      createdAtLocation: 'dbd2b8b0-35f5-4408-ba9a-dfe6ec049aa0',
      declaration: {},
      status: 'Accepted',
      type: 'READ'
    },
    {
      id: '01f43777-f3cb-4ec2-a416-bbdb4634cb78',
      transactionId: '8ce11f2c-2acd-4214-8edc-30518db8cbf0',
      createdAt: '2025-07-02T11:34:55.360Z',
      createdBy: '6865054f81a118ef3769cbcd',
      createdByRole: 'LOCAL_REGISTRAR',
      createdBySignature: null,
      createdAtLocation: 'dbd2b8b0-35f5-4408-ba9a-dfe6ec049aa0',
      declaration: {},
      status: 'Accepted',
      type: 'READ'
    }
  ],
  trackingId: 'ILE4YZ'
}

// Sample certificate templates for testing
export const tennisClubMembershipCertificateWithoutConditionals: CertificateTemplateConfig =
  {
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

export const tennisClubMembershipCertificateWithFormConditionals: CertificateTemplateConfig =
  {
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
            type: 'object',
            properties: {
              'recommender.none': {
                type: 'boolean',
                const: true
              }
            },
            required: ['recommender.none']
          },
          required: ['$form']
        } as Record<string, unknown>
      }
    ]
  } as CertificateTemplateConfig

export const tennisClubMembershipCertificateWithMetaConditionals: CertificateTemplateConfig =
  {
    id: 'tennis-club-membership-certificate-registered',
    event: 'tennis-club-membership',
    label: {
      id: 'certificates.tennis-club-membership.certificate.registered',
      defaultMessage: 'Registered Tennis Club Membership Certificate',
      description:
        'The label for a registered tennis club membership certificate'
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
            type: 'object',
            properties: {
              status: {
                type: 'string',
                const: 'REGISTERED'
              }
            },
            required: ['status']
          },
          required: ['$form']
        } as Record<string, unknown>
      }
    ]
  } as CertificateTemplateConfig

export const tennisClubMembershipCertificateWithFailingFormConditionals: CertificateTemplateConfig =
  {
    id: 'tennis-club-membership-certificate-failing',
    event: 'tennis-club-membership',
    label: {
      id: 'certificates.tennis-club-membership.certificate.failing',
      defaultMessage: 'Failing Tennis Club Membership Certificate',
      description:
        'The label for a tennis club membership certificate that should not be shown'
    },
    isDefault: false,
    svgUrl: '/certificates/tennis-club-membership-failing.svg',
    svg: '<svg>Failing Certificate</svg>',
    fee: {
      onTime: 5,
      late: 10,
      delayed: 15
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
                  const: false
                }
              },
              required: ['recommender.none']
            }
          },
          required: ['$form']
        } as Record<string, unknown>
      }
    ]
  } as CertificateTemplateConfig
