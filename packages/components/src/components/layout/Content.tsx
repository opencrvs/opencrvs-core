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

export const Content = styled.section`
  flex: 1;
  width: 100%;
  height: 100%;
  color: ${({ theme }) => theme.colors.copy};
  ${({ theme }) => theme.fonts.bodyStyle};
`

export const BodyContent = styled.div`
  max-width: 1140px;
  margin: 64px auto 0;
  padding: 40px 32px;
  position: relative;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    padding: 24px 16px;
  }
`

export const HomeContent = styled.div`
  max-width: 1140px;
  margin: 0 auto 64px auto;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.sm}px) {
    margin: 24px auto 64px auto;
  }
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    margin: 24px auto 64px auto;
    max-width: 100%;
  }
  @media (max-width: 1140px) and (min-width: ${({ theme }) =>
      theme.grid.breakpoints.lg}px) {
    max-width: calc(100% - 48px);
  }
  position: relative;
`

export const Container = styled.div<{ isCertificatesConfigPage?: boolean }>`
  background-color: ${({ isCertificatesConfigPage, theme }) =>
    isCertificatesConfigPage === true
      ? theme.colors.smallButtonFocus
      : theme.colors.white};
  position: absolute;
  min-height: 100vh;
  width: 100%;
`
export const FullBodyContent = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
  flex: 1;
  width: 100%;
  height: 100%;
  padding: 24px;
  margin-top: 68px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    padding: 0px;
  }
`
