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
  IPrintableDeclaration,
  SUBMISSION_STATUS
} from '@client/declarations'
import { EventType, History, RegStatus } from '@client/utils/gateway'
import type {
  GQLBirthEventSearchSet,
  GQLDeathEventSearchSet,
  GQLEventSearchSet,
  GQLMarriageEventSearchSet
} from '@client/utils/gateway-deprecated-do-not-use'
import { getEvent } from '@client/views/PrintCertificate/utils'
import { includes } from 'lodash'
import { EMPTY_STRING } from '@client/utils/constants'
import { getLocalisedName } from './data-formatting'
import { IntlShape } from 'react-intl'

export const getDeclarationFullName = (
  draft: IDeclaration,
  intl: IntlShape
) => {
  switch (draft.event) {
    case EventType.Birth:
      return draft.data.child
        ? getLocalisedName(intl, {
            firstNames: draft.data.child.firstNamesEng as string,
            middleName: draft.data.child.middleNameEng as string,
            familyName: draft.data.child.middleNameEng as string
          })
        : EMPTY_STRING
    case EventType.Death:
      return draft.data.deceased
        ? getLocalisedName(intl, {
            firstNames: draft.data.deceased.firstNamesEng as string,
            middleName: draft.data.deceased.middleNameEng as string,
            familyName: draft.data.deceased.familyNameEng as string
          })
        : EMPTY_STRING
    case EventType.Marriage:
      const brideName = draft.data.bride
        ? getLocalisedName(intl, {
            firstNames: draft.data.bride.firstNamesEng as string,
            middleName: draft.data.bride.middleNameEng as string,
            familyName: draft.data.bride.familyNameEng as string
          })
        : EMPTY_STRING
      const groomName = draft.data.groom
        ? getLocalisedName(intl, {
            firstNames: draft.data.groom.firstNamesEng as string,
            middleName: draft.data.groom.middleNameEng as string,
            familyName: draft.data.groom.familyNameEng as string
          })
        : EMPTY_STRING
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
    case EventType.Birth:
    default:
      transformBirthSearchQueryDataToDraft(data, declaration)
      break
    case EventType.Death:
      transformDeathSearchQueryDataToDraft(data, declaration)
      break
    case EventType.Marriage:
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
