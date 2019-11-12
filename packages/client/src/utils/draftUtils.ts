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
import { Event, IFormSectionData } from '@client/forms'
import { IApplication } from '@client/applications'

const getApplicantFullName = (
  sectionData: IFormSectionData,
  language: string = 'en'
): string => {
  let fullName = ''
  if (!sectionData) {
    return fullName
  }
  if (language === 'en') {
    if (sectionData.firstNamesEng) {
      fullName = `${sectionData.firstNamesEng as string} ${sectionData.familyNameEng as string}`
    } else {
      fullName = sectionData.familyNameEng as string
    }
  } else {
    if (sectionData.firstNames) {
      fullName = `${sectionData.firstNames as string} ${sectionData.familyName as string}`
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
