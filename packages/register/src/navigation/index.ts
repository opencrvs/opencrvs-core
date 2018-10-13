import { push, goBack as back } from 'react-router-redux'
import {
  SELECT_INFORMANT,
  DRAFT_BIRTH_PARENT_FORM,
  DRAFT_BIRTH_PARENT_DOCUMENT_UPLOAD_FORM,
  DRAFT_BIRTH_PARENT_FORM_TAB,
  SELECT_VITAL_EVENT
} from 'src/navigation/routes'
import { loop, Cmd } from 'redux-loop'

function formatUrl(url: string, props: { [key: string]: string }) {
  return Object.keys(props).reduce(
    (str, key) => str.replace(`:${key}`, props[key]),
    url
  )
}

export const GO_TO_TAB = 'navigation/GO_TO_TAB'
type GoToTabAction = {
  type: typeof GO_TO_TAB
  payload: {
    draftId: number
    tabId: string
    fieldNameHash?: string
  }
}

export type Action = GoToTabAction

export function goToBirthRegistration() {
  return push(SELECT_INFORMANT)
}
export function goToEvents() {
  return push(SELECT_VITAL_EVENT)
}

export function goBack() {
  return back()
}

export function goToBirthRegistrationAsParent(draftId: number) {
  return push(
    formatUrl(DRAFT_BIRTH_PARENT_FORM, { draftId: draftId.toString() })
  )
}

export function goToBirthRegistrationDocumentUpload(draftId: number) {
  return push(
    formatUrl(DRAFT_BIRTH_PARENT_DOCUMENT_UPLOAD_FORM, {
      draftId: draftId.toString()
    })
  )
}

export function goToTab(
  draftId: number,
  tabId: string,
  fieldNameHash?: string
) {
  return { type: GO_TO_TAB, payload: { draftId, tabId, fieldNameHash } }
}

export type INavigationState = undefined

export function navigationReducer(state: INavigationState, action: Action) {
  switch (action.type) {
    case GO_TO_TAB:
      const { fieldNameHash, draftId, tabId } = action.payload
      return loop(
        state,
        Cmd.action(
          push(
            formatUrl(DRAFT_BIRTH_PARENT_FORM_TAB, {
              draftId: draftId.toString(),
              tabId
            }) + (fieldNameHash ? `#${fieldNameHash}` : '')
          )
        )
      )
  }
}
