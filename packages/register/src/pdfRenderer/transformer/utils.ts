import {
  IFieldTransformer,
  ExecutorKey,
  IEventWiseKey
} from '@register/pdfRenderer/transformer/types'
import {
  Event,
  IFormData,
  IFormSectionData,
  IFormFieldValue
} from '@opencrvs/register/src/forms'
import { IApplication } from '@register/applications'
import { MessageDescriptor } from 'react-intl'

const eventMessageDescriptor = {
  [Event.BIRTH]: {
    defaultMessage: 'Birth',
    description: 'A label from the birth event',
    id: 'constants.birth'
  },
  [Event.DEATH]: {
    defaultMessage: 'Death',
    description: 'A label from the death event',
    id: 'constants.death'
  }
}
export function getValueFromApplicationDataByKey(
  data: IFormData,
  valueKey: string
) {
  const keyTree: string[] = valueKey.split('.')

  let valueObject: IFormSectionData | IFormFieldValue | null = null

  try {
    keyTree.forEach(keyNode => {
      valueObject =
        valueObject === null
          ? data[keyNode]
          : (valueObject as IFormSectionData)[keyNode]
    })
  } catch (error) {
    throw new Error(`Given value key structure is not valid: ${valueKey}`)
  }
  if (valueObject === null) {
    throw new Error(`Given value key structure is not valid: ${valueKey}`)
  }
  return valueObject
}

export function isUserDetailsDataBase(transformerDef: IFieldTransformer) {
  return (
    (transformerDef.baseData &&
      transformerDef.baseData.toLowerCase() === 'userdetails') ||
    false
  )
}

export function getEventMessageDescription(event: Event): MessageDescriptor {
  return eventMessageDescriptor[event]
}

export function getExecutorKeyValue(key: ExecutorKey) {
  if (key === 'CURRENT_DATE') {
    return Date.now()
  }
  throw new Error('Invalid executor key found')
}

export function getExecutorFieldValue(
  key: ExecutorKey | IEventWiseKey,
  application: IApplication
) {
  let value = null
  if (typeof key === 'string') {
    value = getExecutorKeyValue(key as ExecutorKey)
  } else {
    value = getValueFromApplicationDataByKey(
      application.data,
      (key as IEventWiseKey)[application.event]
    )
  }
  return value
}
