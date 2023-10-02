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
  ExecutorKey,
  IEventWiseKey,
  Condition,
  ConditionOperation
} from '@client/pdfRenderer/transformer/types'
import {
  IFormData,
  IFormSectionData,
  IFormFieldValue
} from '@opencrvs/client/src/forms'
import { Event } from '@client/utils/gateway'
import { IDeclaration } from '@client/declarations'
import { MessageDescriptor } from 'react-intl'

const eventMessageDescriptor = {
  [Event.Birth]: {
    defaultMessage: 'Birth',
    description: 'A label from the birth event',
    id: 'constants.birth'
  },
  [Event.Death]: {
    defaultMessage: 'Death',
    description: 'A label from the death event',
    id: 'constants.death'
  },
  [Event.Marriage]: {
    defaultMessage: 'Marriage',
    description: 'A label from the marriage event',
    id: 'constants.marriage'
  }
}
export function getValueFromDeclarationDataByKey(
  data: IFormData,
  valueKey: string
) {
  const keyTree: string[] = valueKey.split('.')

  let valueObject: IFormSectionData | IFormFieldValue | null = null

  keyTree.forEach((keyNode) => {
    valueObject =
      valueObject === null
        ? data[keyNode] || null
        : (valueObject as IFormSectionData)[keyNode]
  })
  if (valueObject === null) {
    // eslint-disable-next-line no-console
    console.error(`Given value key structure is not valid: ${valueKey}`)
  }
  return valueObject
}

export function getEventMessageDescription(event: Event): MessageDescriptor {
  return eventMessageDescriptor[event]
}

function getExecutorKeyValue(key: ExecutorKey) {
  if (key === 'CURRENT_DATE') {
    return Date.now()
  }
  throw new Error('Invalid executor key found')
}

export function getExecutorFieldValue(
  key: ExecutorKey | IEventWiseKey,
  declaration: IDeclaration
) {
  let value = null
  if (typeof key === 'string') {
    value = getExecutorKeyValue(key as ExecutorKey)
  } else {
    value = getValueFromDeclarationDataByKey(
      declaration.data,
      (key as IEventWiseKey)[declaration.event]
    )
  }
  return value
}

function executeConditionalOperation(
  operation: ConditionOperation,
  conditionInputs: string[],
  value: string
) {
  switch (operation) {
    case ConditionOperation.VALUE_EXISTS:
      return value !== ''
    case ConditionOperation.VALUE_DOES_NOT_EXISTS:
      return value === ''
    case ConditionOperation.DOES_NOT_MATCH:
      return !conditionInputs.includes(value)
    default:
      return conditionInputs.includes(value)
  }
}

function getConditionalOperationEnumByValue(value: string | undefined) {
  if (!value) {
    return ConditionOperation.MATCH
  }
  return ConditionOperation[value as keyof typeof ConditionOperation]
}

export function getMatchedCondition(
  conditions: Condition[],
  declarationData: IFormData
) {
  return conditions.find((conditionObj) => {
    try {
      if (!conditionObj.condition) {
        return true
      }
      return executeConditionalOperation(
        getConditionalOperationEnumByValue(conditionObj.condition.operation),
        conditionObj.condition.values,
        // Will return empty string when value is not found for given key
        getValueFromDeclarationDataByKey(
          declarationData,
          conditionObj.condition.key || ''
        ) || ''
      )
    } catch (error) {
      /* eslint-disable no-console */
      console.info(`PDF UTILS ERROR: ${error}`)
      /* eslint-enable no-console */
      return false
    }
  })
}
