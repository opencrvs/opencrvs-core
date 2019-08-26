import { IFieldTransformer } from '@register/pdfRenderer/transformer/types'
import {
  Event,
  IFormData,
  IFormSectionData,
  IFormFieldValue
} from '@opencrvs/register/src/forms'
import moment from 'moment'
import { TransformerData } from './types'
import { IUserDetails, IGQLLocation } from '@register/utils/userUtils'
import { GQLHumanName } from '@opencrvs/gateway/src/graphql/schema'

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

export function getEventMessageDescription(
  event: Event
): ReactIntl.FormattedMessage.MessageDescriptor {
  return eventMessageDescriptor[event]
}

export function getEventDifference(application: TransformerData) {
  let eventDate
  if (application.event === Event.BIRTH) {
    eventDate = application.data.child.childBirthDate as string
  } else if (application.event === Event.DEATH) {
    eventDate = application.data.deathEvent.deathDate as string
  }
  if (!eventDate) {
    throw new Error(`No event date found for given event: ${application.event}`)
  }
  const eventAgeInDays = moment(Date.now()).diff(moment(eventDate), 'days')
  if (eventAgeInDays <= 45) {
    return '45d-'
  } else if (eventAgeInDays > 1825) {
    return '5y+'
  } else {
    return '45d+'
  }
}
