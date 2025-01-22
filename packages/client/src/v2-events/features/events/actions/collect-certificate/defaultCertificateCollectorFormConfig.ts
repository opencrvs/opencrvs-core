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

export const defaultCertificateCollectorFormConfig: FormPage = {
  id: 'collector',
  title: {
    id: 'event.tennis-club-membership.action.certificate.form.section.who.title',
    defaultMessage: 'Who is collecting the certificate?',
    description: 'This is the title of the section'
  },
  fields: [
    {
      id: 'collector.firstname',
      type: 'TEXT',
      required: true,
      label: {
        defaultMessage: "Collector's first name",
        description: 'This is the label for the field',
        id: 'event.tennis-club-membership.action.certificate.form.section.who.field.firstname.label'
      }
    },
    {
      id: 'collector.surname',
      type: 'TEXT',
      required: true,
      label: {
        defaultMessage: "Collector's surname",
        description: 'This is the label for the field',
        id: 'event.tennis-club-membership.action.certificate.form.section.who.field.surname.label'
      }
    },
    {
      id: 'collector.certificateTemplateId',
      type: 'RADIO_GROUP',
      required: true,
      label: {
        defaultMessage: 'Select Certificate Template',
        description: 'This is the label for the field',
        id: 'event.tennis-club-membership.action.certificate.form.section.who.field.surname.label'
      },
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
            defaultMessage: 'Tennis Club Membership Certificate certified copy',
            description: 'The label for a tennis-club-membership certificate'
          },
          value: 'tennis-club-membership-certified-certificate'
        }
      ]
    }
  ]
}
