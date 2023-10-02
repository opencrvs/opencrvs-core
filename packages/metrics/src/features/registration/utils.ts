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
  getTask,
  getComposition
} from '@metrics/features/registration/fhirUtils'
import { fetchFHIR } from '@metrics/api'
import {
  differenceInDays,
  differenceInSeconds,
  differenceInYears
} from 'date-fns'
import {
  EVENT_TYPE,
  getRegistrationTargetDays,
  getRegistrationLateTargetDays
} from '@metrics/features/metrics/utils'

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
export async function populateBundleFromPayload(
  payload: fhir.Bundle | fhir.Task,
  authHeader: string
) {
  let bundle: fhir.Bundle | null = null
  if (payload.resourceType === 'Bundle') {
    bundle = payload as fhir.Bundle

    const composition = getComposition(bundle)
    const hasBundleBeenPopulated = composition !== undefined
    if (hasBundleBeenPopulated) {
      // Assume that if the bundle already has a fhir.Composition, it has already been populated
      return bundle
    }
  }

  if (payload.resourceType === 'Task') {
    bundle = {
      resourceType: 'Bundle',
      type: 'document',
      entry: [{ resource: payload }]
    }
  }

  if (!bundle || !bundle.entry) {
    throw new Error('Bundle not properly formed')
  }

  const task = getTask(bundle)

  if (!task) {
    throw new Error('No task resource available')
  }

  let composition = getComposition(bundle)
  if (!composition) {
    if (!task.focus || !task.focus.reference) {
      throw new Error(
        "Could not fetch composition as the task didn't have a focus reference"
      )
    }
    composition = await fetchFHIR(task.focus.reference, {
      Authorization: authHeader
    })

    if (!composition) {
      throw new Error(
        `Composition ${task.focus.reference} not found on FHIR store`
      )
    }

    bundle.entry.unshift({
      fullUrl: task.focus.reference,
      resource: composition
    }) // we expect the composition to be in position 0
  }

  for (const section of composition.section || []) {
    if (section.entry && section.entry[0] && section.entry[0].reference) {
      const referencedResource = await fetchFHIR(section.entry[0].reference, {
        Authorization: authHeader
      })

      bundle.entry.push({
        fullUrl: section.entry[0].reference,
        resource: referencedResource
      })
    }
  }

  return bundle
}

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
