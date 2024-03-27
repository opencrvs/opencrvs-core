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
import { IDeclaration } from '@client/declarations'
import {
  CorrectionSection,
  IFormSection,
  IFormSectionGroup,
  IRadioOption,
  RADIO_GROUP_WITH_NESTED_FIELDS
} from '@client/forms'
import { fieldValueSectionExchangeTransformer } from '@client/forms/register/mappings/mutation'
import { formMessages, constantsMessages } from '@client/i18n/messages'
import { messages } from '@client/i18n/messages/views/correction'
import { Event } from '@client/utils/gateway'
import { RadioSize } from '@opencrvs/components/lib/Radio'
import { getFilteredRadioOptions } from '@client/forms/certificate/fieldDefinitions/collectorSection'
import { labelFormatterForInformant } from '@client/views/CorrectionForm/utils'

export enum CorrectorRelationship {
  //death
  INFORMANT = 'INFORMANT',
  //birth
  MOTHER = 'MOTHER',
  FATHER = 'FATHER',
  CHILD = 'CHILD',
  LEGAL_GUARDIAN = 'LEGAL_GUARDIAN',
  BRIDE = 'BRIDE',
  GROOM = 'GROOM',
  //common
  ANOTHER_AGENT = 'ANOTHER_AGENT',
  REGISTRAR = 'REGISTRAR',
  COURT = 'COURT',
  OTHER = 'OTHER',
  LOCAL_REGISTRAR = 'LOCAL_REGISTRAR',
  NATIONAL_REGISTRAR = 'NATIONAL_REGISTRAR',
  REGISTRATION_AGENT = 'REGISTRATION_AGENT'
}

export const CorrectorRelationLabelArray = [
  { value: CorrectorRelationship.INFORMANT, label: messages.informant },
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

export const CollectorRelationLabelArray = [
  {
    value: CorrectorRelationship.INFORMANT,
    label: constantsMessages.declarationInformantLabel
  },
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
  },
  { value: CorrectorRelationship.BRIDE, label: messages.bride },
  { value: CorrectorRelationship.GROOM, label: messages.groom }
]

export const getCorrectorSection = (
  declaration: IDeclaration
): IFormSection => {
  const informant = (declaration.data.informant.otherInformantType ||
    declaration.data.informant.informantType) as string

  const initialOptions: IRadioOption[] = [
    {
      value: CorrectorRelationship.INFORMANT,
      label: messages.informant,
      param: {
        informant: labelFormatterForInformant(informant)
      }
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

  const birthCorrectorRelationshipOptions: IRadioOption[] = [
    { value: CorrectorRelationship.MOTHER, label: messages.mother },
    { value: CorrectorRelationship.FATHER, label: messages.father },
    { value: CorrectorRelationship.CHILD, label: messages.child },
    {
      value: CorrectorRelationship.LEGAL_GUARDIAN,
      label: messages.legalGuardian
    }
  ]

  const finalOptions = getFilteredRadioOptions(
    declaration,
    informant,
    initialOptions,
    birthCorrectorRelationshipOptions
  )

  const correctorRelationGroup: IFormSectionGroup = {
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
        validator: [],
        options: finalOptions,
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
              label:
                declaration.event === Event.Birth
                  ? formMessages.informantsRelationWithChild
                  : formMessages.informantsRelationWithDeceased,
              placeholder: {
                defaultMessage: 'eg. Grandmother',
                description: 'Placeholder for example of relationship',
                id: 'form.field.label.relationshipPlaceHolder'
              },
              required: true,
              initialValue: '',
              validator: [],
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

  const correctorSection: IFormSection = {
    id: CorrectionSection.Corrector,
    viewType: 'form',
    name: messages.name,
    title: messages.title,
    groups: [correctorRelationGroup]
  }

  return correctorSection
}
