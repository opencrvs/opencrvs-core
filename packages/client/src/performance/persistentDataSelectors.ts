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
import { PerformancePersistentDataState } from '@client/performance/persistentDataReducer'
import isValid from 'date-fns/isValid'
import format from 'date-fns/format'

export function createKey({
  operationName,
  variables
}: {
  operationName: string
  variables: Record<string, string>
}) {
  return [
    operationName,
    Object.values(variables).map((value) =>
      isValid(new Date(value)) ? format(new Date(value), 'yyyy-MM') : value
    )
  ].join(',')
}

export function getPersistentData(
  state: PerformancePersistentDataState,
  options: {
    operationName: string
    variables: Record<string, string>
  }
) {
  const key = createKey(options)
  return state[key]
}
