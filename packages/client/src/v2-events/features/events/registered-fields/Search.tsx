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

import React, { useState } from 'react'
import {
  HttpFieldValue,
  isConditionMet,
  SearchField,
  validateValue
} from '@opencrvs/commons/client'
import { TextInput } from '@opencrvs/components'
import { Http, Props } from './Http'

function replaceTerm<T>(term: string, query: T): T {
  if (typeof query === 'string') {
    return query.replace('{term}', term) as T
  } else if (Array.isArray(query)) {
    return query.map((q) => replaceTerm(term, q)) as T
  } else if (typeof query === 'object' && query !== null) {
    const newObj: Record<string, unknown> = {}
    for (const key in query) {
      newObj[key] = replaceTerm(term, query[key])
    }
    return newObj as T
  }
  return query
}

function SearchInput({
  onChange,
  configuration
}: Omit<Props, 'configuration'> & {
  configuration: SearchField['configuration']
}) {
  const [inputState, setInputState] = useState('')
  const [buttonPressed, setButtonPressed] = useState(0)
  const [httpState, setHttpState] = useState<HttpFieldValue | null>(null)

  const onHTTPChange = (value: HttpFieldValue) => {
    onChange(value)
    setHttpState(value)
  }
  const valid = validateValue(configuration.validation.validator, inputState)

  return (
    <div>
      <label htmlFor="search">Label</label>
      <TextInput
        data-testid="search-input"
        id="search"
        value={inputState}
        onChange={(e) => setInputState(e.target.value)}
      />
      {httpState?.loading && <p>Loading...</p>}
      <Http.Input
        configuration={{
          url: '/api/events/search',
          timeout: 5000,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: {
            query: replaceTerm(inputState, configuration.query),
            limit: configuration.limit ?? 100,
            offset: configuration.offset ?? 0
          }
        }}
        parentValue={buttonPressed}
        onChange={onHTTPChange}
      />
      {!valid && <div data-testid="search-input-error">Invalid input</div>}
      <button
        disabled={!valid}
        onClick={() => setButtonPressed(buttonPressed + 1)}
      >
        Confirm
      </button>
    </div>
  )
}

export const Search = {
  Input: SearchInput,
  Output: null,
  stringify: () => `[Search response or error redacted]`
}
