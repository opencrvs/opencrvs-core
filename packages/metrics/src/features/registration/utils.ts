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
  EVENT_TYPE,
  getRegistrationLateTargetDays,
  getRegistrationTargetDays
} from '@metrics/features/metrics/utils'
import {
  differenceInDays,
  differenceInSeconds,
  differenceInYears
} from 'date-fns'

type YYYY_MM_DD = string
type ISO_DATE = string

export function getAgeInDays(dateOfBirth: YYYY_MM_DD, fromDate: Date) {
  return getDurationInDays(dateOfBirth, fromDate.toISOString())
}

export function getdaysAfterEvent(marriageDate: YYYY_MM_DD, fromDate: Date) {
  return getDurationInDays(marriageDate, fromDate.toISOString())
}

export function getAgeInYears(dateOfBirth: YYYY_MM_DD, fromDate: Date) {
  return getDurationInYears(dateOfBirth, fromDate.toISOString())
}

export function getDurationInDays(from: ISO_DATE, to: ISO_DATE) {
  const toDate = new Date(to)
  const fromDate = new Date(from)
  return differenceInDays(toDate, fromDate)
}

export function getDurationInSeconds(from: ISO_DATE, to: ISO_DATE) {
  const toDate = new Date(to)
  const fromDate = new Date(from)
  return differenceInSeconds(toDate, fromDate)
}

export function getDurationInYears(from: ISO_DATE, to: ISO_DATE) {
  const toDate = new Date(to)
  const fromDate = new Date(from)
  return differenceInYears(toDate, fromDate)
}

/* Populates a bundle with necessary parts for processing metrics
 * if the payload is a task it is converted to a bundle, if it's
 * already a bundle then we check if it has the parts we need
 * missing parts are queried from the FHIR store.
 *
 * The parts queried and added include:
 *  * The composition
 *  * The sections resources referenced in the composition
 *
 * The encounter and observations are not populated at this time.
 */

export async function getTimeLabel(
  timeInDays: number,
  event: EVENT_TYPE,
  authorization: string
): Promise<string> {
  const regTargetDays = await getRegistrationTargetDays(event, authorization)
  const regLateTargetDays = await getRegistrationLateTargetDays(
    event,
    authorization
  )
  if (timeInDays <= regTargetDays) {
    return 'withinTarget'
  } else if (regLateTargetDays && timeInDays <= regLateTargetDays) {
    return 'withinLate'
  } else if (timeInDays <= 365) {
    return 'within1Year'
  } else if (timeInDays <= 1825) {
    return 'within5Years'
  } else {
    return 'after5Years'
  }
}

export function getAgeLabel(ageInDays: number) {
  if (ageInDays < 6574) {
    return 'under18'
  } else {
    return 'over18'
  }
}
