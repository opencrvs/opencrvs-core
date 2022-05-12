/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */

import {
  Event,
  UserSection,
  CorrectionSection,
  WizardSection
} from '@client/forms'
import {
  CERTIFICATE_COLLECTOR,
  CREATE_USER,
  CREATE_USER_ON_LOCATION,
  CREATE_USER_SECTION,
  DRAFT_BIRTH_INFORMANT_FORM,
  DRAFT_BIRTH_PARENT_FORM,
  DRAFT_DEATH_FORM,
  EVENT_INFO,
  EVENT_COMPLETENESS_RATES,
  HOME,
  PERFORMANCE_FIELD_AGENT_LIST,
  PERFORMANCE_HOME,
  PRINT_CERTIFICATE_PAYMENT,
  REGISTRAR_HOME_TAB,
  REVIEW_CERTIFICATE,
  REVIEW_DUPLICATES,
  REVIEW_USER_DETAILS,
  REVIEW_USER_FORM,
  SEARCH,
  SEARCH_RESULT,
  SELECT_BIRTH_INFORMANT,
  SELECT_DEATH_INFORMANT,
  SELECT_VITAL_EVENT,
  SETTINGS,
  SYS_ADMIN_HOME_TAB,
  TEAM_SEARCH,
  VERIFY_COLLECTOR,
  WORKFLOW_STATUS,
  TEAM_USER_LIST,
  USER_PROFILE,
  CERTIFICATE_CONFIG,
  CHANGE_PHONE,
  APPLICATION_CONFIG,
  CERTIFICATE_CORRECTION,
  VERIFY_CORRECTOR,
  DECLARATION_RECORD_AUDIT,
  FORM_CONFIG_WIZARD,
  FORM_CONFIG_HOME
} from '@client/navigation/routes'
import { NATL_ADMIN_ROLES } from '@client/utils/constants'
import { IUserDetails } from '@client/utils/userUtils'
import { IStatusMapping } from '@client/views/SysAdmin/Performance/reports/operational/StatusWiseDeclarationCountView'
import {
  getJurisdictionLocationIdFromUserDetails,
  CompletenessRateTime
} from '@client/views/SysAdmin/Performance/utils'
import { ISearchLocation } from '@opencrvs/components/lib/interface'
import {
  goBack as back,
  push,
  replace,
  goForward as forward
} from 'connected-react-router'
import { stringify } from 'query-string'
import { Cmd, loop } from 'redux-loop'
import { IRecordAuditTabs } from '@client/views/Home/RecordAudit'
import subYears from 'date-fns/subYears'
import { IWORKQUEUE_TABS } from '@client/components/interface/Navigation'

export interface IDynamicValues {
  [key: string]: any
}

export function formatUrl(url: string, props: { [key: string]: string }) {
  const formattedUrl = Object.keys(props).reduce(
    (str, key) => str.replace(`:${key}`, props[key]),
    url
  )
  return formattedUrl.endsWith('?') ? formattedUrl.slice(0, -1) : formattedUrl
}

export const GO_TO_PAGE = 'navigation/GO_TO_PAGE'
type GoToPageAction = {
  type: typeof GO_TO_PAGE
  payload: {
    pageRoute: string
    declarationId: string
    pageId: string
    groupId?: string
    event: string
    fieldNameHash?: string
    historyState?: IDynamicValues
  }
}

export const GO_TO_REGISTRAR_HOME = 'navigation/GO_TO_REGISTRAR_HOME'
type GoToRegistrarHome = {
  type: typeof GO_TO_REGISTRAR_HOME
  payload: {
    tabId: string
  }
}

export const GO_TO_REVIEW_USER_DETAILS = 'navigation/GO_TO_REVIEW_USER_DETAILS'
type GoToReviewUserDetails = {
  type: typeof GO_TO_REVIEW_USER_DETAILS
  payload: {
    userId: string
  }
}

export const GO_TO_USER_PROFILE = 'navigation/GO_TO_USER_PROFILE'
type GoToUserProfile = {
  type: typeof GO_TO_USER_PROFILE
  payload: {
    userId: string
  }
}

export type Action =
  | GoToPageAction
  | GoToRegistrarHome
  | GoToSysAdminHome
  | GoToReviewUserDetails
  | GoToUserProfile
export const GO_TO_SYS_ADMIN_HOME = 'navigation/GO_TO_SYS_ADMIN_HOME'
type GoToSysAdminHome = {
  type: typeof GO_TO_SYS_ADMIN_HOME
  payload: {
    tabId: string
  }
}

export function goToBirthInformant(declarationId: string) {
  return push(
    formatUrl(SELECT_BIRTH_INFORMANT, {
      declarationId
    })
  )
}

