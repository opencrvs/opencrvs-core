import { push } from 'react-router-redux'
import {
  SELECT_INFORMANT,
  DRAFT_BIRTH_PARENT_FORM,
  DRAFT_BIRTH_PARENT_FORM_TAB
} from './routes'

function formatUrl(url: string, props: { [key: string]: string }) {
  return Object.keys(props).reduce(
    (str, key) => str.replace(`:${key}`, props[key]),
    url
  )
}

export function goToBirthRegistration() {
  return push(SELECT_INFORMANT)
}

export function goToBirthRegistrationAsParent(draftId: number) {
  return push(
    formatUrl(DRAFT_BIRTH_PARENT_FORM, { draftId: draftId.toString() })
  )
}

export function goToTab(
  draftId: number,
  tabId: string,
  fieldNameHash?: string
) {
  return push(
    formatUrl(DRAFT_BIRTH_PARENT_FORM_TAB, {
      draftId: draftId.toString(),
      tabId
    }) + (fieldNameHash ? `#${fieldNameHash}` : '')
  )
}
