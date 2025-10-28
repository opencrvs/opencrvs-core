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
import {
  HttpFieldValue,
  SearchField,
  TranslationConfig,
  validateValue
} from '@opencrvs/commons/client'
import { IColor, Loader, Stack, Text, TextInput } from '@opencrvs/components'
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
  isLoading = false
}: {
  loadingIndicator?: TranslationConfig
  isLoading?: boolean
}) {
  const intl = useIntl()
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
  configuration
}: Omit<Props, 'configuration'> & {
  configuration: SearchField['configuration']
}) {
  const intl = useIntl()

  const [inputState, setInputState] = useState('')
  const [buttonPressed, setButtonPressed] = useState(0)
  const [httpState, setHttpState] = useState<HttpFieldValue | null>(null)

  const isOnline = useOnlineStatus()

  const onHTTPChange = (value: HttpFieldValue) => {
    onChange(value)
    setHttpState(value)
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
    if (httpState?.data) {
      let total = 0
      if (
        'total' in httpState.data &&
        typeof httpState.data.total === 'number'
      ) {
        total = httpState.data.total
      }

      if (total > 0) {
        return {
          message: intl.formatMessage(
            configuration.indicators?.ok || defaultIndicators.ok,
            { count: total }
          )
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
          postfix={
            <Postfix
              isLoading={httpState?.loading}
              loadingIndicator={configuration.indicators?.loading}
            />
          }
          value={inputState}
          onChange={(e) => setInputState(e.target.value)}
        />
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
              limit: configuration.limit,
              offset: configuration.offset
            }
          }}
          parentValue={buttonPressed}
          onChange={onHTTPChange}
        />
        {!httpState && (
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
