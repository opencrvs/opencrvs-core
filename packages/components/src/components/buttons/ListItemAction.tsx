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
import { ExpansionButton } from './ExpansionButton'
import { ArrowExpansionButton } from './ArrowExpansionButton'
import { IAction, IActionComponent } from '../interface/ListItem'
import { PrimaryButton } from './PrimaryButton'

const Container = styled.div`
  background: ${({ theme }) => theme.colors.white};
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  margin-left: 1px;
  padding-left: 16px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    margin-left: 0px;
    padding-left: 0px;
  }
`
const ListItemSingleAction = styled(PrimaryButton)<{
  isFullHeight?: boolean
}>`
  ${({ isFullHeight }) => isFullHeight && ` height: 100%;`}
  max-height: 40px;
  text-transform: capitalize;
`
const ExpansionSecion = styled(ExpansionButton)<{
  isFullHeight?: boolean
}>`
  ${({ isFullHeight }) => isFullHeight && ` height: 100%;`}
`
const ArrowExpansionSecion = styled(ArrowExpansionButton)<{
  isFullHeight?: boolean
}>`
  ${({ isFullHeight }) => isFullHeight && ` height: 100%;`}
`
interface IListItemActionProps {
  actions: IAction[]
  id?: string
  expanded?: boolean
  arrowExpansion?: boolean
  isFullHeight?: boolean
  onExpand?: () => void
}

function isActionComponent(action: IAction): action is IActionComponent {
  return (action as IActionComponent).actionComponent !== undefined
}

export function ListItemAction(props: IListItemActionProps) {
  const {
    actions,
    expanded,
    arrowExpansion,
    onExpand,
    id,
    isFullHeight
  } = props
  return (
    <Container id={id}>
      {actions &&
        actions.map((action: IAction) =>
          isActionComponent(action) ? (
            React.cloneElement(action.actionComponent, { id })
          ) : (
            <ListItemSingleAction
              isFullHeight={isFullHeight}
              key={action.label as string}
              id={`${id}-${action.label as string}`}
              onClick={action.handler}
              icon={action.icon}
            >
              {action.label}
            </ListItemSingleAction>
          )
        )}
      {onExpand &&
        ((arrowExpansion && (
          <ArrowExpansionSecion
            isFullHeight={isFullHeight}
            expanded={expanded}
            onClick={onExpand}
          />
        )) || (
          <ExpansionSecion
            isFullHeight={isFullHeight}
            expanded={expanded}
            onClick={onExpand}
          />
        ))}
    </Container>
  )
}
