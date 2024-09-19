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
import { getToken } from '@client/utils/authUtils'
import { UserDetails } from '@client/utils/userUtils'
import { Validation } from '@client/utils/validate'
import { get } from 'lodash'
import { useState } from 'react'

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
  const authHeader = {
    Authorization: `Bearer ${getToken()}`
  }

  return fetch(request.url, {
    headers: {
      ...request.headers,
      ...authHeader
    },
    body: request.body
      ? JSON.stringify(transformRequestBody(request.body, ...evalParams))
      : null
  })
}

export function httpErrorResponseValidator(httpFieldName: string): Validation {
  return function (
    _: unknown,
    __: unknown,
    ___: unknown,
    form?: IFormSectionData
  ) {
    const errorInHttpField = get(form, `${httpFieldName}.error`)?.toString()
    if (errorInHttpField) {
      return {
        message: {
          id: 'httpError',
          defaultMessage: errorInHttpField
        }
      }
    }
  }
}

export function useHttp<T>(
  field: IHttpFormField,
  ...evalParams: [IFormSectionData, IOfflineData, IFormData, UserDetails | null]
) {
  const [loading, setLoading] = useState<boolean>(false)
  const [data, setData] = useState<T | undefined>(undefined)
  const [error, setError] = useState<string | undefined>(undefined)
  const call = () => {
    setLoading(true)
    transformHttpFieldIntoRequest(field, ...evalParams)
      .then((res) => {
        if (res.ok) {
          return res.json()
        }
        throw new Error(res.statusText)
      })
      .then((data) => {
        setLoading(false)
        setData(data)
      })
      .catch((error) => {
        setLoading(false)
        setError(error.message)
      })
  }
  return {
    call,
    loading,
    data,
    error
  }
}
