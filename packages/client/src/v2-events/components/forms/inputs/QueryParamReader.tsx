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
import { useEffect } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import {
  QueryParamReaderField,
  QueryParamReaderFieldValue
} from '@opencrvs/commons/client'

function deleteAllParams(params: URLSearchParams) {
  for (const key of params.keys()) {
    params.delete(key)
  }
  return params
}

function prepareParamsFromMap(
  params: URLSearchParams,
  map: NonNullable<QueryParamReaderField['configuration']['map']>
) {
  const result: Record<string, string> = {}
  for (const [key, entry] of Object.entries(map)) {
    result[key] = params.get(entry) || ''
  }
  return result
}

function QueryParamReaderInput({
  configuration,
  onChange
}: {
  configuration: QueryParamReaderField['configuration']
  onChange: (params: QueryParamReaderFieldValue) => void
}) {
  const [searchParams, setSearchParams] = useSearchParams()
  const { map } = configuration

  useEffect(() => {
    if (searchParams.size === 0) {
      return
    }
    const paramsObject = map
      ? prepareParamsFromMap(searchParams, map)
      : Object.fromEntries(searchParams)
    onChange(paramsObject)
    setSearchParams(deleteAllParams(searchParams), { replace: true })
  }, [onChange, searchParams, setSearchParams, map])
  return null
}

export const QueryParamReader = {
  Input: QueryParamReaderInput,
  Output: null
}
