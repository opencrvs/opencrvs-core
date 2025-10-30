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
import { useIntl } from 'react-intl'
import * as z from 'zod'
import {
  SearchField,
  TranslationConfig,
  validateValue,
  HttpFieldValue,
  EventState
} from '@opencrvs/commons/client'
import {
  IColor,
  Link,
  Loader,
  Stack,
  Text,
  TextInput
} from '@opencrvs/components'
import { SecondaryButton } from '@opencrvs/components/lib/buttons'
import { useOnlineStatus } from '@client/utils'
import { Http, Props } from './Http'

const defaultIndicators = {
  loading: {
    defaultMessage: 'Searching...',
    description: 'Loading indicator',
    id: 'searchField.indicators.loading'
  },
  offline: {
    defaultMessage: 'Search is unavailable while offline',
    description: 'Offline indicator',
    id: 'searchField.indicators.offline'
  },
  httpError: {
    defaultMessage:
      '{statusCode, select, 408{Timed out} other{An error occurred while fetching data}}',
    description: 'HTTP error indicator',
    id: 'searchField.indicators.httpError'
  },
  noResultsError: {
    defaultMessage: 'No record found',
    description: 'No results found indicator',
    id: 'searchField.indicators.noResultsError'
  },
  confirmButton: {
    defaultMessage: 'Search',
    description: 'Confirm button text',
    id: 'searchField.indicators.confirmButton'
  },
  ok: {
    defaultMessage: 'Found {count} results',
    description: 'OK button text',
    id: 'searchField.indicators.ok'
  }
}

function Postfix({
  loadingIndicator = defaultIndicators.loading,
  isLoading = false,
  hasData = false,
  clearData
}: {
  loadingIndicator?: TranslationConfig
  isLoading?: boolean
  hasData?: boolean
  clearData: () => void
}) {
  const intl = useIntl()

  if (hasData) {
    return <Link onClick={clearData}>{'Clear'}</Link>
  }

  if (!isLoading) {
    return null
  }
  return (
    <Stack>
      {intl.formatMessage(loadingIndicator)}
      <Loader
        id="search-loading-indicator"
        innerMargin={0}
        spinnerDiameter={26}
      />
    </Stack>
  )
}

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
  configuration,
  value
}: Omit<Props, 'configuration'> & {
  configuration: SearchField['configuration']
  value: HttpFieldValue | null | undefined
}) {
  const intl = useIntl()

  const [inputState, setInputState] = useState(value?.data.input ?? '')
  const [buttonPressed, setButtonPressed] = useState(0)
  const [httpState, setHttpState] = useState<HttpFieldValue | null>(
    value ?? null
  )

  const SearchResponse = HttpFieldValue.extend({
    data: z.object({
      results: z.array(EventState),
      total: z.number()
    })
  })

  const isOnline = useOnlineStatus()

  const onHTTPChange = (val: HttpFieldValue) => {
    const maybeVal = SearchResponse.safeParse(val)
    if (maybeVal.error) {
      return
    }

    const data = { ...val.data, input: value?.data.input }

    if (!val.data.results.empty()) {
      data.results = data.results[0]
      data.input = inputState
    } else {
      data.results = null
    }

    onChange({ ...val, data })
    setHttpState({ ...val, data })
  }
  const valid = validateValue(configuration.validation.validator, inputState)

  const getMessages = (): { message?: string; color?: IColor } => {
    if (!valid) {
      return {
        message: intl.formatMessage(configuration.validation.message),
        color: 'red'
      }
    }
    if (!isOnline) {
      return {
        message: intl.formatMessage(
          configuration.indicators?.offline || defaultIndicators.offline
        )
      }
    }
    if (httpState?.error) {
      return {
        message: intl.formatMessage(
          configuration.indicators?.httpError || defaultIndicators.httpError,
          httpState.error
        ),
        color: 'red'
      }
    }
    if (!httpState?.error && httpState?.data) {
      const total =
        'total' in httpState.data && typeof httpState.data.total === 'number'
          ? httpState.data.total
          : 0

      if (total > 0) {
        return {
          message: intl.formatMessage(
            configuration.indicators?.ok || defaultIndicators.ok,
            { count: total }
          ),
          color: 'green'
        }
      } else {
        return {
          message: intl.formatMessage(
            configuration.indicators?.noResultsError ||
              defaultIndicators.noResultsError
          ),
          color: 'red'
        }
      }
    }
    return {}
  }

  const { message, color = 'grey600' } = getMessages()

  return (
    <Stack alignItems="flex-start" direction="column" gap={8}>
      <Stack>
        <TextInput
          data-testid="search-input"
          id="search"
          isDisabled={!!httpState}
          postfix={
            <Postfix
              clearData={() => setHttpState(null)}
              hasData={!!((httpState?.data.total ?? 0) > 0)}
              isLoading={httpState?.loading}
              loadingIndicator={configuration.indicators?.loading}
            />
          }
          value={inputState}
          onChange={(e) => {
            setHttpState(null)
            setInputState(e.target.value)
          }}
        />
        <Http.Input
          configuration={{
            url: '/api/events/events/search',
            timeout: 5000,
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: {
              query: replaceTerm(inputState, configuration.query),
              limit: configuration.limit,
              offset: configuration.offset
            }
          }}
          parentValue={buttonPressed}
          onChange={onHTTPChange}
        />
        {(!httpState ||
          !!httpState.error ||
          inputState !== value?.data.input) && (
          <SecondaryButton
            disabled={!valid || !isOnline}
            size="large"
            onClick={() => setButtonPressed(buttonPressed + 1)}
          >
            {intl.formatMessage(
              configuration.indicators?.confirmButton ||
                defaultIndicators.confirmButton
            )}
          </SecondaryButton>
        )}
      </Stack>
      {message && (
        <Text
          color={color}
          data-testid="search-input-error"
          element="span"
          variant="reg16"
        >
          {message}
        </Text>
      )}
    </Stack>
  )
}

export const Search = {
  Input: SearchInput,
  Output: null,
  stringify: () => `[Search response or error redacted]`
}
