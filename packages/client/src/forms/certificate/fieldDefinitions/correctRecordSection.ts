/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import { RadioSize } from '@client/../../components/lib/forms'
import {
  CertificateSection,
  IFormSection,
  IFormSectionGroup,
  RADIO_GROUP_WITH_NESTED_FIELDS
} from '@client/forms'
import { formMessages } from '@client/i18n/messages/form'
import { messages } from '@client/i18n/messages/views/certificate'

export const correctRecordBirthSectionGroup: IFormSectionGroup = {
  id: 'recordCorrection',
  title: messages.whoToRequestCertificateCorrection,
  fields: [
    {
      name: 'type',
      type: RADIO_GROUP_WITH_NESTED_FIELDS,
      size: RadioSize.LARGE,
      label: messages.whoToRequestCertificateCorrection,
      required: true,
      initialValue: '',
      validate: [],
      options: [
        { value: 'MOTHER', label: formMessages.motherWithName },
        { value: 'FATHER', label: formMessages.fatherWithName },
        { value: 'CHILD', label: formMessages.childWithName },
        {
          value: 'LEGAL_GUARDIAN',
          label: formMessages.legalGuardianCaregiverTypeLabel
        },
        { value: 'ANOTHER_AGENT', label: formMessages.anotherRegOrFieldAgent },
        {
          value: 'REGISTRAR',
          label: formMessages.meWithRole
        },
        {
          value: 'SOMEONE_ELSE',
          label: formMessages.someoneElse
        }
      ],
      nestedFields: {
        MOTHER: [],
        FATHER: [],
        CHILD: [],
        LEGAL_GUARDIAN: [],
        ANOTHER_AGENT: [],
        REGISTER: [],
        SOMEONE_ELSE: [
          {
            name: 'otherRelationShip',
            type: 'TEXT',
            label: {
              defaultMessage: 'Relationship to child',
              id: 'form.field.label.applicantsRelationWithChild',
              description: 'Label for input Relationship to child'
            },
            placeholder: {
              defaultMessage: 'eg. Grandmother',
              description: 'Placeholder for example of relationship',
              id: 'form.field.label.relationshipPlaceHolder'
            },
            required: true,
            initialValue: '',
            validate: [],
            mapping: {}
          }
        ]
      }
    }
  ]
}

export const correctRecordDeathSectionGroup: IFormSectionGroup = {
  id: 'recordCorrection',
  title: messages.whoToRequestCertificateCorrection,
  fields: [
    {
      name: 'type',
      type: RADIO_GROUP_WITH_NESTED_FIELDS,
      size: RadioSize.LARGE,
      label: messages.whoToRequestCertificateCorrection,
      required: true,
      initialValue: '',
      validate: [],
      options: [
        { value: 'INFORMANT', label: formMessages.informantWithName },
        { value: 'ANOTHER_AGENT', label: formMessages.anotherRegOrFieldAgent },
        {
          value: 'REGISTRAR',
          label: formMessages.meWithRole
        },
        {
          value: 'SOMEONE_ELSE',
          label: formMessages.someoneElse
        }
      ],
      nestedFields: {
        MOTHER: [],
        FATHER: [],
        CHILD: [],
        LEGAL_GUARDIAN: [],
        ANOTHER_AGENT: [],
        REGISTER: [],
        SOMEONE_ELSE: [
          {
            name: 'otherRelationShip',
            type: 'TEXT',
            label: {
              defaultMessage: 'Relationship to child',
              id: 'form.field.label.applicantsRelationWithChild',
              description: 'Label for input Relationship to child'
            },
            placeholder: {
              defaultMessage: 'eg. Grandmother',
              description: 'Placeholder for example of relationship',
              id: 'form.field.label.relationshipPlaceHolder'
            },
            required: true,
            initialValue: '',
            validate: [],
            mapping: {}
          }
        ]
      }
    }
  ]
}

export const correctRecordBirthSection: IFormSection = {
  id: CertificateSection.Corrector,
  viewType: 'form',
  name: messages.printCertificate,
  title: messages.certificateCollectionTitle,
  groups: [correctRecordBirthSectionGroup]
}

export const correctRecordDeathSection: IFormSection = {
  id: CertificateSection.Corrector,
  viewType: 'form',
  name: messages.printCertificate,
  title: messages.certificateCollectionTitle,
  groups: [correctRecordDeathSectionGroup]
}
