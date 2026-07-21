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
import * as React from 'react'
import styled from 'styled-components'
// Direct light-theme token access; dark-mode theme switching lands in a follow-up PR (#12628).
import { lightColors } from '../semantics'

const Page = styled.div`
  display: flex;
  min-width: ${({ theme }) => theme.grid.minWidth}px;
  flex-direction: column;
  background-color: ${lightColors['surface/page']};
  min-height: 100vh;
  ${({ theme }) => theme.fonts.reg16};
`

const Wrapper = styled.div`
  margin: auto;
  max-width: ${({ theme }) => theme.grid.breakpoints.lg}px;
`

const Content = styled.section`
  flex: 1;
  width: 100%;
  height: 100%;
  color: ${lightColors['text/primary']};
  ${({ theme }) => theme.fonts.reg16};
`

export const PageWrapper = ({ children }: { children: React.ReactNode }) => (
  <Page>
    <Wrapper>
      <Content>{children}</Content>
    </Wrapper>
  </Page>
)
