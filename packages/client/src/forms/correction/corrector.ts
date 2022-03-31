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
import { RadioSize } from '@opencrvs/components/lib/forms'
import {
  CorrectionSection,
  IFormSection,
  IFormSectionGroup,
  RADIO_GROUP_WITH_NESTED_FIELDS,
  Event
} from '@client/forms'
import { messages } from '@client/i18n/messages/views/correction'
import { fieldValueSectionExchangeTransformer } from '@client/forms/mappings/mutation'

export enum CorrectorRelationship {
  //death
  INFORMANT = 'INFORMANT',
  //birth
  MOTHER = 'MOTHER',
  FATHER = 'FATHER',
  CHILD = 'CHILD',
  LEGAL_GUARDIAN = 'LEGAL_GUARDIAN',
  //common
  ANOTHER_AGENT = 'ANOTHER_AGENT',
  REGISTRAR = 'REGISTRAR',
  COURT = 'COURT',
  OTHER = 'OTHER'
}

export const CollectorRelationLabelArray = [
  { value: CorrectorRelationship.MOTHER, label: messages.mother },
  { value: CorrectorRelationship.FATHER, label: messages.father },
  { value: CorrectorRelationship.CHILD, label: messages.child },
  {
    value: CorrectorRelationship.LEGAL_GUARDIAN,
    label: messages.legalGuardian
  },
  {
    value: CorrectorRelationship.ANOTHER_AGENT,
    label: messages.anotherRegOrFieldAgent
  },
  {
    value: CorrectorRelationship.REGISTRAR,
    label: messages.me
  },
  {
    value: CorrectorRelationship.COURT,
    label: messages.court
  },
  {
    value: CorrectorRelationship.OTHER,
    label: messages.others
  }
]

const birthCorrectorRelationGroup: IFormSectionGroup = {
  id: 'correctorRelation',
  title: messages.whoRequestedCorrection,
  error: messages.correctorError,
  fields: [
    {
      name: 'relationship',
      type: RADIO_GROUP_WITH_NESTED_FIELDS,
      size: RadioSize.LARGE,
      label: messages.whoRequestedCorrection,
      hideHeader: true,
      required: true,
      initialValue: '',
      validate: [],
      options: CollectorRelationLabelArray,
      nestedFields: {
        MOTHER: [],
        FATHER: [],
        CHILD: [],
        LEGAL_GUARDIAN: [],
        ANOTHER_AGENT: [],
        REGISTRAR: [],
        OTHER: [
          {
            name: 'otherRelationship',
            type: 'TEXT',
            label: {
              defaultMessage: 'Relationship to child',
              id: 'form.field.label.informantsRelationWithChild',
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
      },
      mapping: {
        mutation: fieldValueSectionExchangeTransformer(
          'correction',
          'requester'
        )
      }
    }
  ]
}

const deathCorrectorRelationGroup: IFormSectionGroup = {
  id: 'correctorRelation',
  title: messages.whoRequestedCorrection,
  error: messages.correctorError,
  fields: [
    {
      name: 'relationship',
      type: RADIO_GROUP_WITH_NESTED_FIELDS,
      size: RadioSize.LARGE,
      label: messages.whoRequestedCorrection,
      hideHeader: true,
      required: true,
      initialValue: '',
      validate: [],
      options: [
        { value: 'INFORMANT', label: messages.informant },
        { value: 'ANOTHER_AGENT', label: messages.anotherRegOrFieldAgent },
        {
          value: 'REGISTRAR',
          label: messages.me
        },
        {
          value: 'COURT',
          label: messages.court
        },
        {
          value: 'OTHER',
          label: messages.others
        }
      ],
      nestedFields: {
        INFORMANT: [],
        REGISTRAR: [],
        ANOTHER_AGENT: [],
        OTHER: [
          {
            name: 'otherRelationship',
            type: 'TEXT',
            label: {
              defaultMessage: 'Relationship to deceased',
              id: 'form.field.label.informantsRelationWithDeceased',
              description: 'Label for input Relationship to deceased select'
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
      },
      mapping: {
        mutation: fieldValueSectionExchangeTransformer(
          'correction',
          'requester'
        )
      }
    }
  ]
}

const birthCorrectorSection: IFormSection = {
  id: CorrectionSection.Corrector,
  viewType: 'form',
  name: messages.name,
  title: messages.title,
  groups: [birthCorrectorRelationGroup]
}

const deathCorrectorSection: IFormSection = {
  id: CorrectionSection.Corrector,
  viewType: 'form',
  name: messages.name,
  title: messages.title,
  groups: [deathCorrectorRelationGroup]
}

export const getCorrectorSection = (event: Event) => {
  return event === Event.BIRTH ? birthCorrectorSection : deathCorrectorSection
}
