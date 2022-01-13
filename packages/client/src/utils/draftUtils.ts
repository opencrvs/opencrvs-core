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
import { IApplication, ITaskHistory } from '@client/applications'
import {
  BirthSection,
  DeathSection,
  Event,
  IFormSectionData
} from '@client/forms'
import {
  GQLBirthEventSearchSet,
  GQLDeathEventSearchSet,
  GQLEventSearchSet
} from '@opencrvs/gateway/src/graphql/schema'
import { IUserDetails } from './userUtils'
import { getEvent } from '@client/views/PrintCertificate/utils'
import { BIRTH, DEATH } from './constants'

const getApplicantFullName = (
  sectionData: IFormSectionData,
  language = 'en'
): string => {
  let fullName = ''
  if (!sectionData) {
    return fullName
  }
  if (language === 'en') {
    if (sectionData.firstNamesEng) {
      fullName = `${sectionData.firstNamesEng as string} ${
        sectionData.familyNameEng as string
      }`
    } else {
      fullName = sectionData.familyNameEng as string
    }
  } else {
    if (sectionData.firstNames) {
      fullName = `${sectionData.firstNames as string} ${
        sectionData.familyName as string
      }`
    } else {
      fullName = sectionData.familyName as string
    }
  }
  return fullName
}

export const getDraftApplicantFullName = (
  draft: IApplication,
  language?: string
) => {
  switch (draft.event) {
    case Event.BIRTH:
      return getApplicantFullName(draft.data.child, language)
    case Event.DEATH:
      return getApplicantFullName(draft.data.deceased, language)
  }
}

const transformBirthSearchQueryDataToDraft = (
  data: GQLBirthEventSearchSet,
  application: IApplication
) => {
  application.data.child = {
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
      ''
  }
}

const transformDeathSearchQueryDataToDraft = (
  data: GQLDeathEventSearchSet,
  application: IApplication
) => {
  application.data.deceased = {
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
      ''
  }
}

export const transformSearchQueryDataToDraft = (
  data: GQLEventSearchSet
): IApplication => {
  const eventType = getEvent(data.type)

  const application: IApplication = {
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
  application.data.registration.contactPoint.nestedFields.registrationPhone =
    data.registration && data.registration.contactNumber
  application.trackingId = data.registration && data.registration.trackingId
  application.submissionStatus = data.registration && data.registration.status
  application.compositionId = data.id

  application.operationHistories = data.operationHistories as ITaskHistory[]

  switch (eventType) {
    case Event.BIRTH:
    default:
      transformBirthSearchQueryDataToDraft(data, application)
      break
    case Event.DEATH:
      transformDeathSearchQueryDataToDraft(data, application)
      break
  }

  return application
}

export const updateApplicationTaskHistory = (
  application: IApplication,
  userDetails: IUserDetails | null
): ITaskHistory => {
  return {
    operationType: application.submissionStatus,
    operatedOn:
      (application.modifiedOn && new Date(application.modifiedOn).toString()) ||
      '',
    operatorRole: (userDetails && userDetails.role) || '',
    operatorName: (userDetails && userDetails.name) || [],
    operatorOfficeName:
      (userDetails &&
        userDetails.primaryOffice &&
        userDetails.primaryOffice.name) ||
      '',
    operatorOfficeAlias:
      (userDetails &&
        userDetails.primaryOffice &&
        userDetails.primaryOffice.alias) ||
      []
  }
}

export const getAttachmentSectionKey = (applicationEvent: Event): string => {
  switch (applicationEvent) {
    case DEATH:
      return DeathSection.DeathDocuments
    case BIRTH:
    default:
      return BirthSection.Documents
  }
}
