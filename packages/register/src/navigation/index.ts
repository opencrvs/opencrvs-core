import { push, goBack as back } from 'react-router-redux'
import {
  SELECT_INFORMANT,
  HOME,
  WORK_QUEUE,
  DRAFT_BIRTH_PARENT_FORM,
  SELECT_VITAL_EVENT
} from 'src/navigation/routes'
import { loop, Cmd } from 'redux-loop'
import { getToken } from 'src/utils/authUtils'
import { config } from 'src/config'

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
    tabRoute: string
    draftId: string
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

export function goToHome() {
  return push(HOME)
}

export function goToPerformance() {
  window.location.assign(`${config.PERFORMANCE_URL}?token=${getToken()}`)
}

export function goToWorkQueue() {
  return push(WORK_QUEUE)
}

export function goToBirthRegistrationAsParent(draftId: string) {
  return push(
    formatUrl(DRAFT_BIRTH_PARENT_FORM, { draftId: draftId.toString() })
  )
}

export function goToTab(
  tabRoute: string,
  draftId: string,
  tabId: string,
  fieldNameHash?: string
) {
  return {
    type: GO_TO_TAB,
    payload: { draftId, tabId, fieldNameHash, tabRoute }
  }
}

export type INavigationState = undefined

export function navigationReducer(state: INavigationState, action: Action) {
  switch (action.type) {
    case GO_TO_TAB:
      const { fieldNameHash, draftId, tabId, tabRoute } = action.payload
      return loop(
        state,
        Cmd.action(
          push(
            formatUrl(tabRoute, {
              draftId: draftId.toString(),
              tabId
            }) + (fieldNameHash ? `#${fieldNameHash}` : '')
          )
        )
      )
  }
}