export function goToDeathInformant(declarationId: string) {
  return push(
    formatUrl(SELECT_DEATH_INFORMANT, {
      declarationId
    })
  )
}

export function goToEventInfo(eventType: Event) {
  return push(formatUrl(EVENT_INFO, { eventType }))
}

export function goToEvents() {
  return push(SELECT_VITAL_EVENT)
}

export function goBack() {
  return back()
}

export function goForward() {
  return forward()
}

export function goToHome() {
  return push(HOME)
}

export function goToCertificateConfig() {
  return push(CERTIFICATE_CONFIG)
}

export function goToFormConfigHome() {
  return push(FORM_CONFIG_HOME)
}

export function goToApplicationConfig() {
  return push(APPLICATION_CONFIG)
}

export function goToHomeTab(tabId: string, selectorId = '') {
  return push(formatUrl(REGISTRAR_HOME_TAB, { tabId, selectorId }))
}

type searchedLocation = {
  selectedLocation: ISearchLocation
}

export function goToTeamSearch(searchedLocation?: searchedLocation) {
  return searchedLocation && searchedLocation.selectedLocation
    ? push(TEAM_SEARCH, { selectedLocation: searchedLocation.selectedLocation })
    : push(TEAM_SEARCH)
}

export function goToPerformanceHome(
  timeStart: Date = subYears(new Date(Date.now()), 1),
  timeEnd: Date = new Date(Date.now()),
  locationId?: string
) {
  return push({
    pathname: PERFORMANCE_HOME,
    search: stringify({
      locationId,
      timeStart: timeStart.toISOString(),
      timeEnd: timeEnd.toISOString()
    })
  })
}

export function goToTeamUserList(selectedLocation: ISearchLocation) {
  return push({
    pathname: TEAM_USER_LIST,
    search: stringify({
      locationId: selectedLocation.id
    })
  })
}

export function goToSearchResult(
  searchText: string,
  searchType: string,
  mobile?: boolean
) {
  return mobile
    ? replace(
        formatUrl(SEARCH_RESULT, {
          searchText,
          searchType
        })
      )
    : push(
        formatUrl(SEARCH_RESULT, {
          searchText,
          searchType
        })
      )
}

export function goToSearch() {
  return push(SEARCH)
}

export function goToDeclarationRecordAudit(
  tab: IRecordAuditTabs,
  declarationId: string
) {
  return push(formatUrl(DECLARATION_RECORD_AUDIT, { tab, declarationId }))
}

export function goToBirthRegistrationAsParent(declarationId: string) {
  return push(
    formatUrl(DRAFT_BIRTH_PARENT_FORM, {
      declarationId: declarationId.toString()
    })
  )
}
export function goToDeclarationContact(informant: string) {
  return push(
    formatUrl(DRAFT_BIRTH_INFORMANT_FORM, {
      informant: informant.toString()
    })
  )
}
export function goToReviewDuplicate(declarationId: string) {
  return push(
    formatUrl(REVIEW_DUPLICATES, { declarationId: declarationId.toString() })
  )
}

export function goToPrintCertificate(
  registrationId: string,
  event: string,
  groupId?: string
) {
  return push(
    formatUrl(CERTIFICATE_COLLECTOR, {
      registrationId: registrationId.toString(),
      eventType: event.toLowerCase().toString(),
      groupId: groupId || 'certCollector'
    })
  )
}

export function goToCertificateCorrection(
  declarationId: string,
  pageId: CorrectionSection
) {
  return push(
    formatUrl(CERTIFICATE_CORRECTION, {
      declarationId: declarationId.toString(),
      pageId: pageId.toString()
    })
  )
}

export function goToVerifyCorrector(declarationId: string, corrector: string) {
  return push(
    formatUrl(VERIFY_CORRECTOR, {
      declarationId: declarationId.toString(),
      corrector: corrector.toLowerCase().toString()
    })
  )
}

export function goToReviewCertificate(registrationId: string, event: Event) {
  return push(
    formatUrl(REVIEW_CERTIFICATE, {
      registrationId: registrationId.toString(),
      eventType: event
    }),
    { isNavigatedInsideApp: true }
  )
}

export function goToVerifyCollector(
  registrationId: string,
  event: string,
  collector: string
) {
  return push(
    formatUrl(VERIFY_COLLECTOR, {
      registrationId: registrationId.toString(),
      eventType: event.toLowerCase().toString(),
      collector: collector.toLowerCase().toString()
    })
  )
}

