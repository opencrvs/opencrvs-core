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
import { ExpansionButton } from '../../buttons/ExpansionButton'
import { ArrowExpansionButton } from '../../buttons/ArrowExpansionButton'
import { Button } from '../../Button'
import { ColumnContentAlignment, IAction } from '../../common-types'
import { IActionComponent } from '..'
const Container = styled.div`
  background: ${({ theme }) => theme.colors.white};
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-left: 1px;

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    margin-left: 0px;
    padding-left: 0px;
  }
`

const ListItemActionsContainer = styled.div<{
  alignment?: ColumnContentAlignment
}>`
  display: flex;
  flex: 1;
  align-items: center;
  gap: 8px;
  justify-content: ${({ alignment }) => {
    if (alignment === ColumnContentAlignment.LEFT) {
      return 'flex-start'
    } else if (alignment === ColumnContentAlignment.CENTER) {
      return alignment
    } else {
      return 'flex-end'
    }
  }};
`
const ListItemSingleAction = styled(Button)<{
  isFullHeight?: boolean
}>`
  ${({ isFullHeight }) => isFullHeight && ` height: 100%;`}
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
const ActionButtonContainer = styled.div`
  width: 40px;
  display: flex;
`

const ActionButton = styled.div`
  margin: auto;
  display: flex;
  align-items: center;
`

interface IListItemActionProps {
  actions: IAction[]
  id?: string
  expanded?: boolean
  arrowExpansion?: boolean
  isFullHeight?: boolean
  onExpand?: () => void
  alignment?: ColumnContentAlignment
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
    isFullHeight,
    alignment
  } = props
  return (
    <Container id={id}>
      <ListItemActionsContainer alignment={alignment} id="2ndContainer">
        {actions &&
          actions.map((action: IAction, index) =>
            isActionComponent(action) ? (
              <ActionButtonContainer key={`ActionButtonContainer-${index}`}>
                <ActionButton>
                  {React.cloneElement(action.actionComponent, { id })}
                </ActionButton>
              </ActionButtonContainer>
            ) : (
              <ListItemSingleAction
                type="primary"
                isFullHeight={isFullHeight}
                key={`ListItemSingleAction-${action.label as string}`}
                id={`${id}-${action.label as string}`}
                size={'medium'}
                onClick={action.handler}
                disabled={action.disabled}
              >
                <>
                  {action.icon} {action.label}
                </>
              </ListItemSingleAction>
            )
          )}
      </ListItemActionsContainer>
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
