import * as React from 'react'
import styled, { StyledComponentClass } from 'styled-components'
import { Button, IButtonProps } from './Button'
import { ExpansionButton } from './ExpansionButton'

const Container = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 1px;
  width: 120px;
`
const ListItemSingleAction = styled(Button)`
  display: flex;
  flex: 1;
  justify-content: center;
  color: ${({ theme }) => theme.colors.accent};
  background: ${({ theme }) => theme.colors.white};
  ${({ theme }) => theme.fonts.capsFontStyle};
  margin-bottom: 1px;
  &:last-child {
    margin-bottom: 0;
  }

  &:disabled {
    background-color: ${({ theme }) => theme.colors.white};
    cursor: not-allowed;
    color: ${({ theme }) => theme.colors.disabled};
  }
`
interface IListItemSingleActionProps extends IButtonProps {
  title: string
}
interface IListItemActionProps {
  actions: IListItemSingleActionProps[]
  expanded?: boolean
  onExpand?: () => void
}

export function ListItemAction(props: IListItemActionProps) {
  const { actions, expanded, onExpand } = props
  return (
    <Container>
      {actions.map((action: IListItemSingleActionProps) => (
        <ListItemSingleAction
          key={action.title as string}
          onClick={action.onClick}
        >
          {action.title}
        </ListItemSingleAction>
      ))}
      {onExpand && <ExpansionButton expanded={expanded} onClick={onExpand} />}
    </Container>
  )
}