export function goToPrintCertificatePayment(
  registrationId: string,
  event: Event
) {
  return push(
    formatUrl(PRINT_CERTIFICATE_PAYMENT, {
      registrationId: registrationId.toString(),
      eventType: event
    })
  )
}

export function goToDeathRegistration(declarationId: string) {
  return push(
    formatUrl(DRAFT_DEATH_FORM, { declarationId: declarationId.toString() })
  )
}

export function goToRegistrarHomeTab(
  tabId: IWORKQUEUE_TABS,
  selectorId?: string
) {
  return {
    type: GO_TO_REGISTRAR_HOME,
    payload: { tabId, selectorId }
  }
}

export function goToFormConfigWizard(event: Event, section: WizardSection) {
  return push(
    formatUrl(FORM_CONFIG_WIZARD, {
      event: event,
      section: section
    })
  )
}

export function goToSysAdminHomeTab(tabId: string) {
  return {
    type: GO_TO_SYS_ADMIN_HOME,
    payload: { tabId }
  }
}

export function goToSettings() {
  return push(SETTINGS)
}
export function goToPhoneSettings() {
  return push(CHANGE_PHONE)
}

export function goToSettingsWithPhoneSuccessMsg(phonedNumberUpdated: boolean) {
  return push({
    pathname: SETTINGS,
    state: {
      phonedNumberUpdated
    }
  })
}

export function goToCreateNewUser() {
  return push(CREATE_USER)
}

export function goToCreateNewUserWithLocationId(locationId: string) {
  return push(formatUrl(CREATE_USER_ON_LOCATION, { locationId }))
}

export function goToCompletenessRates(
  eventType: Event,
  locationId: string | undefined,
  timeStart: Date,
  timeEnd: Date,
  time = CompletenessRateTime.WithinTarget
) {
  return push({
    pathname: formatUrl(EVENT_COMPLETENESS_RATES, { eventType }),
    search: stringify(
      locationId
        ? {
            locationId,
            timeStart: timeStart.toISOString(),
            timeEnd: timeEnd.toISOString(),
            time
          }
        : {
            timeStart: timeStart.toISOString(),
            timeEnd: timeEnd.toISOString(),
            time
          }
    )
  })
}

export function goToFieldAgentList(
  timeStart: string,
  timeEnd: string,
  locationId?: string
) {
  return push({
    pathname: PERFORMANCE_FIELD_AGENT_LIST,
    search: stringify({
      locationId,
      timeStart,
      timeEnd
    })
  })
}

export function goToWorkflowStatus(
  locationId: string,
  timeStart: Date,
  timeEnd: Date,
  status?: keyof IStatusMapping,
  event?: Event
) {
  return push({
    pathname: WORKFLOW_STATUS,
    search: stringify({
      locationId,
      status,
      event
    }),
    state: {
      timeStart,
      timeEnd
    }
  })
}
export function goToReviewUserDetails(userId: string): GoToReviewUserDetails {
  return {
    type: GO_TO_REVIEW_USER_DETAILS,
    payload: {
      userId
    }
  }
}

export function goToUserProfile(userId: string): GoToUserProfile {
  return {
    type: GO_TO_USER_PROFILE,
    payload: {
      userId
    }
  }
}

export const GO_TO_CREATE_USER_SECTION = 'navigation/GO_TO_CREATE_USER_SECTION'
type GoToCreateUserSection = {
  type: typeof GO_TO_CREATE_USER_SECTION
  payload: {
    sectionId: string
    nextGroupId: string
    userFormFieldNameHash?: string
    formHistoryState?: IDynamicValues
  }
}

export const GO_TO_USER_REVIEW_FORM = 'navigation/GO_TO_USER_REVIEW_FORM'
type GoToUserReviewForm = {
  type: typeof GO_TO_USER_REVIEW_FORM
  payload: {
    userId: string
    sectionId: string
    nextGroupId: string
    userFormFieldNameHash?: string
    formHistoryState?: IDynamicValues
  }
}

export function goToCreateUserSection(
  sectionId: string,
  nextGroupId: string,
  fieldNameHash?: string,
  historyState?: IDynamicValues
): GoToCreateUserSection {
  return {
    type: GO_TO_CREATE_USER_SECTION,
    payload: {
      sectionId,
      nextGroupId,
      userFormFieldNameHash: fieldNameHash,
      formHistoryState: historyState
    }
  }
}

export function goToUserReviewForm(
  userId: string,
  sectionId: string,
  nextGroupId: string,
  fieldNameHash?: string,
  historyState?: IDynamicValues
): GoToUserReviewForm {
  return {
    type: GO_TO_USER_REVIEW_FORM,
    payload: {
      userId,
      sectionId,
      nextGroupId,
      userFormFieldNameHash: fieldNameHash,
      formHistoryState: historyState
    }
  }
}

