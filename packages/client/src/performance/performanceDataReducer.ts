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
  Action,
  fetchSuccess,
  read,
  fetch,
  isAvailable
} from '@client/performance/performanceDataActions'
import { Action as ProfileAction } from '@client/profile/profileActions'
import { client } from '@client/utils/apolloClient'
import { Cmd, loop, Loop } from 'redux-loop'
import { createKey } from './performanceDataSelectors'
import { storage } from '@client/storage'
import { DocumentNode } from 'graphql'
import { getDefaultPerformanceLocationId } from '@client/utils/locationUtils'
import { PERFORMANCE_STATS } from '@client/views/SysAdmin/Performance/metricsQuery'

const PERFORMANCE_DATA = 'performanceStats'

export type PerformanceDataState = {
  /**
   * key format:
   * `${operationName},${event},${locationId},${startDate},${endDate}`
   * startDate,endDate format yyyy-MM
   */
  [key: string]: {
    loading: boolean
    data: any
    error: any
  }
}

async function getStoredData(
  operationName: string,
  variables: Record<string, string>,
  query: DocumentNode
) {
  const stored = await storage.getItem(PERFORMANCE_DATA)
  return {
    data: stored ? JSON.parse(stored) : null,
    operationName,
    variables,
    query
  }
}

async function updateStoredData(
  data: any,
  operationName: string,
  variables: Record<string, string>
) {
  const stored = await storage.getItem(PERFORMANCE_DATA)
  const json = stored ? JSON.parse(stored) : {}
  const key = createKey({ operationName, variables })
  const newJson = { ...json, [key]: data }
  await storage.setItem(PERFORMANCE_DATA, JSON.stringify(newJson))
}

export const performanceDataReducer = (
  state: PerformanceDataState = {},
  action: Action | ProfileAction
):
  | PerformanceDataState
  | Loop<PerformanceDataState, Action | ProfileAction> => {
  switch (action.type) {
    case 'PROFILE/USER_DETAILS_AVAILABLE': {
      const locationId = getDefaultPerformanceLocationId(action.payload)
      let variables: Record<string, any> = {
        populationYear: new Date().getFullYear(),
        event: 'BIRTH',
        status: [
          'IN_PROGRESS',
          'DECLARED',
          'REJECTED',
          'VALIDATED',
          'WAITING_VALIDATION',
          'REGISTERED'
        ],
        officeSelected: false
      }
      if (locationId) {
        variables = {
          locationId,
          ...variables
        }
      }
      return loop(
        state,
        Cmd.action(
          isAvailable('getLocationStatistics', variables, PERFORMANCE_STATS)
        )
      )
    }
    case 'PERFORMANCE/QUERY_DATA_AVAILABLE': {
      const { operationName, variables, query } = action.payload
      return loop(
        state,
        Cmd.run(getStoredData, {
          successActionCreator: read,
          args: [operationName, variables, query]
        })
      )
    }
    case 'PERFORMANCE/READ_QUERY_DATA': {
      const { data, operationName, variables, query } = action.payload
      const key = createKey({ operationName, variables })
      return loop(
        {
          ...state,
          [key]: {
            loading: !data,
            data,
            error: null
          }
        },
        Cmd.action(fetch(operationName, variables, query))
      )
    }
    case 'PERFORMANCE/FETCH_QUERY_DATA': {
      const { operationName, variables, query } = action.payload
      const key = createKey({ operationName, variables })
      return loop(
        {
          ...state,
          [key]: {
            loading: true,
            data: null,
            error: null
          }
        },
        Cmd.run(() => client.query({ query, variables }), {
          successActionCreator: (data) =>
            fetchSuccess(data, operationName, variables)
        })
      )
    }
    case 'PERFORMANCE/FETCH_QUERY_DATA_SUCCESS': {
      const { data, operationName, variables } = action.payload
      const key = createKey({ operationName, variables })
      return loop(
        {
          ...state,
          [key]: {
            loading: false,
            data: data?.data,
            error: null
          }
        },
        Cmd.run(updateStoredData, {
          args: [data, operationName, variables]
        })
      )
    }
    default:
      return state
  }
}
