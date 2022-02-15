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
  IFormSection,
  IFormSectionGroup,
  RADIO_GROUP_WITH_NESTED_FIELDS,
  Event,
  InformantSection
} from '@client/forms'
import { formMessages } from '@client/i18n/messages/views/selectInformant'

const birthInformantRelationGroup: IFormSectionGroup = {
  id: 'informantRelation',
  title: formMessages.title,
  error: formMessages.informantError,
  fields: [
    {
      name: 'applicant',
      type: RADIO_GROUP_WITH_NESTED_FIELDS,
      size: RadioSize.LARGE,
      label: formMessages.whoIsBirthInformant,
      hideHeader: true,
      required: true,
      initialValue: '',
      validate: [],
      options: [
        { value: 'MOTHER', label: formMessages.mother },
        { value: 'FATHER', label: formMessages.father },
        { value: 'GRANDFATHER', label: formMessages.grandfather },
        {
          value: 'GRANDMOTHER',
          label: formMessages.grandmother
        },
        {
          value: 'BROTHER',
          label: formMessages.brother
        },
        {
          value: 'SISTER',
          label: formMessages.sister
        },
        {
          value: 'LEGAL_GUARDIAN',
          label: formMessages.legalGuardian
        },
        {
          value: 'SOMEONE_ELSE',
          label: formMessages.others
        }
      ],
      nestedFields: {
        MOTHER: [],
        FATHER: [],
        GRANDFATHER: [],
        GRANDMOTHER: [],
        LEGAL_GUARDIAN: [],
        SOMEONE_ELSE: [
          {
            name: 'otherRelationship',
            type: 'TEXT',
            label: {
              defaultMessage: 'Relationship to child',
              id: 'form.field.label.applicantsRelationWithChild',
              description: 'Label for input Relationship to child'
            },
            placeholder: {
              defaultMessage: 'eg. Uncle',
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

const deathInformantRelationGroup: IFormSectionGroup = {
  id: 'informantRelation',
  title: formMessages.title,
  error: formMessages.informantError,
  fields: [
    {
      name: 'relationship',
      type: RADIO_GROUP_WITH_NESTED_FIELDS,
      size: RadioSize.LARGE,
      label: formMessages.whoIsDeathInformant,
      hideHeader: true,
      required: true,
      initialValue: '',
      validate: [],
      options: [
        { value: 'SPOUSE', label: formMessages.spouse },
        { value: 'SON', label: formMessages.son },
        { value: 'DAUGHTER', label: formMessages.daughter },
        { value: 'SON_IN_LAW', label: formMessages.sonInLaw },
        { value: 'DAUGHTER_IN_LAW', label: formMessages.daughterInLaw },
        { value: 'FATHER', label: formMessages.father },
        { value: 'MOTHER', label: formMessages.mother },
        { value: 'GRANDSON', label: formMessages.grandson },
        {
          value: 'GRANDDAUGHTER',
          label: formMessages.granddaughter
        },
        {
          value: 'SOMEONE_ELSE',
          label: formMessages.others
        }
      ],
      nestedFields: {
        SPOUSE: [],
        SON: [],
        DAUGHTER: [],
        SON_IN_LAW: [],
        DAUGHTER_IN_LAW: [],
        FATHER: [],
        MOTHER: [],
        GRANDSON: [],
        GRANDDAUGHTER: [],
        SOMEONE_ELSE: [
          {
            name: 'otherRelationship',
            type: 'TEXT',
            label: {
              defaultMessage: 'Relationship to deceased',
              id: 'form.field.label.applicantsRelationWithDeceased',
              description: 'Label for input Relationship to deceased'
            },
            placeholder: {
              defaultMessage: 'eg. Uncle',
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

const birthInformantSection: IFormSection = {
  id: InformantSection.Registration,
  viewType: 'form',
  name: formMessages.name,
  title: formMessages.title,
  groups: [birthInformantRelationGroup]
}

const deathInformantSection: IFormSection = {
  id: InformantSection.Registration,
  viewType: 'form',
  name: formMessages.name,
  title: formMessages.title,
  groups: [deathInformantRelationGroup]
}

export const getInformantSection = (event: Event) => {
  return event === Event.BIRTH ? birthInformantSection : deathInformantSection
}
