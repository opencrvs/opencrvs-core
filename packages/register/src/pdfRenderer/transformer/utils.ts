import { IFieldTransformer } from '@register/pdfRenderer'
import { Event } from '@opencrvs/register/src/forms'

interface IData {
  // It's really hard to understand what can be the possible type here
  [key: string]: any
}
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
  data: IData,
  valueKey: string
) {
  const keyTree: string[] = valueKey.split('.')

  let valueObject: IData | null = null
  try {
    keyTree.forEach(keyNode => {
      valueObject = valueObject === null ? data[keyNode] : valueObject[keyNode]
    })
  } catch (error) {
    console.error(`Given value key structure is not valid: ${valueKey}`)
    return null
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

export function getEventMessageDescription(
  event: Event
): ReactIntl.FormattedMessage.MessageDescriptor {
  return eventMessageDescriptor[event]
}
