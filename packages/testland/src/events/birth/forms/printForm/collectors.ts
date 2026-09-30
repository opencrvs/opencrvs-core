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
import { informantMessageDescriptors } from '@countryconfig/events/utils'

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

const printInAdvanceOption = {
  label: {
    id: 'event.birth.action.certificate.form.section.requester.printInAdvance.label',
    defaultMessage: 'Print in advance of issuance',
    description: 'This is the label for the print-in-advance of issuance field'
  },
  value: 'PRINT_IN_ADVANCE'
}

const getFieldConfigForInformant = (informantType: InformantTypeKey) => {
  return [
    {
      ...commonConfigs,
      conditionals: [onlyMotherExist(informantType)],
      options: [
        getInformantOption(informantType),
        motherOption,
        otherOption,
        printInAdvanceOption
      ]
    },
    {
      ...commonConfigs,
      conditionals: [onlyFatherExist(informantType)],
      options: [
        getInformantOption(informantType),
        fatherOption,
        otherOption,
        printInAdvanceOption
      ]
    },
    {
      ...commonConfigs,
      conditionals: [fatherMotherBothExist(informantType)],
      options: [
        getInformantOption(informantType),
        fatherOption,
        motherOption,
        otherOption,
        printInAdvanceOption
      ]
    },
    {
      ...commonConfigs,
      conditionals: [fatherMotherBothDoesNotExist(informantType)],
      options: [
        getInformantOption(informantType),
        otherOption,
        printInAdvanceOption
      ]
    }
  ]
}

const getInformantOption = (informantType: InformantTypeKey) => {
  const defaultMessage =
    informantType === InformantType.OTHER
      ? `Print and issue to Informant`
      : `Print and issue to Informant (${informantMessageDescriptors[informantType].defaultMessage})`

  return {
    label: {
      id: `v2.event.birth.action.certificate.form.section.requester.informant.${informantType.toLowerCase()}.label`,
      defaultMessage,
      description: 'This is the label for the field'
    },
    value: 'INFORMANT'
  }
}

const fatherOption = {
  label: {
    id: 'event.birth.action.certificate.form.section.requester.father.label',
    defaultMessage: 'Print and issue to Father',
    description: 'This is the label for the field'
  },
  value: InformantType.FATHER
}

const motherOption = {
  label: {
    id: 'event.birth.action.certificate.form.section.requester.mother.label',
    defaultMessage: 'Print and issue to Mother',
    description: 'This is the label for the field'
  },
  value: InformantType.MOTHER
}

const otherOption = {
  label: {
    id: 'event.birth.action.certificate.form.section.requester.other.label',
    defaultMessage: 'Print and issue to someone else',
    description: 'This is the label for the field'
  },
  value: 'SOMEONE_ELSE'
}

const requesterLabel = {
  defaultMessage: 'Requester',
  description: 'This is the label for the field',
  id: 'event.birth.action.certificate.form.section.requester.label'
}

const commonConfigs = {
  id: 'collector.requesterId',
  type: FieldType.SELECT,
  required: true,
  label: requesterLabel
}

export const printCertificateCollectors: FieldConfig[] = [
  {
    ...commonConfigs,
    conditionals: [onlyMotherExist(InformantType.MOTHER)],
    options: [
      getInformantOption(InformantType.MOTHER),
      otherOption,
      printInAdvanceOption
    ]
  },
  {
    ...commonConfigs,
    conditionals: [fatherMotherBothExist(InformantType.MOTHER)],
    options: [
      getInformantOption(InformantType.MOTHER),
      fatherOption,
      otherOption,
      printInAdvanceOption
    ]
  },
  {
    ...commonConfigs,
    conditionals: [onlyFatherExist(InformantType.FATHER)],
    options: [
      getInformantOption(InformantType.FATHER),
      otherOption,
      printInAdvanceOption
    ]
  },
  {
    ...commonConfigs,
    conditionals: [fatherMotherBothExist(InformantType.FATHER)],
    options: [
      getInformantOption(InformantType.FATHER),
      motherOption,
      otherOption,
      printInAdvanceOption
    ]
  },
  ...getFieldConfigForInformant(InformantType.OTHER),
  ...getFieldConfigForInformant(InformantType.BROTHER),
  ...getFieldConfigForInformant(InformantType.GRANDFATHER),
  ...getFieldConfigForInformant(InformantType.GRANDMOTHER),
  ...getFieldConfigForInformant(InformantType.SISTER),
  ...getFieldConfigForInformant(InformantType.LEGAL_GUARDIAN)
]
