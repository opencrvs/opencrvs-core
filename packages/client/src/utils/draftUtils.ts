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
import type {
  GQLBirthEventSearchSet,
  GQLDeathEventSearchSet,
  GQLEventSearchSet,
  GQLMarriageEventSearchSet
} from '@client/utils/gateway-deprecated-do-not-use'
import { getEvent } from '@client/views/PrintCertificate/utils'
import { includes } from 'lodash'
import { EMPTY_STRING } from '@client/utils/constants'

const getEngName = (
  sectionData: IFormSectionData,
  lastNameFirst: boolean
): string => {
  if (lastNameFirst) {
    return `${sectionData.familyNameEng ?? ''} ${
      sectionData.firstNamesEng ?? ''
    }`
  }
  return [
    sectionData.firstNamesEng,
    sectionData.middleNameEng,
    sectionData.familyNameEng
  ]
    .filter(Boolean)
    .join(' ')
    .trim()
}

const getOtherName = (sectionData: IFormSectionData): string => {
  return [
    sectionData.firstNames,
    sectionData.middleName,
    sectionData.familyName
  ]
    .filter(Boolean)
    .join(' ')
    .trim()
}

const getFullName = (
  sectionData: IFormSectionData,
  language = 'en',
  lastNameFirst = false
): string => {
  if (!sectionData) {
    return EMPTY_STRING
  }
  if (language === 'en') {
    return getEngName(sectionData, lastNameFirst)
  }
  return getOtherName(sectionData) || getEngName(sectionData, lastNameFirst)
}

/*
 * lastNameFirst needs to be removed in #4464
 */
export const getDeclarationFullName = (
  draft: IDeclaration,
  language?: string,
  lastNameFirst?: boolean
) => {
  switch (draft.event) {
    case Event.Birth:
      return getFullName(draft.data.child, language, lastNameFirst)
    case Event.Death:
      return getFullName(draft.data.deceased, language, lastNameFirst)
    case Event.Marriage:
      const brideName = getFullName(draft.data.bride, language, lastNameFirst)
      const groomName = getFullName(draft.data.groom, language, lastNameFirst)
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
    middleNameEng:
      data.childName?.find((name) => name?.use === 'en')?.middleName ?? '',
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
    middleName:
      data.childName?.find((name) => name?.use !== 'en')?.middleName ?? '',
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
    middleNameEng:
      data.deceasedName?.find((name) => name?.use === 'en')?.middleName ?? '',
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
    middleName:
      data.deceasedName?.find((name) => name?.use !== 'en')?.middleName ?? '',
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
    brideMiddleNameEng:
      data.brideName?.find((name) => name?.use === 'en')?.middleName ?? '',
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
    brideMiddleName:
      data.brideName?.find((name) => name?.use !== 'en')?.middleName ?? '',
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
    groomMiddleNameEng:
      data.groomName?.find((name) => name?.use === 'en')?.middleName ?? '',
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
    groomMiddleName:
      data.groomName?.find((name) => name?.use !== 'en')?.middleName ?? '',
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
