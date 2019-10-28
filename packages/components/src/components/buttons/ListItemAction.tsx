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
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  margin-left: 1px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    margin-left: 0px;
  }
`
const ListItemSingleAction = styled(PrimaryButton).attrs<{
  isFullHeight?: boolean
}>({})`
  ${({ isFullHeight }) => isFullHeight && `height: 100%;`}
  max-height: 40px;
  text-transform: capitalize;
`
const ListItemSingleIconAction = styled(TertiaryButton).attrs<{
  isFullHeight?: boolean
}>({})`
  ${({ isFullHeight }) => isFullHeight && `height: 100%;`}
`
const ExpansionSecion = styled(ExpansionButton).attrs<{
  isFullHeight?: boolean
}>({})`
  ${({ isFullHeight }) => isFullHeight && ` height: 100%;`}
`
const ArrowExpansionSecion = styled(ArrowExpansionButton).attrs<{
  isFullHeight?: boolean
}>({})`
  ${({ isFullHeight }) => isFullHeight && ` height: 100%;`}
`
const StatusIndicator = styled.div.attrs<{
  loading?: boolean
}>({})`
  display: flex;
  flex-grow: 1;
  align-items: center;
  justify-content: ${({ loading }) => (loading ? `space-between` : `flex-end`)};
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
            <StatusIndicator loading={action.loading}>
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
            <StatusIndicator>
              {action.error && <Warning />}
              <ListItemSingleIconAction
                isFullHeight={isFullHeight}
                key={action.label as string}
                id={`${id}-${action.label as string}`}
                onClick={action.handler}
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
