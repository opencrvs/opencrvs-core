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
import * as Hapi from '@hapi/hapi'
import {
  TIME_FROM,
  TIME_TO,
  LOCATION_ID
} from '@metrics/features/metrics/constants'
import {
  fetchLocationWiseDeclarationsStarted,
  getNumberOfAppStartedByPractitioners,
  getNumberOfRejectedAppStartedByPractitioners,
  getAvgTimeSpentOnAppByPractitioners
} from '@metrics/features/declarationsStarted/service'
import { EVENT_TYPE } from '@metrics/features/metrics/utils'

export async function declarationsStartedHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const timeStart = request.query[TIME_FROM]
  const timeEnd = request.query[TIME_TO]
  const locationId = 'Location/' + request.query[LOCATION_ID]
  let declarationsStartedMetrics
  try {
    declarationsStartedMetrics = await fetchLocationWiseDeclarationsStarted(
      timeStart,
      timeEnd,
      locationId
    )
  } catch (error) {
    declarationsStartedMetrics = {
      fieldAgentDeclarations: 0,
      hospitalDeclarations: 0,
      officeDeclarations: 0
    }
  }

  return declarationsStartedMetrics
}

interface IDeclarationStartedMetricsPayload {
  timeStart: string
  timeEnd: string
  locationId: string
  practitionerIds: string[]
  event?: EVENT_TYPE
}
interface IDeclarationStartedMetricsByPractitioner {
  practitionerId: string
  locationId: string
  totalNumberOfDeclarationStarted: number
  averageTimeForDeclaredDeclarations: number
  totalNumberOfInProgressAppStarted: number
  totalNumberOfRejectedDeclarations: number
}

export async function declarationStartedMetricsByPractitionersHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const { timeStart, timeEnd, locationId, practitionerIds, event } =
    request.payload as IDeclarationStartedMetricsPayload
  const locId = `Location/${locationId}`
  let declarationStartedMetricsByPractitioners: IDeclarationStartedMetricsByPractitioner[] =
    []
  try {
    const totalStarted = await getNumberOfAppStartedByPractitioners(
      timeStart,
      timeEnd,
      locId,
      event
    )
    const totalInProgressStarted = await getNumberOfAppStartedByPractitioners(
      timeStart,
      timeEnd,
      locId,
      event,
      'IN_PROGRESS'
    )
    const totalRejectedStarted =
      await getNumberOfRejectedAppStartedByPractitioners(
        timeStart,
        timeEnd,
        locId,
        event
      )
    const avgTimesForCompleteDeclarations =
      await getAvgTimeSpentOnAppByPractitioners(
        timeStart,
        timeEnd,
        locId,
        'DECLARED',
        event
      )

    declarationStartedMetricsByPractitioners = practitionerIds.map(
      (practitionerId) => {
        const avgTimeSpentRecord = avgTimesForCompleteDeclarations?.find(
          (declarationStartedCount) =>
            declarationStartedCount.practitionerId === practitionerId
        )
        let averageTimeForDeclaredDeclarations = 0
        if (
          avgTimeSpentRecord &&
          avgTimeSpentRecord.totalTimeSpent &&
          avgTimeSpentRecord.totalTimeSpent > 0 &&
          avgTimeSpentRecord.totalDeclarations &&
          avgTimeSpentRecord.totalDeclarations > 0
        ) {
          averageTimeForDeclaredDeclarations = Math.round(
            avgTimeSpentRecord.totalTimeSpent /
              avgTimeSpentRecord.totalDeclarations
          )
        }
        return {
          practitionerId,
          locationId,
          totalNumberOfDeclarationStarted:
            totalStarted?.find(
              (declarationStartedCount) =>
                declarationStartedCount.practitionerId === practitionerId
            )?.totalStarted || 0,
          totalNumberOfInProgressAppStarted:
            totalInProgressStarted?.find(
              (declarationStartedCount) =>
                declarationStartedCount.practitionerId === practitionerId
            )?.totalStarted || 0,
          totalNumberOfRejectedDeclarations:
            totalRejectedStarted?.find(
              (declarationStartedCount) =>
                declarationStartedCount.startedBy === practitionerId
            )?.totalStarted || 0,
          averageTimeForDeclaredDeclarations
        }
      }
    )
  } catch (error) {
    declarationStartedMetricsByPractitioners = practitionerIds.map(
      (practitionerId) => ({
        practitionerId,
        locationId,
        totalNumberOfDeclarationStarted: 0,
        averageTimeForDeclaredDeclarations: 0,
        totalNumberOfInProgressAppStarted: 0,
        totalNumberOfRejectedDeclarations: 0
      })
    )
  }
  return declarationStartedMetricsByPractitioners
}
