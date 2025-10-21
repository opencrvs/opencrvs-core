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

/**
 *  For params like ?input1=1&input2=2,
 *  and formProjection = { input1: 'output1', input2: 'output2' }
 *  will result in { output1: '1', output2: '2' }
 */
function prepareFieldValueFromFormProjection(
  params: URLSearchParams,
  formProjection: NonNullable<
    QueryParamReaderField['configuration']['formProjection']
  >
) {
  const result: Record<string, string> = {}
  for (const [key, entry] of Object.entries(formProjection)) {
    const value = params.get(key)
    if (value) {
      result[entry] = value
    }
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
  const { formProjection } = configuration
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange
  const searchString = searchParams.toString()

  useEffect(() => {
    if (!searchString) {
      return
    }
    const params = new URLSearchParams(searchString)
    const fieldValue = formProjection
      ? prepareFieldValueFromFormProjection(params, formProjection)
      : Object.fromEntries(params)

    void Promise.resolve().then(() => {
      if (Object.keys(fieldValue).length) {
        onChangeRef.current({
          ...fieldValue,
          // to ensure formik sees it as a new value even if the params are the same
          [Symbol('updated')]: true
        })
        setSearchParams(new URLSearchParams(), { replace: true })
      }
    })
  }, [formProjection, onChangeRef, searchString, setSearchParams])
  return null
}

export const QueryParamReader = {
  Input: QueryParamReaderInput,
  Output: null
}
