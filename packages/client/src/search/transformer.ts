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
import { ITaskHistory } from '@client/declarations'
import { EMPTY_STRING } from '@client/utils/constants'
import { getLocalisedName } from '@client/utils/data-formatting'
import { formatLongDate } from '@client/utils/date-formatting'
import {
  EventSearchSet,
  EventType,
  HumanName,
  SearchEventsQuery
} from '@client/utils/gateway'
import type {
  GQLBirthEventSearchSet,
  GQLDeathEventSearchSet,
  GQLMarriageEventSearchSet,
  GQLRegStatus
} from '@client/utils/gateway-deprecated-do-not-use'
import { IntlShape } from 'react-intl'

export const isBirthEvent = (
  req: EventSearchSet
): req is GQLBirthEventSearchSet => {
  return req.type === EventType.Birth
}

export const isDeathEvent = (
  req: EventSearchSet
): req is GQLDeathEventSearchSet => {
  return req.type === EventType.Death
}

export const isMarriageEvent = (
  reg: EventSearchSet
): reg is GQLMarriageEventSearchSet => {
  return reg.type === EventType.Marriage
}

export const transformData = (
  data: SearchEventsQuery['searchEvents'],
  intl: IntlShape
) => {
  const { locale } = intl
  if (!data || !data.results) {
    return []
  }

  return data.results
    .filter((req): req is EventSearchSet => req !== null)
    .map((reg: EventSearchSet) => {
      let birthReg
      let deathReg
      let marriageReg
      let name
      let groomName
      let brideName
      let dateOfEvent
      const assignedReg = reg

      if (reg.registration) {
        if (isBirthEvent(reg)) {
          birthReg = reg
          name = birthReg.childName
            ? getLocalisedName(intl, birthReg.childName[0] as HumanName)
            : EMPTY_STRING
          dateOfEvent = birthReg.dateOfBirth
        } else if (isDeathEvent(reg)) {
          deathReg = reg
          name = deathReg.deceasedName
            ? getLocalisedName(intl, deathReg.deceasedName[0] as HumanName)
            : EMPTY_STRING
          dateOfEvent = deathReg && deathReg.dateOfDeath
        } else if (isMarriageEvent(reg)) {
          groomName = reg.groomName
            ? getLocalisedName(intl, reg.groomName[0] as HumanName)
            : EMPTY_STRING
          brideName = reg.brideName
            ? getLocalisedName(intl, reg.brideName[0] as HumanName)
            : EMPTY_STRING

          name =
            brideName && groomName
              ? `${groomName} & ${brideName}`
              : brideName || groomName || EMPTY_STRING

          dateOfEvent = marriageReg && reg.dateOfMarriage
        }
      }
      const status =
        assignedReg.registration &&
        (assignedReg.registration.status as GQLRegStatus)

      return {
        id: assignedReg.id,
        name,
        dob:
          (birthReg?.dateOfBirth?.length &&
            formatLongDate(birthReg.dateOfBirth, locale)) ||
          '',
        dod:
          (deathReg?.dateOfDeath?.length &&
            formatLongDate(deathReg.dateOfDeath, locale)) ||
          '',
        dateOfEvent,
        registrationNumber:
          (assignedReg.registration &&
            assignedReg.registration.registrationNumber) ||
          '',
        trackingId:
          (assignedReg.registration && assignedReg.registration.trackingId) ||
          '',
        event: assignedReg.type || '',
        declarationStatus: status || '',
        contactNumber:
          (assignedReg.registration &&
            assignedReg.registration.contactNumber) ||
          '',
        contactEmail:
          (assignedReg.registration && assignedReg.registration.contactEmail) ||
          '',
        duplicates:
          (assignedReg.registration && assignedReg.registration.duplicates) ||
          [],
        rejectionReasons:
          (status === 'REJECTED' &&
            assignedReg.registration &&
            assignedReg.registration.reason) ||
          '',
        rejectionComment:
          (status === 'REJECTED' &&
            assignedReg.registration &&
            assignedReg.registration.comment) ||
          '',
        createdAt: assignedReg?.registration?.createdAt,
        assignment: assignedReg?.registration?.assignment,
        modifiedAt:
          assignedReg.registration &&
          (assignedReg.registration.modifiedAt ||
            assignedReg.registration.createdAt),
        operationHistories: assignedReg.operationHistories as ITaskHistory[]
      }
    })
}
