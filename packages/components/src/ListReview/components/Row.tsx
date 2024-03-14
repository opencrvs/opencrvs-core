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

export const RowContainer = styled.tr`
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey200};

  td {
    padding: 14px 0;
    vertical-align: top;
  }

  td:first-child {
    margin: 0;
    ${({ theme }) => theme.fonts.bold16}
    min-width: 300px;
    padding-right: 48px;
  }

  td:nth-child(2) {
    margin: 0;
    ${({ theme }) => theme.fonts.reg16}
    width: 100%;
    padding-right: 48px;
  }

  td:last-child {
    min-width: 80px;
    text-align: right;
  }

  /* Media query for mobile */
  @media screen and (max-width: 768px) {
    td:first-child {
      display: block;
      min-width: 200px;
      width: 100%;
      border-bottom: none;
      padding-bottom: 0;
    }
    td:nth-child(2) {
      display: block;
      width: 100%;
      padding-top: 8px;
    }
    td:last-child {
      vertical-align: top;
      min-width: 100px;
    }
  }
`

const ActionsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
`

type RowProps = {
  id?: string
  value: React.ReactNode
  label: React.ReactNode
  actions: React.ReactNode
}

export const Row = ({ id, value, label, actions }: RowProps) => (
  <RowContainer id={id}>
    <td>{label}</td>
    <td data-test-id={`row-value-${id}`}>{value}</td>
    <td>
      <ActionsContainer>{actions}</ActionsContainer>
    </td>
  </RowContainer>
)
