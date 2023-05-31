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
import styled, { css } from 'styled-components'
import { Content } from '../../Content'
import React from 'react'

export const FormLayout = styled.section`
  display: grid;
  width: 100%;
  gap: 24px;
  grid-template-columns: ${({ children }) =>
    React.Children.count(children) === 1 ? '1fr' : 'auto 1fr'};

  margin: 24px auto;

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    grid-template-columns: 1fr;
    max-width: 100%;
    gap: 0;
    margin: 0;
  }

  ${Content} {
    margin: 0 auto;
    width: 100%;
  }

  /* On multiple columns, remove margin in <Content> and apply margin to <Layout> */
  ${({ children }) =>
    React.Children.count(children) >= 2 &&
    css`
      max-width: min(740px, 100% - 24px - 24px);
      ${Content} {
        max-width: 100%;
      }
    `}
`
