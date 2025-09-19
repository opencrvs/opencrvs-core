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
import { useLocation, useSearchParams } from 'react-router-dom'
import {
  QueryParamReaderField,
  QueryParamReaderFieldValue
} from '@opencrvs/commons/client'

/**
 *  For params like ?input1=1&input2=2,
 *  and map = { input1: 'output1', input2: 'output2' }
 *  will result in { output1: '1', output2: '2' }
 */
function prepareParamsFromMap(
  params: URLSearchParams,
  map: NonNullable<QueryParamReaderField['configuration']['map']>
) {
  const result: Record<string, string> = {}
  for (const [key, entry] of Object.entries(map)) {
    result[entry] = params.get(key) || ''
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
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange
  const searchString = searchParams.toString()

  useEffect(() => {
    if (!searchString) {
      return
    }
    const params = new URLSearchParams(searchString)
    const paramsObject = map
      ? prepareParamsFromMap(params, map)
      : Object.fromEntries(params)

    void Promise.resolve().then(() => onChangeRef.current(paramsObject))
    setSearchParams(new URLSearchParams(), { replace: true })
  }, [map, onChangeRef, searchString, setSearchParams])
  return null
}

export const QueryParamReader = {
  Input: QueryParamReaderInput,
  Output: null
}