export function goToPageGroup(
  pageRoute: string,
  declarationId: string,
  pageId: string,
  groupId: string,
  event: string,
  fieldNameHash?: string,
  historyState?: IDynamicValues
) {
  return {
    type: GO_TO_PAGE,
    payload: {
      declarationId,
      pageId,
      groupId,
      event,
      fieldNameHash,
      pageRoute,
      historyState
    }
  }
}

export function goToPage(
  pageRoute: string,
  declarationId: string,
  pageId: string,
  event: string,
  fieldNameHash?: string,
  historyState?: IDynamicValues
) {
  return {
    type: GO_TO_PAGE,
    payload: {
      declarationId,
      pageId,
      event,
      fieldNameHash,
      pageRoute,
      historyState
    }
  }
}

export function goToPerformanceView(userDetails: IUserDetails) {
  if (userDetails && userDetails.role) {
    if (NATL_ADMIN_ROLES.includes(userDetails.role)) {
      return goToPerformanceHome()
    } else {
      const locationId = getJurisdictionLocationIdFromUserDetails(userDetails)
      return (
        (locationId && goToPerformanceHome(undefined, undefined, locationId)) ||
        goToPerformanceHome()
      )
    }
  }
}

export function goToTeamView(userDetails: IUserDetails) {
  if (userDetails && userDetails.role) {
    if (NATL_ADMIN_ROLES.includes(userDetails.role)) {
      return goToTeamSearch()
    } else {
      return goToTeamUserList({
        id: (userDetails.primaryOffice && userDetails.primaryOffice.id) || '',
        searchableText:
          (userDetails.primaryOffice && userDetails.primaryOffice.name) || '',
        displayLabel:
          (userDetails.primaryOffice && userDetails.primaryOffice.name) || ''
      })
    }
  }
}

export type INavigationState = undefined

export function navigationReducer(state: INavigationState, action: any) {
  switch (action.type) {
    case GO_TO_PAGE:
      const {
        fieldNameHash,
        declarationId,
        pageId,
        groupId,
        event,
        pageRoute,
        historyState
      } = action.payload
      return loop(
        state,
        Cmd.action(
          push(
            formatUrl(pageRoute, {
              declarationId: declarationId.toString(),
              pageId,
              groupId,
              event
            }) + (fieldNameHash ? `#${fieldNameHash}` : ''),
            historyState
          )
        )
      )
    case GO_TO_REGISTRAR_HOME:
      const {
        tabId: RegistrarHomeTabId,
        selectorId: RegistrarHomeSelectorId = ''
      } = action.payload
      return loop(
        state,
        Cmd.action(
          push(
            formatUrl(REGISTRAR_HOME_TAB, {
              tabId: RegistrarHomeTabId,
              selectorId: RegistrarHomeSelectorId
            })
          )
        )
      )
    case GO_TO_SYS_ADMIN_HOME:
      const { tabId: SysAdminHomeTabId } = action.payload
      return loop(
        state,
        Cmd.action(
          push(formatUrl(SYS_ADMIN_HOME_TAB, { tabId: SysAdminHomeTabId }))
        )
      )
    case GO_TO_CREATE_USER_SECTION:
      const {
        sectionId,
        nextGroupId,
        userFormFieldNameHash,
        formHistoryState
      } = action.payload
      return loop(
        state,
        Cmd.action(
          push(
            formatUrl(CREATE_USER_SECTION, {
              sectionId,
              groupId: nextGroupId
            }) + (userFormFieldNameHash ? `#${userFormFieldNameHash}` : ''),
            formHistoryState
          )
        )
      )
    case GO_TO_USER_REVIEW_FORM:
      return loop(
        state,
        Cmd.action(
          push(
            formatUrl(REVIEW_USER_FORM, {
              userId: action.payload.userId,
              sectionId: action.payload.sectionId,
              groupId: action.payload.nextGroupId
            }) +
              (action.payload.userFormFieldNameHash
                ? `#${action.payload.userFormFieldNameHash}`
                : ''),
            action.payload.formHistoryState
          )
        )
      )
    case GO_TO_REVIEW_USER_DETAILS:
      return loop(
        state,
        Cmd.action(
          push(
            formatUrl(REVIEW_USER_DETAILS, {
              userId: action.payload.userId,
              sectionId: UserSection.Preview
            })
          )
        )
      )
    case GO_TO_USER_PROFILE:
      return loop(
        state,
        Cmd.action(
          push(
            formatUrl(USER_PROFILE, {
              userId: action.payload.userId
            })
          )
        )
      )
  }
}
