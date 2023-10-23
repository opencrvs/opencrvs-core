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
import styled from 'styled-components'

export const BodyContent = styled.div`
  max-width: 1140px;
  margin: 64px auto 0;
  padding: 40px 32px;
  position: relative;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    padding: 24px 16px;
  }
`

export const Container = styled.div<{ isCertificatesConfigPage?: boolean }>`
  background-color: ${({ isCertificatesConfigPage, theme }) =>
    isCertificatesConfigPage === true
      ? theme.colors.grey100
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
  padding: 80px 24px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    padding: 56px 0px;
  }
`
