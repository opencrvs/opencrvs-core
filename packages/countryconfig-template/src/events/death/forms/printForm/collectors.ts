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
import { CollectorType } from './collector-other'

const spouseDoesNotExist = (informantType: InformantTypeKey) => {
  return {
    type: ConditionalType.SHOW,
    conditional: and(
      field('informant.relation').isEqualTo(informantType),
      field('spouse.name').isFalsy()
    )
  }
}

const spouseExists = (informantType: InformantTypeKey) => {
  return {
    type: ConditionalType.SHOW,
    conditional: and(
      field('informant.relation').isEqualTo(informantType),
      not(field('spouse.name').isFalsy())
    )
  }
}

const getFieldConfigForInformant = (informantType: InformantTypeKey) => {
  return [
    {
      ...commonConfigs,
      conditionals: [spouseDoesNotExist(informantType)],
      options: [getInformantOption(informantType), otherOption]
    },
    {
      ...commonConfigs,
      conditionals: [spouseExists(informantType)],
      options: [getInformantOption(informantType), spouseOption, otherOption]
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
      id: `v2.event.death.action.certificate.form.section.requester.informant.${informantType.toLowerCase()}.label`,
      defaultMessage,
      description: 'This is the label for the field'
    },
    value: 'INFORMANT'
  }
}

const spouseOption = {
  label: {
    id: 'event.death.action.certificate.form.section.requester.spouse.label',
    defaultMessage: 'Print and issue to Spouse',
    description: 'This is the label for the field'
  },
  value: InformantType.SPOUSE
}

const otherOption = {
  label: {
    id: 'event.death.action.certificate.form.section.requester.other.label',
    defaultMessage: 'Print and issue to someone else',
    description: 'This is the label for the field'
  },
  value: CollectorType.SOMEONE_ELSE
}

const requesterLabel = {
  defaultMessage: 'Requester',
  description: 'This is the label for the field',
  id: 'event.death.action.certificate.form.section.requester.label'
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
    conditionals: [spouseExists(InformantType.SPOUSE)],
    options: [getInformantOption(InformantType.SPOUSE), otherOption]
  },
  ...getFieldConfigForInformant(InformantType.SON),
  ...getFieldConfigForInformant(InformantType.DAUGHTER),
  ...getFieldConfigForInformant(InformantType.SON_IN_LAW),
  ...getFieldConfigForInformant(InformantType.DAUGHTER_IN_LAW),
  ...getFieldConfigForInformant(InformantType.MOTHER),
  ...getFieldConfigForInformant(InformantType.FATHER),
  ...getFieldConfigForInformant(InformantType.GRANDSON),
  ...getFieldConfigForInformant(InformantType.GRANDDAUGHTER),
  ...getFieldConfigForInformant(InformantType.OTHER)
]
