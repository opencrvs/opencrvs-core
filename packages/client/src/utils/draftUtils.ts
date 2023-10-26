/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import {
  IDeclaration,
  SUBMISSION_STATUS,
  IPrintableDeclaration
} from '@client/declarations'
import { IFormSectionData } from '@client/forms'
import { Event, History, RegStatus } from '@client/utils/gateway'
import {
  GQLBirthEventSearchSet,
  GQLDeathEventSearchSet,
  GQLEventSearchSet,
  GQLMarriageEventSearchSet
} from '@opencrvs/gateway/src/graphql/schema'
import { getEvent } from '@client/views/PrintCertificate/utils'
import { includes } from 'lodash'
import { EMPTY_STRING } from '@client/utils/constants'

const getInformantEngName = (
  sectionData: IFormSectionData,
  lastNameFirst: boolean
): string => {
  if (lastNameFirst) {
    return `${sectionData.familyNameEng ?? ''} ${
      sectionData.firstNamesEng ?? ''
    }`
  }
  return `${sectionData.firstNamesEng ?? ''} ${sectionData.familyNameEng ?? ''}`
}

const getInformantOthreName = (sectionData: IFormSectionData): string => {
  if (sectionData.firstNames) {
    return `${sectionData.firstNames as string} ${
      sectionData.familyName as string
    }`
  } else {
    return sectionData.familyName as string
  }
}

const getInformantFullName = (
  sectionData: IFormSectionData,
  language = 'en',
  lastNameFirst = false
): string => {
  let fullName: string
  if (!sectionData) {
    return EMPTY_STRING
  }
  if (language === 'en') {
    fullName = getInformantEngName(sectionData, lastNameFirst).trim()
  } else {
    if (sectionData.firstNames && sectionData.familyName) {
      fullName = `${sectionData.firstNames as string} ${
        sectionData.familyName as string
      }`
    } else {
      fullName =
        getInformantOthreName(sectionData) ||
        getInformantEngName(sectionData, lastNameFirst).trim()
    }
  }
  return fullName
}

/*
 * lastNameFirst needs to be removed in #4464
 */
export const getDraftInformantFullName = (
  draft: IDeclaration,
  language?: string,
  lastNameFirst?: boolean
) => {
  switch (draft.event) {
    case Event.Birth:
      return getInformantFullName(draft.data.child, language, lastNameFirst)
    case Event.Death:
      return getInformantFullName(draft.data.deceased, language, lastNameFirst)
    case Event.Marriage:
      const brideName = getInformantFullName(
        draft.data.bride,
        language,
        lastNameFirst
      )
      const groomName = getInformantFullName(
        draft.data.groom,
        language,
        lastNameFirst
      )
      if (brideName && groomName) {
        return `${groomName} & ${brideName}`
      } else {
        return brideName || groomName || EMPTY_STRING
      }
  }
}

const transformBirthSearchQueryDataToDraft = (
  data: GQLBirthEventSearchSet,
  declaration: IDeclaration
) => {
  declaration.data.child = {
    firstNamesEng:
      (data.childName &&
        data.childName
          .filter((name) => name && name.use === 'en')
          .map((name) => name && name.firstNames)[0]) ||
      '',
    familyNameEng:
      (data.childName &&
        data.childName
          .filter((name) => name && name.use === 'en')
          .map((name) => name && name.familyName)[0]) ||
      '',
    firstNames:
      (data.childName &&
        data.childName
          .filter((name) => name && name.use !== 'en')
          .map((name) => name && name.firstNames)[0]) ||
      '',
    familyName:
      (data.childName &&
        data.childName
          .filter((name) => name && name.use !== 'en')
          .map((name) => name && name.familyName)[0]) ||
      '',
    childBirthDate: data.dateOfBirth && data.dateOfBirth
  }
}

