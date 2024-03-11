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
import React, { ReactNode } from 'react'
import styled from 'styled-components'
import * as Sentry from '@sentry/react'

const ErrorMessage = styled.h1`
  text-align: center;
`
const development = ['127.0.0.1', 'localhost'].includes(
  window.location.hostname
)

export const ErrorBoundary = ({ children }: { children: ReactNode }) => (
  <Sentry.ErrorBoundary
    showDialog={!development}
    fallback={<ErrorMessage>Something went wrong...</ErrorMessage>}
  >
    {children}
  </Sentry.ErrorBoundary>
)
