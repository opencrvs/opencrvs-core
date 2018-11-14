import * as React from 'react'
import styled from 'styled-components'

export interface IInfo {
  label: string
  value: string
}

export interface IStatus {
  icon: JSX.Element
  label: string
}

export interface IDynamicValues {
  [key: string]: string
}

export interface IListItemProps {
  index: number
  infoItems: IInfo[]
  statusItems: IStatus[]
  itemData: IDynamicValues
  expandedCellRenderer: (itemData: IDynamicValues, key: number) => JSX.Element
}

interface IListItemState {
  expanded: boolean
}
const Wrapper = styled.div.attrs<{ expanded?: boolean }>({})`
  width: 100%;
  margin-bottom: 1px;
  box-shadow: ${({ expanded }) =>
    expanded ? `0 0 22px 0 rgba(0,0,0,0.23)` : ``};

  &:last-child {
    margin-bottom: 0;
  }
`
const ExpandedIndicator = styled.div`
  height: 4px;
  border-radius: 1px 1px 0 0;
  background: linear-gradient(
    ${({ theme }) => theme.colors.expandedIndicator},
    ${({ theme }) => theme.colors.expandedIndicatorSecondary}
  );
  margin-top: 2px;
`
const ListItemContainer = styled.li`
  font-family: ${({ theme }) => theme.fonts.regularFont};
  background-color: ${({ theme }) => theme.colors.white};
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
  color: ${({ theme }) => theme.colors.copy};
  width: 100%;
  margin-bottom: 1px;
  padding: 10px;
  align-items: center;
  cursor: pointer;
  &:last-child {
    margin-bottom: 0;
  }
`

const InfoDiv = styled.div`
  flex-grow: 1;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    width: 100%;
  }
`

const StatusDiv = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: flex-end;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    width: 100%;
    margin-top: 10px;
  }
`
const StyledStatus = styled.div`
  font-family: ${({ theme }) => theme.fonts.boldFont};
  background-color: rgba(150, 150, 150, 0.1);
  border-radius: 17px;
  padding: 5px 10px 5px 7px;
  margin: 2px 5px 2px 0;
  display: flex;
  align-items: center;
  height: 32px;
  & span {
    text-transform: uppercase;
    margin-left: 5px;
    font-size: 13px;
  }
`

const StyledLabel = styled.label`
  font-family: ${({ theme }) => theme.fonts.boldFont};
  margin-right: 3px;
`
const StyledValue = styled.span`
  font-family: ${({ theme }) => theme.fonts.regularFont};
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
    const { infoItems, statusItems, index, itemData } = this.props
    const { expanded } = this.state
    return (
      <Wrapper key={index} expanded={expanded}>
        {expanded && <ExpandedIndicator />}
        <ListItemContainer key={index} onClick={this.toggleExpanded}>
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
            {statusItems.map((status: IStatus, infoIndex) => (
              <StyledStatus key={infoIndex}>
                {status.icon}
                <span>{status.label}</span>
              </StyledStatus>
            ))}
          </StatusDiv>
        </ListItemContainer>
        {expanded && this.props.expandedCellRenderer(itemData, index)}
      </Wrapper>
    )
  }
}
