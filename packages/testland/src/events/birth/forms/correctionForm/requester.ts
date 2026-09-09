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
  FieldType,
  not
} from '@opencrvs/toolkit/events'
import { InformantType, InformantTypeKey } from '../pages/informant'
import {
  informantMessageDescriptors,
  IdType,
  idTypeOptions
} from '@countryconfig/events/utils'

import { nationalIdValidator } from '../../validators'

const commonConfigs = {
  id: 'requester.type',
  type: FieldType.SELECT,
  required: true,
  label: {
    defaultMessage: 'Requester',
    description: 'This is the label for the field',
    id: 'event.birth.action.correction.form.section.requester.label'
  }
}

const commonOptions = [
  {
    value: 'CHILD',
    label: {
      id: 'event.birth.action.correction.form.requester.type.child',
      defaultMessage: 'Child',
      description: 'This is the label for the correction requester field'
    }
  },
  {
    value: 'LEGAL_GUARDIAN',
    label: {
      id: 'event.birth.action.correction.form.requester.type.legalGuardian',
      defaultMessage: 'Legal Guardian',
      description: 'This is the label for the correction requester field'
    }
  },
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

const onlyMotherExist = (informantType: InformantTypeKey) => {
  return {
    type: ConditionalType.SHOW,
    conditional: and(
      field('informant.relation').isEqualTo(informantType),
      not(field('mother.name').isFalsy()),
      field('father.name').isFalsy()
    )
  }
}

const onlyFatherExist = (informantType: InformantTypeKey) => {
  return {
    type: ConditionalType.SHOW,
    conditional: and(
      field('informant.relation').isEqualTo(informantType),
      not(field('father.name').isFalsy()),
      field('mother.name').isFalsy()
    )
  }
}

const fatherMotherBothExist = (informantType: InformantTypeKey) => {
  return {
    type: ConditionalType.SHOW,
    conditional: and(
      field('informant.relation').isEqualTo(informantType),
      not(field('father.name').isFalsy()),
      not(field('mother.name').isFalsy())
    )
  }
}

const fatherMotherBothDoesNotExist = (informantType: InformantTypeKey) => {
  return {
    type: ConditionalType.SHOW,
    conditional: and(
      field('informant.relation').isEqualTo(informantType),
      field('father.name').isFalsy(),
      field('mother.name').isFalsy()
    )
  }
}

const getFieldConfigForInformant = (informantType: InformantTypeKey) => {
  return [
    {
      ...commonConfigs,
      conditionals: [onlyMotherExist(informantType)],
      options: [
        getInformantOption(informantType),
        motherOption,
        ...commonOptions
      ]
    },
    {
      ...commonConfigs,
      conditionals: [onlyFatherExist(informantType)],
      options: [
        getInformantOption(informantType),
        fatherOption,
        ...commonOptions
      ]
    },
    {
      ...commonConfigs,
      conditionals: [fatherMotherBothExist(informantType)],
      options: [
        getInformantOption(informantType),
        fatherOption,
        motherOption,
        ...commonOptions
      ]
    },
    {
      ...commonConfigs,
      conditionals: [fatherMotherBothDoesNotExist(informantType)],
      options: [getInformantOption(informantType), ...commonOptions]
    }
  ]
}

const getInformantOption = (informantType: InformantTypeKey) => {
  const defaultMessage =
    informantType === InformantType.OTHER
      ? `Informant ({informant.other.relation})`
      : `Informant (${informantMessageDescriptors[informantType].defaultMessage})`

  return {
    label: {
      id: `v2.event.birth.action.correction.form.section.requester.informant.${informantType.toLowerCase()}.label`,
      defaultMessage,
      description: 'This is the label for the field'
    },
    value: 'INFORMANT'
  }
}

const fatherOption = {
  label: {
    id: 'event.birth.action.correction.form.section.requester.father.label',
    defaultMessage: 'Father',
    description: 'This is the label for the field'
  },
  value: InformantType.FATHER
}

const motherOption = {
  label: {
    id: 'event.birth.action.correction.form.section.requester.mother.label',
    defaultMessage: 'Mother',
    description: 'This is the label for the field'
  },
  value: InformantType.MOTHER
}

export const correctionFormRequesters: FieldConfig[] = [
  {
    ...commonConfigs,
    conditionals: [onlyMotherExist(InformantType.MOTHER)],
    options: [getInformantOption(InformantType.MOTHER), ...commonOptions]
  },
  {
    ...commonConfigs,
    conditionals: [fatherMotherBothExist(InformantType.MOTHER)],
    options: [
      getInformantOption(InformantType.MOTHER),
      fatherOption,
      ...commonOptions
    ]
  },
  {
    ...commonConfigs,
    conditionals: [onlyFatherExist(InformantType.FATHER)],
    options: [getInformantOption(InformantType.FATHER), ...commonOptions]
  },
  {
    ...commonConfigs,
    conditionals: [fatherMotherBothExist(InformantType.FATHER)],
    options: [
      getInformantOption(InformantType.FATHER),
      motherOption,
      ...commonOptions
    ]
  },
  ...getFieldConfigForInformant(InformantType.OTHER),
  ...getFieldConfigForInformant(InformantType.BROTHER),
  ...getFieldConfigForInformant(InformantType.GRANDFATHER),
  ...getFieldConfigForInformant(InformantType.GRANDMOTHER),
  ...getFieldConfigForInformant(InformantType.SISTER),
  ...getFieldConfigForInformant(InformantType.LEGAL_GUARDIAN),
  {
    id: 'requester.idType',
    type: FieldType.SELECT,
    required: true,
    label: {
      defaultMessage: 'Type of ID',
      description: 'This is the label for the field',
      id: 'event.birth.action.correction.form.section.requester.idType.label'
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
      id: 'event.birth.action.correction.form.section.requester.nid.label'
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
      id: 'event.birth.action.correction.form.section.requester.passport.label'
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
      id: 'event.birth.action.correction.form.section.requester.brn.label'
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
      id: 'event.birth.action.correction.form.section.requester.name.label',
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
      id: 'event.birth.action.correction.form.section.requester.relationship.label',
      defaultMessage: 'Relationship to child',
      description: 'This is the label for the field'
    },
    placeholder: {
      defaultMessage: 'eg. Grandmother',
      description: 'This is the placeholder for the field',
      id: 'event.birth.action.correction.form.section.requester.relationship.placeholder'
    },
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: field('requester.type').isEqualTo('SOMEONE_ELSE')
      }
    ]
  }
]
