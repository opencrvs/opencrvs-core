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
  IDeclaration,
  SUBMISSION_STATUS,
  IPrintableDeclaration
} from '@client/declarations'
import { BirthSection, DeathSection, IFormSectionData } from '@client/forms'
import { Event, History } from '@client/utils/gateway'
import {
  GQLBirthEventSearchSet,
  GQLDeathEventSearchSet,
  GQLEventSearchSet
} from '@opencrvs/gateway/src/graphql/schema'
import { getEvent } from '@client/views/PrintCertificate/utils'
import { includes } from 'lodash'
import { EMPTY_STRING } from '@client/utils/constants'

const getInformantEngName = (sectionData: IFormSectionData): string => {
  if (sectionData.firstNamesEng) {
    return `${sectionData.firstNamesEng as string} ${
      sectionData.familyNameEng as string
    }`
  } else {
    return sectionData.familyNameEng as string
  }
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
  language = 'en'
): string => {
  let fullName: string
  if (!sectionData) {
    return EMPTY_STRING
  }
  if (language === 'en') {
    fullName = getInformantEngName(sectionData)
  } else {
    if (sectionData.firstNames && sectionData.familyName) {
      fullName = `${sectionData.firstNames as string} ${
        sectionData.familyName as string
      }`
    } else {
      fullName =
        getInformantOthreName(sectionData) || getInformantEngName(sectionData)
    }
  }
  return fullName
}

export const getDraftInformantFullName = (
  draft: IDeclaration,
  language?: string
) => {
  switch (draft.event) {
    case Event.Birth:
      return getInformantFullName(draft.data.child, language)
    case Event.Death:
      return getInformantFullName(draft.data.deceased, language)
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
  }

  return declaration
}

export const getAttachmentSectionKey = (declarationEvent: Event): string => {
  switch (declarationEvent) {
    case Event.Death:
      return DeathSection.DeathDocuments
    case Event.Birth:
    default:
      return BirthSection.Documents
  }
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
  )?.find((h) => h.action === 'REGISTERED')

  return registeringHistory?.office?.id || null
}