const transformDeathSearchQueryDataToDraft = (
  data: GQLDeathEventSearchSet,
  declaration: IDeclaration
) => {
  declaration.data.deceased = {
    firstNamesEng:
      (data.deceasedName &&
        data.deceasedName
          .filter((name) => name && name.use === 'en')
          .map((name) => name && name.firstNames)[0]) ||
      '',
    familyNameEng:
      (data.deceasedName &&
        data.deceasedName
          .filter((name) => name && name.use === 'en')
          .map((name) => name && name.familyName)[0]) ||
      '',
    firstNames:
      (data.deceasedName &&
        data.deceasedName
          .filter((name) => name && name.use !== 'en')
          .map((name) => name && name.firstNames)[0]) ||
      '',
    familyName:
      (data.deceasedName &&
        data.deceasedName
          .filter((name) => name && name.use !== 'en')
          .map((name) => name && name.familyName)[0]) ||
      '',
    deathDate: data.dateOfDeath && data.dateOfDeath
  }
}

const transformMarriageSearchQueryDataToDraft = (
  data: GQLMarriageEventSearchSet,
  declaration: IDeclaration
) => {
  declaration.data.bride = {
    brideFirstNamesEng:
      (data.brideName &&
        data.brideName
          .filter((name) => name && name.use === 'en')
          .map((name) => name && name.firstNames)[0]) ||
      '',
    brideFamilyNameEng:
      (data.brideName &&
        data.brideName
          .filter((name) => name && name.use === 'en')
          .map((name) => name && name.familyName)[0]) ||
      '',
    brideFirstNames:
      (data.brideName &&
        data.brideName
          .filter((name) => name && name.use !== 'en')
          .map((name) => name && name.firstNames)[0]) ||
      '',
    brideFamilyName:
      (data.brideName &&
        data.brideName
          .filter((name) => name && name.use !== 'en')
          .map((name) => name && name.familyName)[0]) ||
      '',
    marriageDate: data.dateOfMarriage && data.dateOfMarriage
  }

  declaration.data.groom = {
    groomFirstNamesEng:
      (data.groomName &&
        data.groomName
          .filter((name) => name && name.use === 'en')
          .map((name) => name && name.firstNames)[0]) ||
      '',
    groomFamilyNameEng:
      (data.groomName &&
        data.groomName
          .filter((name) => name && name.use === 'en')
          .map((name) => name && name.familyName)[0]) ||
      '',
    groomFirstNames:
      (data.groomName &&
        data.groomName
          .filter((name) => name && name.use !== 'en')
          .map((name) => name && name.firstNames)[0]) ||
      '',
    groomFamilyName:
      (data.groomName &&
        data.groomName
          .filter((name) => name && name.use !== 'en')
          .map((name) => name && name.familyName)[0]) ||
      '',
    marriageDate: data.dateOfMarriage && data.dateOfMarriage
  }
}

export const transformSearchQueryDataToDraft = (
  data: GQLEventSearchSet
): IDeclaration => {
  const eventType = getEvent(data.type)

  const declaration: IDeclaration = {
    id: data.id,
    data: {
      registration: {
        contactPoint: {
          nestedFields: {}
        }
      }
    },
    event: eventType
  }

  // @ts-ignore
  declaration.data.registration.contactPoint.nestedFields.registrationPhone =
    data.registration && data.registration.contactNumber
  declaration.trackingId = data.registration && data.registration.trackingId
  declaration.submissionStatus = data.registration && data.registration.status
  declaration.createdAt =
    data.registration?.createdAt && data.registration.createdAt

  switch (eventType) {
    case Event.Birth:
    default:
      transformBirthSearchQueryDataToDraft(data, declaration)
      break
    case Event.Death:
      transformDeathSearchQueryDataToDraft(data, declaration)
      break
    case Event.Marriage:
      transformMarriageSearchQueryDataToDraft(data, declaration)
      break
  }

  return declaration
}

export function isDeclarationInReadyToReviewStatus(
  submissionStatus: string | undefined
) {
  return !includes(
    [SUBMISSION_STATUS.DRAFT, SUBMISSION_STATUS.REJECTED, undefined],
    submissionStatus
  )
}

export function getRegisteringOfficeId(
  declaration?: IPrintableDeclaration
): string | null {
  const registeringHistory = (
    declaration?.data?.history as unknown as History[]
  )?.find((h) => !h.action && h.regStatus === RegStatus.Registered)

  return registeringHistory?.office?.id || null
}
