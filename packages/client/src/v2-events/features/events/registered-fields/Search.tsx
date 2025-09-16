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
import { FieldValue, HttpField, HttpFieldValue } from '@opencrvs/commons/client'
import { TextInput } from '@opencrvs/components'
import { Http, Props } from './Http'

function SearchInput({ onChange }: Omit<Props, 'configuration'>) {
  const [inputState, setInputState] = useState('')
  const [buttonPressed, setButtonPressed] = useState(0)
  const [httpState, setHttpState] = useState<HttpFieldValue | null>(null)

  const onHTTPChange = (value: HttpFieldValue) => {
    console.log(value)
    onChange(value)
    setHttpState(value)
  }

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
            query: {
              type: 'or',
              clauses: [
                {
                  'legalStatuses.REGISTERED.registrationNumber': {
                    term: inputState,
                    type: 'exact'
                  }
                }
              ]
            },
            limit: 10,
            offset: 0
          }
        }}
        parentValue={buttonPressed}
        onChange={onHTTPChange}
      />
      <button onClick={() => setButtonPressed(buttonPressed + 1)}>
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
