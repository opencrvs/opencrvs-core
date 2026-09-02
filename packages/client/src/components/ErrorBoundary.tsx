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
import React, { Component, ReactNode } from 'react'
import styled from 'styled-components'

const ErrorMessage = styled.h1`
  text-align: center;
`

interface Props {
  children: ReactNode
  /* Rendered in place of children once an error has been caught. */
  fallback?: ReactNode
  onError?: (error: Error) => void
}

interface State {
  hasError: boolean
}

/*
 * React has no built-in error boundary, so every boundary in the app is built on
 * this one. React itself logs the error and component stack when a boundary
 * handles an error, so this only needs to swap in the fallback.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error) {
    this.props.onError?.(error)
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children
    }

    return (
      this.props.fallback ?? (
        <ErrorMessage>Something went wrong...</ErrorMessage>
      )
    )
  }
}
