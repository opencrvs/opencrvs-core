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
import styled from 'styled-components'
import {
  SearchField,
  validateValue,
  HttpFieldValue,
  EventIndex
} from '@opencrvs/commons/client'
import {
  Button,
  IColor,
  Link,
  Loader,
  ResponsiveModal,
  Stack,
  Text,
  TextInput
} from '@opencrvs/components'
import { SecondaryButton } from '@opencrvs/components/lib/buttons'
import { useOnlineStatus } from '@client/utils'
import { useModal } from '@client/v2-events/hooks/useModal'
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
  },
  clearButton: {
    defaultMessage: 'Clear',
    description: 'Clear button text',
    id: 'searchField.indicators.clearButton'
  },
  clearModal: {
    title: {
      defaultMessage: 'Clear search results?',
      description: 'Title for the clear confirmation modal',
      id: 'searchField.indicators.clearModal.title'
    },
    description: {
      defaultMessage: 'This will remove the current search results.',
      description: 'Description for the clear confirmation modal',
      id: 'searchField.indicators.clearModal.description'
    },
    cancel: {
      defaultMessage: 'Cancel',
      description: 'Cancel button for clear confirmation modal',
      id: 'searchField.indicators.clearModal.cancel'
    },
    confirm: {
      defaultMessage: 'Confirm',
      description: 'Confirm button for clear confirmation modal',
      id: 'searchField.indicators.clearModal.confirm'
    }
  }
}

function ClearModal({
  close,
  configuration
}: {
  close: (result: boolean) => void
  configuration: SearchField['configuration']
}) {
  const intl = useIntl()

  return (
    <ResponsiveModal
      autoHeight
      preventClickOnParent
      show
      actions={[
        <Button
          key="cancel-btn"
          id="cancel"
          type="tertiary"
          onClick={() => close(false)}
        >
          {intl.formatMessage(
            configuration.indicators?.clearModal?.cancel ??
              defaultIndicators.clearModal.cancel
          )}
        </Button>,
        <Button
          key="clear-btn"
          id="clear"
          type="positive"
          onClick={() => close(true)}
        >
          {intl.formatMessage(
            configuration.indicators?.clearModal?.confirm ??
              defaultIndicators.clearModal.confirm
          )}
        </Button>
      ]}
      handleClose={() => close(false)}
      id="clearModal"
      responsive={false}
      title={intl.formatMessage(
        configuration.indicators?.clearModal?.title ??
          defaultIndicators.clearModal.title
      )}
    >
      {intl.formatMessage(
        configuration.indicators?.clearModal?.description ??
          defaultIndicators.clearModal.description
      )}
    </ResponsiveModal>
  )
}

const SearchInputWrapper = styled.div`
  display: flex;
  width: 100%;
  gap: 8px;
`
function Postfix({
  configuration,
  isLoading = false,
  hasData = false,
  clearData
}: {
  configuration: SearchField['configuration']
  isLoading?: boolean
  hasData?: boolean
  clearData: () => void
}) {
  const intl = useIntl()

  if (hasData) {
    return (
      <Link onClick={clearData}>
        {intl.formatMessage(
          configuration.indicators?.clearButton ?? defaultIndicators.clearButton
        )}
      </Link>
    )
  }

  if (!isLoading) {
    return null
  }
  return (
    <Stack>
      {intl.formatMessage(
        configuration.indicators?.loading ?? defaultIndicators.loading
      )}
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

const SearchResponse = HttpFieldValue.extend({
  data: z.object({
    results: z.array(EventIndex),
    firstResult: EventIndex.nullish(),
    total: z.number()
  })
})

function SearchInput({
  onChange,
  configuration,
  value
}: Omit<Props, 'configuration'> & {
  configuration: SearchField['configuration']
  value: HttpFieldValue | null | undefined
}) {
  const intl = useIntl()

  const [modal, openModal] = useModal()

  const [inputState, setInputState] = useState(value?.data?.input ?? '')
  const [buttonPressed, setButtonPressed] = useState(0)
  const [httpState, setHttpState] = useState<HttpFieldValue | null>(
    value ?? null
  )
  const isOnline = useOnlineStatus()

  const clearData = async () => {
    const confirm = await openModal<boolean>((close) => (
      <ClearModal close={close} configuration={configuration} />
    ))
    if (confirm) {
      setInputState('')
      setHttpState(null)
      onChange({
        loading: false,
        error: {
          statusCode: 204,
          message: 'cleard'
        }
      })
    }
  }

  const onHTTPChange = (val: HttpFieldValue) => {
    if (val.loading) {
      setHttpState(val)
      return
    }

    const maybeResponse = SearchResponse.safeParse(val)
    if (maybeResponse.error) {
      setHttpState(val)
      return
    }

    const response = maybeResponse.data

    const data = { ...response.data, input: value?.data?.input }

    if (response.data.results.length === 0) {
      setHttpState({ ...response, data })
      return
    }

    data.firstResult = response.data.results[0]
    data.input = inputState
    onChange({ ...response, data })
    setHttpState({ ...response, data })
  }
  const valid = validateValue(configuration.validation.validator, inputState)

  const getMessages = (): { message?: string; color?: IColor } => {
    if (inputState && !valid) {
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
      if (httpState.error.statusCode === 204) {
        return {}
      }
      return {
        message: intl.formatMessage(
          configuration.indicators?.httpError || defaultIndicators.httpError,
          httpState.error
        ),
        color: 'red'
      }
    }
    if (!httpState?.error && httpState?.data && 'total' in httpState.data) {
      const total =
        typeof httpState.data.total === 'number' ? httpState.data.total : 0

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

  const isEditable =
    !httpState || !!httpState.error || !((httpState.data?.total ?? 0) > 0)

  return (
    <Stack alignItems="flex-start" direction="column" gap={8}>
      <SearchInputWrapper>
        <TextInput
          data-testid="search-input"
          id="search"
          isDisabled={!isEditable}
          postfix={
            <Postfix
              clearData={async () => clearData()}
              configuration={configuration}
              hasData={!!((httpState?.data?.total ?? 0) > 0)}
              isLoading={httpState?.loading}
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
        {isEditable && (
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
      </SearchInputWrapper>
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
      {modal}
    </Stack>
  )
}

export const Search = {
  Input: SearchInput,
  Output: null,
  stringify: () => `[Search response or error redacted]`
}
