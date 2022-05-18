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
import React from 'react'
import styled from 'styled-components'
import { ArrowUp, ArrowDown, Trash } from '../icons'
import { CircleButton } from '../buttons'
import { Pill } from './Pill'

const Card = styled.div<{ selected: boolean }>`
  display: flex;
  border-width: 2px;
  border-style: ${({ selected }) => (selected ? 'solid' : 'dashed')};
  border-color: ${({ selected, theme }) =>
    selected ? theme.colors.yellow : theme.colors.grey300};
  border-radius: 4px;
  padding: 14px 0 14px 14px;
  cursor: ${({ selected }) => (selected ? 'auto' : 'pointer')};

  &:hover {
    border-color: ${({ theme }) => theme.colors.yellow};
  }
`

const ChildrenContainer = styled.div`
  pointer-events: none;
  flex-grow: 1;
`

const Controls = styled.div`
  display: flex;
  margin: 0 7px;
  flex-direction: column;
  justify-content: space-between;
  min-width: 24px;
  align-items: end;
`

const MovementControls = styled.div`
  display: flex;
  flex-direction: column;
`

const TrashButton = styled(CircleButton)`
  margin-top: auto;
`

const StatusPill = styled(Pill)`
  margin-top: auto;
`

export interface IFormConfigElementCardProps {
  id: string
  children: React.ReactNode
  selected?: boolean
  movable?: boolean
  removable?: boolean
  status?: string
  isUpDisabled?: boolean
  isDownDisabled?: boolean
  onClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
  onRemove?: () => void
  onMoveUp?: () => void
  onMoveDown?: () => void
}

export function FormConfigElementCard({
  id,
  children,
  selected = false,
  movable = false,
  removable = false,
  isUpDisabled = false,
  isDownDisabled = false,
  status,
  onClick,
  onRemove,
  onMoveUp,
  onMoveDown
}: IFormConfigElementCardProps) {
  return (
    /*
     * onClick event is for selecting the card so it should fire
     * only when the card is not selected
     */
    <Card
      selected={selected}
      onClick={(event) => (!selected ? onClick && onClick(event) : undefined)}
    >
      <ChildrenContainer>{children}</ChildrenContainer>
      <Controls>
        {movable && selected && (
          <MovementControls>
            <CircleButton
              id={`${id}_up`}
              size="small"
              disabled={isUpDisabled}
              onClick={onMoveUp}
            >
              <ArrowUp />
            </CircleButton>
            <CircleButton
              id={`${id}_down`}
              size="small"
              disabled={isDownDisabled}
              onClick={onMoveDown}
            >
              <ArrowDown />
            </CircleButton>
          </MovementControls>
        )}
        {removable && selected && (
          <TrashButton id={`${id}_remove`} size="small" onClick={onRemove}>
            <Trash />
          </TrashButton>
        )}
        {!removable && status && <StatusPill label={status} />}
      </Controls>
    </Card>
  )
}
