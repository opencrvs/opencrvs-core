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
import { IFormSectionData, IFormData, IHttpFormField } from '@client/forms'
import { evalExpressionInFieldDefinition } from '@client/forms/utils'
import { IOfflineData } from '@client/offline/reducer'
import { UserDetails } from '@client/utils/userUtils'

function transformRequestBody(
  body: Record<string, any>,
  ...evalParams: [IFormSectionData, IOfflineData, IFormData, UserDetails | null]
) {
  return Object.fromEntries(
    Object.entries(body).map(([key, value]) => [
      key,
      evalExpressionInFieldDefinition(value, ...evalParams)
    ])
  )
}
export function transformHttpFieldIntoRequest(
  field: IHttpFormField,
  ...evalParams: [IFormSectionData, IOfflineData, IFormData, UserDetails | null]
) {
  const { options: request } = field
  const authHeader = request.headers.authorization

  return fetch(request.url, {
    headers: {
      ...request.headers,
      // eslint-disable-next-line no-eval
      authorization:
        authHeader !== null
          ? evalExpressionInFieldDefinition(authHeader, ...evalParams)
          : null
    },
    body: request.body
      ? JSON.stringify(transformRequestBody(request.body, ...evalParams))
      : null
  })
}
