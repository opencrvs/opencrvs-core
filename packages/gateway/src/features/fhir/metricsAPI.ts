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
// eslint-disable-next-line import/no-relative-parent-imports
import { METRICS_URL } from '@gateway/constants'
import { OpenCRVSRESTDataSource } from '@gateway/graphql/data-source'

export interface ITimeLoggedResponse {
  status?: string
  timeSpentEditing: number
}

export default class MetricsAPI extends OpenCRVSRESTDataSource {
  override baseURL = `${METRICS_URL}`

  getTimeLogged(recordId: string) {
    return this.get(`/timeLogged?compositionId=${recordId}`)
  }
}
