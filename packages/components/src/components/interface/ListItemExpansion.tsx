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
import * as React from 'react'
import styled from 'styled-components'
import { IAction } from './ListItem'

const ExpansionContent = styled.div`
  background: ${({ theme }) => theme.colors.white};
  padding: 25px;
`
const ActionContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
  margin-top: 1px;
  background: ${({ theme }) => theme.colors.white};
  padding: 20px 25px;
`
const ActionItem = styled.div`
  margin: 5px 10px 5px 0;

  &:last-child {
    margin-right: 0;
  }
`

interface IListItemExpansionProps extends React.HTMLAttributes<HTMLDivElement> {
  actions?: JSX.Element[]
}

export function ListItemExpansion(props: IListItemExpansionProps) {
  const { actions, children } = props
  return (
    <div>
      <ExpansionContent>{children}</ExpansionContent>
      {actions && actions.length > 0 && (
        <ActionContainer>
          {actions.map((action: JSX.Element, index: number) => (
            <ActionItem key={index}>{action}</ActionItem>
          ))}
        </ActionContainer>
      )}
    </div>
  )
}
