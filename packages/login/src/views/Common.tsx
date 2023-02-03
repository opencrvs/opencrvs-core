/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */

import styled from 'styled-components'
import { Text } from '@opencrvs/components/lib/Text/Text'

export const FormWrapper = styled.form`
  width: 100%;
  padding: 16px 0;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    margin-top: 48px;
  }
`

export const LogoContainer = styled.div`
  flex-direction: row;
  display: flex;
  justify-content: center;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    & svg {
      transform: scale(0.8);
    }
  }
`

export interface IProps {
  formId: string
  submissionError: boolean
  errorCode?: number
}

export const Container = styled.div`
  position: relative;
  height: auto;
  margin: auto;
  width: min(380px, 90%);
`
