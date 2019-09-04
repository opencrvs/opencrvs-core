import {
  IFieldTransformer,
  ExecutorKey,
  IEventWiseKey,
  TransformableData
} from '@register/pdfRenderer/transformer/types'
import {
  Event,
  IFormData,
  IFormSectionData,
  IFormFieldValue
} from '@opencrvs/register/src/forms'
import { IApplication } from '@register/applications'
import { MessageDescriptor } from 'react-intl'
import { IUserDetails } from '@register/utils/userUtils'
import { IOfflineData } from '@register/offline/reducer'
import {
  TRANSFORMER_BASE_RESOURCE_DATA,
  TRANSFORMER_BASE_USER_DETAILS
} from '@register/pdfRenderer/transformer/constants'

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

export function getTransformerDataByBase(
  transformerDef: IFieldTransformer,
  application: IApplication,
  userdetails: IUserDetails,
  offlineResource: IOfflineData
): TransformableData {
  if (!transformerDef.baseData) {
    return application
  } else if (
    transformerDef.baseData.toLowerCase() === TRANSFORMER_BASE_USER_DETAILS
  ) {
    return userdetails
  } else if (
    transformerDef.baseData.toLowerCase() === TRANSFORMER_BASE_RESOURCE_DATA
  ) {
    return offlineResource
  }
  return application
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
