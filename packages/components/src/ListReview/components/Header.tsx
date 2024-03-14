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
import React from 'react'
import styled from 'styled-components'

export const HeaderContainer = styled.tr`
  th {
    border-bottom: 1px solid ${({ theme }) => theme.colors.grey200};
    padding: 12px 0;
    text-align: left;
  }

  th:first-child {
    ${({ theme }) => theme.fonts.bold12};
    color: ${({ theme }) => theme.colors.grey400};
    min-width: 300px;
    padding-right: 48px;
  }

  th:nth-child(2) {
    ${({ theme }) => theme.fonts.bold12};
    color: ${({ theme }) => theme.colors.grey400};
    width: 100%;
    padding-right: 48px;
  }

  th:last-child {
    min-width: 80px;
    padding: 8px 8px;
    text-align: right;
  }
`

type HeaderProps = {
  id?: string
  value: React.ReactNode
  label: React.ReactNode
}

export const Header = ({ id, value, label }: HeaderProps) => (
  <HeaderContainer id={id}>
    <td>{label}</td>
    <td>{value}</td>
    <td></td>
  </HeaderContainer>
)
