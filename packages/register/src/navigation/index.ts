import { push, goBack as back } from 'react-router-redux'
import {
  SELECT_INFORMANT,
  DRAFT_BIRTH_PARENT_FORM,
  DRAFT_BIRTH_PARENT_FORM_TAB,
  SELECT_VITAL_EVENT,
  REVIEW_BIRTH_PARENT_FORM_TAB
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
export const GO_TO_REVIEW_TAB = 'navigation/GO_TO_REVIEW_TAB'
type GoToReviewTabAction = {
  type: typeof GO_TO_REVIEW_TAB
  payload: {
    reviewDraftId: number
    reviewTabId: string
    fieldHash?: string
  }
}

export type Action = GoToTabAction | GoToReviewTabAction

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

export function goToBirthRegistrationForReview(draftId: number) {
  return push(
    formatUrl(REVIEW_BIRTH_PARENT_FORM_TAB, {
      draftId: draftId.toString(),
      review: 'review',
      tabId: 'review'
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
export function goToReviewTab(reviewDraftId: number, reviewTabId: string) {
  return {
    type: GO_TO_REVIEW_TAB,
    payload: { reviewDraftId, reviewTabId }
  }
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
    case GO_TO_REVIEW_TAB:
      const { reviewDraftId, reviewTabId } = action.payload
      return loop(
        state,
        Cmd.action(
          push(
            formatUrl(REVIEW_BIRTH_PARENT_FORM_TAB, {
              draftId: reviewDraftId.toString(),
              review: 'review',
              tabId: reviewTabId
            })
          )
        )
      )
  }
}
