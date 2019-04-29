import * as React from 'react'
import styled from 'styled-components'
import { Button, IButtonProps } from './Button'
import { ExpansionButton } from './ExpansionButton'
import { IAction } from '../interface/ListItem'

const Container = styled.div`
  display: flex;
  flex-direction: row;
  margin-left: 1px;
`
const ListItemSingleAction = styled(Button)`
  display: flex;
  flex: 1;
  justify-content: center;
  color: ${({ theme }: any) => theme.colors.accent};
  background: ${({ theme }: any) => theme.colors.white};
  ${({ theme }: any) => theme.fonts.capsFontStyle};
  font-weight: 600;
  margin-bottom: 1px;
  padding: 15px 25px;
  &:last-child {
    margin-bottom: 0;
  }

  &:disabled {
    background-color: ${({ theme }: any) => theme.colors.white};
    cursor: not-allowed;
    color: ${({ theme }: any) => theme.colors.disabled};
  }
`

interface IListItemActionProps {
  actions: IAction[]
  id?: string
  expanded?: boolean
  onExpand?: () => void
}

export function ListItemAction(props: IListItemActionProps) {
  const { actions, expanded, onExpand, id } = props
  return (
    <Container id={id}>
      {actions &&
        actions.map((action: IAction) => (
          <ListItemSingleAction
            key={action.label as string}
            id={action.label as string}
            onClick={action.handler}
          >
            {action.label}
          </ListItemSingleAction>
        ))}
      {onExpand && <ExpansionButton expanded={expanded} onClick={onExpand} />}
    </Container>
  )
}
