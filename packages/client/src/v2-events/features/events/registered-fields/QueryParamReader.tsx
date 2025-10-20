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
import { useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  QueryParamReaderField,
  QueryParamReaderFieldValue
} from '@opencrvs/commons/client'

function prepareFieldValueFromPickedParams(
  params: URLSearchParams,
  pickParams: QueryParamReaderField['configuration']['pickParams']
) {
  const result: Record<string, string> = {}
  for (const key of pickParams) {
    const value = params.get(key)
    if (value) {
      result[key] = value
    }
  }
  return result
}

function removeParams(params: URLSearchParams, pickParams: string[]) {
  for (const key of pickParams) {
    params.delete(key)
  }
  return params
}

function QueryParamReaderInput({
  configuration,
  onChange
}: {
  configuration: QueryParamReaderField['configuration']
  onChange: (params: QueryParamReaderFieldValue) => void
}) {
  const [searchParams, setSearchParams] = useSearchParams()
  const { pickParams } = configuration
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange
  const searchString = searchParams.toString()

  useEffect(() => {
    if (!searchString) {
      return
    }
    const params = new URLSearchParams(searchString)
    const fieldValue = prepareFieldValueFromPickedParams(params, pickParams)
    void Promise.resolve().then(() => {
      if (Object.keys(fieldValue).length) {
        onChangeRef.current(fieldValue)
        setSearchParams(removeParams(params, pickParams), { replace: true })
      }
    })
  }, [pickParams, onChangeRef, searchString, setSearchParams])
  return null
}

export const QueryParamReader = {
  Input: QueryParamReaderInput,
  Output: null
}
