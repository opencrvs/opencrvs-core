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
  event,
  EventDocument
} from '@opencrvs/commons/client'

// Basic certificate template without conditionals
export const tennisClubMembershipCertificateWithoutConditionals: CertificateTemplateConfig =
  {
    id: 'tennis-club-membership-certificate',
    event: 'tennis-club-membership',
    label: {
      id: 'certificates.tennis-club-membership.certificate.basic',
      defaultMessage: 'Tennis Club Membership Certificate',
      description: 'Basic tennis club membership certificate'
    },
    isDefault: true,
    svgUrl: '/certificates/tennis-club-membership.svg',
    svg: '<svg>Basic Certificate</svg>',
    fee: {
      onTime: 10,
      late: 15,
      delayed: 20
    }
  }

export const testDeclarationFormData = {
  'child.gender': 'male',
  'child.dob': '2020-01-01'
}

export const testEventDocument = {
  actions: [],
  registration: {
    status: 'REGISTERED'
  }
} as unknown as EventDocument

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
        conditional: event.hasAction('PRINT_CERTIFICATE')
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
        conditional: event.hasAction('PRINT_CERTIFICATE').minCount(2)
      }
    ]
  }

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
    }
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
        conditional: event
          .hasAction('PRINT_CERTIFICATE')
          .withFields({ templateId: 'tennis-club-membership-certificate' })
          .minCount(1)
      }
    ]
  }
