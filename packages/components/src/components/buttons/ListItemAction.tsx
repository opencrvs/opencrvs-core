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
import { IAction } from '../interface/ListItem'
import { PrimaryButton } from './PrimaryButton'
import { TertiaryButton } from './TertiaryButton'
import { Spinner } from '../interface'
import { Warning } from '../icons'

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
  ${({ isFullHeight }) => isFullHeight && `height: 100%;`}
  max-height: 40px;
  text-transform: capitalize;
`
const ListItemSingleIconAction = styled(TertiaryButton)<{
  isFullHeight?: boolean
}>`
  ${({ isFullHeight }) => isFullHeight && `height: 100%;`}
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
const StatusIndicator = styled.div<{
  isLoading?: boolean
}>`
  display: flex;
  flex-grow: 1;
  align-items: center;
  justify-content: ${({ isLoading }) =>
    isLoading ? `space-between` : `flex-end`};
`
interface IListItemActionProps {
  actions: IAction[]
  id?: string
  expanded?: boolean
  arrowExpansion?: boolean
  isFullHeight?: boolean
  onExpand?: () => void
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
          action.loading && action.loadingLabel ? (
            <StatusIndicator isLoading={action.loading} key={id}>
              {action.loadingLabel}
              <Spinner id={`action-loading-${id}`} size={24} />
            </StatusIndicator>
          ) : action.label ? (
            <ListItemSingleAction
              isFullHeight={isFullHeight}
              key={action.label as string}
              id={`${id}-${action.label as string}`}
              onClick={action.handler}
              icon={action.icon}
            >
              {action.label}
            </ListItemSingleAction>
          ) : (
            <StatusIndicator key={`${id}-icon`}>
              {action.error && <Warning id={`action-error-${id}`} />}
              <ListItemSingleIconAction
                isFullHeight={isFullHeight}
                id={`${id}-icon`}
                onClick={e => {
                  action.handler()
                  e.stopPropagation()
                }}
                icon={action.icon}
              />
            </StatusIndicator>
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
