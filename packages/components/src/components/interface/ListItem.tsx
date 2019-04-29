import * as React from 'react'
import styled, { keyframes } from 'styled-components'
import { IDynamicValues } from '../common-types'
import { ListItemAction } from '../buttons'
import { Chip } from '.'

export interface IInfo {
  label: string
  value: string
}

export interface IStatus {
  icon: JSX.Element
  label: string
}

export interface IAction {
  label: string
  handler: () => void
}

export interface IListItemProps {
  index: number
  infoItems: IInfo[]
  statusItems: IStatus[]
  icons?: JSX.Element[]
  actions?: IAction[]
  itemData: IDynamicValues
  expandedCellRenderer?: (itemData: IDynamicValues, key: number) => JSX.Element
}

interface IListItemState {
  expanded: boolean
}

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`

const Wrapper = styled.div.attrs<{ expanded?: boolean }>({})`
  width: 100%;
  margin-bottom: 1px;
  transition: border-top 300ms;
  box-shadow: ${({ expanded }) =>
    expanded ? `0 0 22px 0 rgba(0,0,0,0.23)` : ``};

  &:last-child {
    margin-bottom: 0;
  }
  border-top: ${({ expanded, theme }) =>
    expanded ? ` 4px solid ${theme.colors.expandedIndicator}` : `0`};
`
const ExpandedCellContent = styled.div`
  animation: ${fadeIn} 500ms;
`
const ExpandedCellContainer = styled.div.attrs<{ expanded: boolean }>({})`
  overflow: hidden;
  transition: max-height 600ms;
  max-height: ${({ expanded }) => (expanded ? '1000px' : '0px')};
  /* stylelint-disable */
  ${ExpandedCellContent} {
    /* stylelint-enable */
    animation: ${fadeIn} 500ms;
  }
`

const ListItemContainer = styled.li`
  display: flex;
  flex-flow: row wrap;
  width: 100%;
  margin-bottom: 1px;
  cursor: pointer;
  &:last-child {
    margin-bottom: 0;
  }
`
const ListContentContainer = styled.div`
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
  flex: 1;
  align-items: center;
  padding: 24px;
  font-family: ${({ theme }: any) => theme.fonts.regularFont};
  background-color: ${({ theme }: any) => theme.colors.white};
  color: ${({ theme }: any) => theme.colors.copy};
`
const InfoDiv = styled.div`
  flex-grow: 1;
  @media (max-width: ${({ theme }: any) => theme.grid.breakpoints.md}px) {
    width: 100%;
  }
`

const StatusDiv = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: flex-end;
  @media (max-width: ${({ theme }: any) => theme.grid.breakpoints.md}px) {
    width: 100%;
    margin-top: 10px;
  }
`

const IconsStatus = styled.div`
  border-radius: 17px;
  padding: 5px 10px 5px 7px;
  margin: 2px 5px 2px 0;
  display: flex;
  align-items: center;
  height: 32px;
`
const StyledLabel = styled.label`
  font-family: ${({ theme }: any) => theme.fonts.boldFont};
  margin-right: 3px;
`
const StyledValue = styled.span`
  font-family: ${({ theme }: any) => theme.fonts.regularFont};
`

function LabelValue({ label, value }: IInfo) {
  return (
    <div>
      <StyledLabel>{label}:</StyledLabel>
      <StyledValue>{value}</StyledValue>
    </div>
  )
}

export class ListItem extends React.Component<IListItemProps, IListItemState> {
  constructor(props: IListItemProps) {
    super(props)
    this.state = {
      expanded: false
    }
  }

  toggleExpanded = () => {
    this.setState(state => ({
      expanded: !state.expanded
    }))
  }

  render() {
    const {
      infoItems,
      statusItems,
      icons,
      index,
      actions,
      itemData
    } = this.props
    const { expanded } = this.state
    return (
      <Wrapper key={index} expanded={expanded}>
        <ListItemContainer key={index}>
          <ListContentContainer onClick={this.toggleExpanded}>
            <InfoDiv>
              {infoItems.map((data: IInfo, infoIndex) => (
                <LabelValue
                  key={infoIndex}
                  label={data.label}
                  value={data.value}
                />
              ))}
            </InfoDiv>
            <StatusDiv>
              {icons &&
                icons.map((icon: JSX.Element, iconIndex) => (
                  <IconsStatus key={iconIndex}>{icon}</IconsStatus>
                ))}
              {statusItems.map((status: IStatus, infoIndex) => (
                <Chip
                  key={infoIndex}
                  status={status.icon}
                  text={status.label}
                />
              ))}
            </StatusDiv>
          </ListContentContainer>
          <ListItemAction
            actions={actions || []}
            expanded={expanded}
            onExpand={
              this.props.expandedCellRenderer ? this.toggleExpanded : undefined
            }
          />
        </ListItemContainer>

        <ExpandedCellContainer expanded={expanded}>
          {expanded && (
            <ExpandedCellContent>
              {this.props.expandedCellRenderer &&
                this.props.expandedCellRenderer(itemData, index)}
            </ExpandedCellContent>
          )}
        </ExpandedCellContainer>
      </Wrapper>
    )
  }
}
