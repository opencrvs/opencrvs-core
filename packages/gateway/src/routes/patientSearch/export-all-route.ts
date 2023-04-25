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
  getPersonsRecord,
  getSinglePersonRecord,
  requestParamSchemaForPerson,
  requestQuerySchemaForPerson,
  requestSchemaForPersons
} from '@gateway/routes/patientSearch/handler'
import { OSIA_SERVICE_VERSION } from '@gateway/constants'
import * as Hapi from '@hapi/hapi'

export default [
  {
    method: 'GET',
    path: `/${OSIA_SERVICE_VERSION}/persons`,
    handler: getPersonsRecord,
    config: {
      // Temporarily blocking OSIA search using OpenCRVS auth
      auth: true,
      validate: {
        query: requestSchemaForPersons,
        failAction: (
          request: Hapi.Request,
          h: Hapi.ResponseToolkit,
          error: { output: any }
        ) => handleError(h, error)
      }
    }
  },
  {
    method: 'GET',
    path: `/${OSIA_SERVICE_VERSION}/persons/{uin}`,
    handler: getSinglePersonRecord,
    config: {
      // Temporarily blocking OSIA search using OpenCRVS auth
      auth: true,
      validate: {
        params: requestParamSchemaForPerson,
        query: requestQuerySchemaForPerson,
        failAction: (
          request: Hapi.Request,
          h: Hapi.ResponseToolkit,
          error: { output: any }
        ) => handleError(h, error)
      }
    }
  }
]

const handleError = (h: Hapi.ResponseToolkit, error: { output: any }) => {
  const errorMessages = error?.output?.payload?.message
  return h
    .response({
      code: 1,
      message: errorMessages
    })
    .takeover()
    .code(error.output.statusCode)
}
