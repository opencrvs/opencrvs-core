import { FormPage } from '@opencrvs/commons'

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

export const defaultCertificateCollectorFormConfig: FormPage[] = [
  {
    id: 'collector',
    title: {
      id: 'event.tennis-club-membership.action.certificate.form.section.who.title',
      defaultMessage: 'Who is collecting the certificate?',
      description: 'This is the title of the section'
    },
    fields: [
      {
        id: 'collector.certificateTemplateId',
        type: 'SELECT',
        required: true,
        label: {
          defaultMessage: 'Select Certificate Template',
          description: 'This is the label for the field',
          id: 'event.tennis-club-membership.action.certificate.form.section.who.field.surname.label'
        },
        validation: [
          {
            message: {
              id: '',
              defaultMessage: '',
              description: ''
            }
            // validator: field
          }
        ],
        options: [
          {
            label: {
              id: 'certificates.tennis-club-membership.certificate.copy',
              defaultMessage: 'Tennis Club Membership Certificate copy',
              description: 'The label for a tennis-club-membership certificate'
            },
            value: 'tennis-club-membership-certificate'
          },
          {
            label: {
              id: 'certificates.tennis-club-membership.certificate.certified-copy',
              defaultMessage:
                'Tennis Club Membership Certificate certified copy',
              description: 'The label for a tennis-club-membership certificate'
            },
            value: 'tennis-club-membership-certified-certificate'
          }
        ]
      },
      {
        id: 'collector.requesterId',
        type: 'SELECT',
        required: true,
        label: {
          defaultMessage: 'Requester',
          description: 'This is the label for the field',
          id: 'event.tennis-club-membership.action.certificate.form.section.requester.label'
        },
        options: [
          {
            label: {
              id: 'event.tennis-club-membership.action.certificate.form.section.requester.informant.label',
              defaultMessage: 'Print and issue Informant',
              description: 'This is the label for the field'
            },
            value: 'INFORMANT'
          },
          {
            label: {
              id: 'event.tennis-club-membership.action.certificate.form.section.requester.other.label',
              defaultMessage: 'Print and issue someone else',
              description: 'This is the label for the field'
            },
            value: 'OTHER'
          },
          {
            label: {
              id: 'event.tennis-club-membership.action.certificate.form.section.requester.printInAdvance.label',
              defaultMessage: 'Print in advance',
              description: 'This is the label for the field'
            },
            value: 'PRINT_IN_ADVANCE'
          }
        ]
      }
    ]
  }
]
