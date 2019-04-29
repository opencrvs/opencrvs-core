import { push, goBack as back } from 'react-router-redux'
import {
  SELECT_INFORMANT,
  HOME,
  SEARCH_RESULT,
  DRAFT_BIRTH_PARENT_FORM,
  DRAFT_DEATH_FORM,
  SELECT_VITAL_EVENT,
  MY_RECORDS,
  MY_DRAFTS,
  REVIEW_DUPLICATES,
  PRINT_CERTIFICATE,
  WORK_QUEUE_TAB
} from 'navigation/routes'
import { loop, Cmd } from 'redux-loop'
import { getToken } from 'utils/authUtils'

export interface IDynamicValues {
  [key: string]: any
}

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
    event: string
    fieldNameHash?: string
    historyState?: IDynamicValues
  }
}
export const GO_TO_WORK_QUEUE = 'navigation/GO_TO_WORK_QUEUE'
type GoToWorkQueue = {
  type: typeof GO_TO_WORK_QUEUE
  payload: {
    tabId: string
  }
}

export type Action = GoToTabAction | GoToWorkQueue

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
  window.location.assign(`${window.config.PERFORMANCE_URL}?token=${getToken()}`)
}

export function goToSearchResult(searchText?: string) {
  return push(
    formatUrl(SEARCH_RESULT, {
      searchText: (searchText && searchText.toString()) || ''
    })
  )
}
export function goToMyRecords() {
  return push(MY_RECORDS)
}
export function goToMyDrafts() {
  return push(MY_DRAFTS)
}

export function goToBirthRegistrationAsParent(draftId: string) {
  return push(
    formatUrl(DRAFT_BIRTH_PARENT_FORM, { draftId: draftId.toString() })
  )
}

export function goToReviewDuplicate(applicationId: string) {
  return push(
    formatUrl(REVIEW_DUPLICATES, { applicationId: applicationId.toString() })
  )
}

export function goToPrintCertificate(registrationId: string, event: string) {
  return push(
    formatUrl(PRINT_CERTIFICATE, {
      registrationId: registrationId.toString(),
      eventType: event.toLowerCase().toString()
    })
  )
}

export function goToDeathRegistration(draftId: string) {
  return push(formatUrl(DRAFT_DEATH_FORM, { draftId: draftId.toString() }))
}

export function goToWorkQueueTab(tabId: string) {
  return {
    type: GO_TO_WORK_QUEUE,
    payload: { tabId }
  }
}

export function goToTab(
  tabRoute: string,
  draftId: string,
  tabId: string,
  event: string,
  fieldNameHash?: string,
  historyState?: IDynamicValues
) {
  return {
    type: GO_TO_TAB,
    payload: { draftId, tabId, event, fieldNameHash, tabRoute, historyState }
  }
}

export type INavigationState = undefined

export function navigationReducer(state: INavigationState, action: Action) {
  switch (action.type) {
    case GO_TO_TAB:
      const {
        fieldNameHash,
        draftId,
        tabId,
        event,
        tabRoute,
        historyState
      } = action.payload
      return loop(
        state,
        Cmd.action(
          push(
            formatUrl(tabRoute, {
              draftId: draftId.toString(),
              tabId,
              event
            }) + (fieldNameHash ? `#${fieldNameHash}` : ''),
            historyState
          )
        )
      )
    case GO_TO_WORK_QUEUE:
      const { tabId: workQueueTabId } = action.payload
      return loop(
        state,
        Cmd.action(push(formatUrl(WORK_QUEUE_TAB, { tabId: workQueueTabId })))
      )
  }
}
