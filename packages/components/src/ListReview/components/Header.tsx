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

export const HeaderContainer = styled.tr<{
  fontVariant: FontVariant
}>`
  th {
    border-bottom: 2px solid ${({ theme }) => theme.colors.grey100};
    padding: 20px 0;
    text-align: left;
    ${({ theme, fontVariant }) => theme.fonts[fontVariant ?? 'reg16']};

    @media screen and (max-width: 768px) {
      display: none;
    }
  }

  th:first-child {
    min-width: 300px;
    padding-right: 48px;
  }

  th:nth-child(2) {
    width: 100%;
    padding-right: 48px;
  }

  th:last-child {
    min-width: 80px;
    padding: 20px 8px;
    text-align: right;
  }
`
type FontVariant =
  | 'reg12'
  | 'reg14'
  | 'reg16'
  | 'reg18'
  | 'h4'
  | 'h3'
  | 'h2'
  | 'h1'

type HeaderProps = {
  id?: string
  value: React.ReactNode
  label: React.ReactNode
  fontVariant?: FontVariant
}

export const Header = ({
  id,
  value,
  label,
  fontVariant = 'reg16'
}: HeaderProps) => (
  <HeaderContainer id={id} fontVariant={fontVariant}>
    <th>{label}</th>
    <th>{value}</th>
    <th></th>
  </HeaderContainer>
)
