import * as React from 'react'
import styled from 'styled-components'
import { Button, IButtonProps } from './Button'
import { ExpansionButton } from './ExpansionButton'
import { IAction } from '../interface/ListItem'
import { TertiaryButton } from './TertiaryButton'

const Container = styled.div`
  display: flex;
  flex-direction: row;
  margin-left: 1px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    margin-left: 0px;
  }
`
const ListItemSingleAction = styled(TertiaryButton).attrs<{
  isFullHeight?: boolean
}>({})`
  ${({ isFullHeight }) => isFullHeight && ` height: 100%;`}
`
const ExpansionSec = styled(ExpansionButton).attrs<{ isFullHeight?: boolean }>(
  {}
)`
  ${({ isFullHeight }) => isFullHeight && ` height: 100%;`}
`
interface IListItemActionProps {
  actions: IAction[]
  id?: string
  expanded?: boolean
  isFullHeight?: boolean
  arrowExpansionButtons?: boolean
  onExpand?: () => void
}

export function ListItemAction(props: IListItemActionProps) {
  const {
    actions,
    expanded,
    onExpand,
    id,
    isFullHeight,
    arrowExpansionButtons
  } = props
  return (
    <Container id={id}>
      {actions &&
        actions.map((action: IAction) => (
          <ListItemSingleAction
            isFullHeight={isFullHeight}
            key={action.label as string}
            id={action.label as string}
            onClick={action.handler}
          >
            {action.label}
          </ListItemSingleAction>
        ))}
      {onExpand && (
        <ExpansionSec
          arrowExpansionButtons={arrowExpansionButtons}
          isFullHeight={isFullHeight}
          expanded={expanded}
          onClick={onExpand}
        />
      )}
    </Container>
  )
}
