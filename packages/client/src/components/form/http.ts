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
      : null,
    method: request.method
  })
}

export function httpErrorResponseValidator(httpFieldName: string): Validation {
  return function (
    _: unknown,
    __: unknown,
    ___: unknown,
    form?: IFormSectionData
  ) {
    const errorInHttpField = get(
      form,
      `${httpFieldName}.error.message`
    )?.toString()
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

interface IRequestState<T> {
  loading: boolean
  success: boolean
  data: T | null
  error: { statusCode: number; message: string } | null
  networkError: boolean
  isCompleted: boolean
}

class HttpError extends Error {
  statusCode: number
  constructor({
    statusCode,
    message
  }: {
    statusCode: number
    message: string
  }) {
    super()
    this.statusCode = statusCode
    this.message = message
  }
}

export function useHttp<T = any>(
  field: IHttpFormField,
  onChange: ({
    loading,
    success,
    data,
    error,
    networkError,
    isCompleted
  }: IRequestState<T>) => void,
  ...evalParams: [IFormSectionData, IOfflineData, IFormData, UserDetails | null]
) {
  const [requestState, setRequestState] = useState<IRequestState<T>>({
    loading: false,
    success: false,
    data: null,
    error: null,
    networkError: false,
    isCompleted: false
  })
  const call = () => {
    setRequestState((state) => {
      const updatedState = {
        ...state,
        loading: true,
        isCompleted: false
      }
      onChange(updatedState)
      return updatedState
    })
    transformHttpFieldIntoRequest(field, ...evalParams)
      .then((res) => {
        if (res.ok) {
          return res.json()
        }
        return res.json().then((error: HttpError) => {
          throw new HttpError(error)
        })
      })
      .then((data) => {
        setRequestState((state) => {
          const updatedState = {
            ...state,
            loading: false,
            isCompleted: true,
            data
          }
          onChange(updatedState)
          return updatedState
        })
      })
      .catch((error) => {
        setRequestState((state) => {
          const updatedState = {
            ...state,
            loading: false,
            isCompleted: true,
            error: {
              statusCode: error.statusCode,
              message: error.message
            }
          }
          onChange(updatedState)
          return updatedState
        })
      })
  }
  return {
    call,
    ...requestState
  }
}
