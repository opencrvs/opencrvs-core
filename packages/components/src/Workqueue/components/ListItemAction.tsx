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
import { Button } from '../../Button'
import { IAction } from '../../common-types'
import { IActionComponent } from '..'

const Container = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    margin-left: 0px;
    padding-left: 0px;
  }
`

const ListItemActionsContainer = styled.div`
  display: flex;
  flex: 1;
  align-items: center;
  gap: 8px;
  justify-content: flex-end;
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
}

function isActionComponent(action: IAction): action is IActionComponent {
  return (action as IActionComponent).actionComponent !== undefined
}

export function ListItemAction(props: IListItemActionProps) {
  const { actions, id } = props
  return (
    <Container id={id}>
      <ListItemActionsContainer id="2ndContainer">
        {actions &&
          actions.map((action: IAction) =>
            isActionComponent(action) ? (
              <ActionButtonContainer>
                <ActionButton>
                  {React.cloneElement(action.actionComponent, { id })}
                </ActionButton>
              </ActionButtonContainer>
            ) : (
              <Button
                type="primary"
                key={action.label as string}
                id={`${id}-${action.label as string}`}
                size={'medium'}
                onClick={action.handler}
                disabled={action.disabled}
              >
                {action.icon} {action.label}
              </Button>
            )
          )}
      </ListItemActionsContainer>
    </Container>
  )
}
