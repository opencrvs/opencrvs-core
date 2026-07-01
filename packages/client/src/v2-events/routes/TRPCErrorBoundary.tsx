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
import React, { Component } from 'react'
import * as Sentry from '@sentry/react'
import { z } from 'zod'
import styled from 'styled-components'
import { TRPCClientError } from '@trpc/client'
import { connect } from 'react-redux'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import { Button, Box, PageWrapper } from '@opencrvs/components'
import { errorMessages, buttonMessages } from '@client/i18n/messages'
import { redirectToAuthentication } from '@client/profile/profileActions'

const ErrorContainer = styled(Box)`
  display: flex;
  width: 400px;
  flex-direction: column;
  align-items: center;
  margin-top: -80px;
`
const ErrorTitle = styled.h1`
  ${({ theme }) => theme.fonts.h1};
  color: ${({ theme }) => theme.colors.copy};
  margin-bottom: 16px;
`

const ErrorMessage = styled.div`
  ${({ theme }) => theme.fonts.reg18};
  color: ${({ theme }) => theme.colors.copy};
  margin-bottom: 32px;
  text-align: center;
`

const development = ['127.0.0.1', 'localhost'].includes(
  window.location.hostname
)

const StructuredError = z.object({
  message: z.string(),
  redirection: z.object({
    label: z.string(),
    path: z.string()
  })
})

export const throwStructuredError = ({
  message,
  redirection
}: z.infer<typeof StructuredError>) => {
  const error = JSON.stringify({ message, redirection })
  throw new Error(error)
}

async function clearIndexedDB(dbName: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const openReq: IDBOpenDBRequest = indexedDB.open(dbName)

    openReq.onsuccess = () => {
      const db: IDBDatabase = openReq.result
      db.close()

      const deleteReq: IDBOpenDBRequest = indexedDB.deleteDatabase(dbName)
      deleteReq.onsuccess = () => resolve()
      deleteReq.onerror = () => reject(deleteReq.error)
      deleteReq.onblocked = () =>
        reject(
          new Error(
            `Deletion of application data is blocked. Please close all other tabs of this application and try again.`
          )
        )
    }

    openReq.onerror = () => reject(openReq.error)
  })
}
async function clearAllIndexedDB() {
  const databases = await indexedDB.databases()
  return Promise.all(
    databases.map(async (db) => db.name && clearIndexedDB(db.name))
  )
}

function decodeStructuredError(
  message: string
): z.infer<typeof StructuredError> | string {
  try {
    const parsed = JSON.parse(message)
    const result = StructuredError.safeParse(parsed)
    if (result.success) {
      return result.data
    }
    return message
  } catch {
    return message
  }
}

interface Props extends IntlShapeProps {
  children: React.ReactNode
  redirectToAuthentication: typeof redirectToAuthentication
}

interface State {
  error: Error | null
  titleClickedTimes: number
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { error: null, titleClickedTimes: 0 }
  }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error) {
    // eslint-disable-next-line no-console
    console.error('TRPC Error Caught:', error)
  }
  onTitleClick = () => {
    if (this.state.titleClickedTimes >= 5) {
      if (
        !confirm(
          'Do you want to clear locally stored data and reload the page?'
        )
      ) {
        return
      }

      clearAllIndexedDB().catch((err) => {
        // eslint-disable-next-line no-console
        console.error('Failed to clear IndexedDB:', err)
        alert(
          'Failed to clear locally stored data. Please try clearing site data from your browser settings manually.'
        )
        return
      })
      alert('Data stored locally cleared. The page will now reload.')
      window.location.reload()
    }
    this.setState((prevState) => ({
      titleClickedTimes: prevState.titleClickedTimes + 1
    }))
  }
  render() {
    // eslint-disable-next-line no-shadow
    const { intl, redirectToAuthentication } = this.props
    if (this.state.error) {
      const error = this.state.error
      let httpCode = 500
      let message = error.message
      let buttonLabel = intl.formatMessage(buttonMessages.goToHomepage)
      let buttonPath = '/'

      if (error instanceof TRPCClientError) {
        if (
          error.meta &&
          typeof error.meta === 'object' &&
          'response' in error.meta &&
          error.meta.response &&
          typeof error.meta.response === 'object' &&
          'status' in error.meta.response &&
          'statusText' in error.meta.response
        ) {
          httpCode = Number(error.meta.response.status)
          message = String(error.meta.response.statusText)
        }
      }

      const structuredMessage = decodeStructuredError(String(error.message))
      if (typeof structuredMessage === 'object') {
        message = structuredMessage.message
        buttonLabel = structuredMessage.redirection.label
        buttonPath = structuredMessage.redirection.path
      } else {
        message = structuredMessage
      }

      /**
       * TODO: Improve the error message design once the probable errors are defined
       * and the design/ux is ready.
       */
      return (
        <Sentry.ErrorBoundary
          showDialog={!development}
          onError={(err) => {
            // eslint-disable-next-line no-console
            console.log('Sentry.ErrorBoundary: ', err)
          }}
        >
          <PageWrapper>
            <ErrorContainer>
              {httpCode === 401 ? (
                <>
                  <ErrorTitle>
                    {intl.formatMessage(errorMessages.errorTitleUnauthorized)}
                  </ErrorTitle>
                  <ErrorMessage>
                    {intl.formatMessage(errorMessages.errorCodeUnauthorized)}
                  </ErrorMessage>
                  <Button
                    id="GoToLoginPage"
                    size="large"
                    type="tertiary"
                    onClick={() => redirectToAuthentication(true)}
                  >
                    {intl.formatMessage(buttonMessages.login)}
                  </Button>
                </>
              ) : (
                <>
                  <ErrorTitle onClick={this.onTitleClick}>
                    {intl.formatMessage(errorMessages.errorTitle)}
                  </ErrorTitle>
                  <ErrorMessage>{message}</ErrorMessage>
                  <Button
                    id="GoToHomepage"
                    size="large"
                    type="tertiary"
                    onClick={() => (window.location.href = buttonPath)}
                  >
                    {buttonLabel}
                  </Button>
                </>
              )}
            </ErrorContainer>
          </PageWrapper>
        </Sentry.ErrorBoundary>
      )
    }

    return this.props.children
  }
}

export const TRPCErrorBoundary = connect(null, { redirectToAuthentication })(
  injectIntl(ErrorBoundary)
)
