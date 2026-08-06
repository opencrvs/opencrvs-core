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
  and,
  ConditionalType,
  field,
  FieldConfig,
  FieldType
} from '@opencrvs/toolkit/events'
import { InformantType, InformantTypeKey } from '../pages/informant'
import {
  IdType,
  idTypeOptions,
  informantMessageDescriptors
} from '@countryconfig/events/utils'
import { nationalIdValidator } from '@countryconfig/events/birth/validators'

const commonConfigs = {
  id: 'requester.type',
  type: FieldType.SELECT,
  required: true,
  label: {
    defaultMessage: 'Requester',
    description: 'This is the label for the field',
    id: 'event.death.action.correction.form.section.requester.label'
  }
}

const commonOptions = [
  {
    value: 'ANOTHER_AGENT',
    label: {
      id: 'event.birth.action.correction.form.requester.type.anotherAgent',
      defaultMessage: 'Another registration agent or field agent',
      description: 'This is the label for the correction requester field'
    }
  },
  {
    value: 'ME',
    label: {
      id: 'event.birth.action.correction.form.requester.type.me',
      defaultMessage: 'Me',
      description: 'This is the label for the correction requester field'
    }
  },
  {
    value: 'COURT',
    label: {
      id: 'event.birth.action.correction.form.requester.type.court',
      defaultMessage: 'Court',
      description: 'This is the label for the correction requester field'
    }
  },
  {
    value: 'SOMEONE_ELSE',
    label: {
      id: 'event.birth.action.correction.form.requester.type.someoneElse',
      defaultMessage: 'Someone else',
      description: 'This is the label for the correction requester field'
    }
  }
]

const getInformantConditional = (informantType: InformantTypeKey) => {
  return {
    type: ConditionalType.SHOW,
    conditional: field('informant.relation').isEqualTo(informantType)
  }
}

const getFieldConfigForInformant = (informantType: InformantTypeKey) => {
  return [
    {
      ...commonConfigs,
      conditionals: [getInformantConditional(informantType)],
      options: [getInformantOption(informantType), ...commonOptions]
    }
  ]
}

const getInformantOption = (informantType: InformantTypeKey) => {
  const defaultMessage =
    informantType === InformantType.OTHER
      ? `Informant`
      : `Informant (${informantMessageDescriptors[informantType].defaultMessage})`

  return {
    label: {
      id: `v2.event.death.action.correction.form.section.requester.informant.${informantType.toLowerCase()}.label`,
      defaultMessage,
      description: 'This is the label for the field'
    },
    value: 'INFORMANT'
  }
}

export const correctionFormRequesters: FieldConfig[] = [
  ...getFieldConfigForInformant(InformantType.SPOUSE),
  ...getFieldConfigForInformant(InformantType.OTHER),
  ...getFieldConfigForInformant(InformantType.SON),
  ...getFieldConfigForInformant(InformantType.DAUGHTER),
  ...getFieldConfigForInformant(InformantType.SON_IN_LAW),
  ...getFieldConfigForInformant(InformantType.DAUGHTER_IN_LAW),
  ...getFieldConfigForInformant(InformantType.MOTHER),
  ...getFieldConfigForInformant(InformantType.FATHER),
  ...getFieldConfigForInformant(InformantType.GRANDSON),
  ...getFieldConfigForInformant(InformantType.GRANDDAUGHTER),
  {
    id: 'requester.idType',
    type: FieldType.SELECT,
    required: true,
    label: {
      defaultMessage: 'Type of ID',
      description: 'This is the label for the field',
      id: 'event.death.action.correction.form.section.requester.idType.label'
    },
    options: idTypeOptions,
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: field('requester.type').isEqualTo('SOMEONE_ELSE')
      }
    ]
  },
  {
    id: 'requester.nid',
    type: FieldType.TEXT,
    required: true,
    label: {
      defaultMessage: 'ID Number',
      description: 'This is the label for the field',
      id: 'event.death.action.correction.form.section.requester.nid.label'
    },
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: and(
          field('requester.type').isEqualTo('SOMEONE_ELSE'),
          field('requester.idType').isEqualTo(IdType.NATIONAL_ID)
        )
      }
    ],
    validation: [nationalIdValidator('requester.nid')]
  },
  {
    id: 'requester.passport',
    type: FieldType.TEXT,
    required: true,
    label: {
      defaultMessage: 'ID Number',
      description: 'This is the label for the field',
      id: 'event.death.action.correction.form.section.requester.passport.label'
    },
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: and(
          field('requester.type').isEqualTo('SOMEONE_ELSE'),
          field('requester.idType').isEqualTo(IdType.PASSPORT)
        )
      }
    ],
    parent: field('informant.relation')
  },
  {
    id: 'requester.brn',
    type: FieldType.TEXT,
    required: true,
    label: {
      defaultMessage: 'ID Number',
      description: 'This is the label for the field',
      id: 'event.death.action.correction.form.section.requester.brn.label'
    },
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: and(
          field('requester.type').isEqualTo('SOMEONE_ELSE'),
          field('requester.idType').isEqualTo(IdType.BIRTH_REGISTRATION_NUMBER)
        )
      }
    ]
  },
  {
    id: 'requester.name',
    type: FieldType.NAME,
    required: true,
    hideLabel: true,
    label: {
      id: 'event.death.action.correction.form.section.requester.name.label',
      defaultMessage: 'Name',
      description: 'This is the label for the field'
    },
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: field('requester.type').isEqualTo('SOMEONE_ELSE')
      }
    ]
  },
  {
    id: 'requester.relationship',
    type: 'TEXT',
    required: true,
    label: {
      id: 'event.death.action.correction.form.section.requester.relationship.label',
      defaultMessage: 'Relationship to child',
      description: 'This is the label for the field'
    },
    placeholder: {
      defaultMessage: 'eg. Grandmother',
      description: 'This is the placeholder for the field',
      id: 'event.death.action.correction.form.section.requester.relationship.placeholder'
    },
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: field('requester.type').isEqualTo('SOMEONE_ELSE')
      }
    ]
  }
]
