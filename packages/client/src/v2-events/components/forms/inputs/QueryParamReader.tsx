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

function hasAllRequiredParams(
  params: URLSearchParams,
  requiredParams: string[]
) {
  for (const param of requiredParams) {
    if (!params.has(param)) {
      return false
    }
  }
  return true
}

function QueryParamReaderInput({
  configuration,
  onChange
}: {
  configuration: QueryParamReaderField['configuration']
  onChange: (params: QueryParamReaderFieldValue) => void
}) {
  const [searchParams, setSearchParams] = useSearchParams()
  const { params: requiredParams } = configuration

  useEffect(() => {
    if (searchParams.size === 0) {
      return
    }
    if (hasAllRequiredParams(searchParams, requiredParams)) {
      onChange(Object.fromEntries(searchParams))
    }
    setSearchParams(deleteAllParams(searchParams), { replace: true })
  }, [onChange, requiredParams, searchParams, setSearchParams])
  return null
}

export const QueryParamReader = {
  Input: QueryParamReaderInput,
  Output: null
}
