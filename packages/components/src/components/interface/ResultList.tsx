import * as React from 'react'
import styled, { keyframes } from 'styled-components'
import {
  StatusGreen,
  StatusOrange,
  StatusGray,
  StatusCollected
} from '../icons'

interface IProp {
  label: string
  value: string
}

interface IStatus {
  label: string
  type: string
}
export interface IResult {
  info: IProp[]
  status: IStatus[]
}
interface IList {
  list: IResult[]
}

const StyledList = styled.ul`
  font-family: ${({ theme }) => theme.fonts.regularFont};
  list-style-type: none;
  padding: 0;
  margin: 0;
  width: 100%;
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

function LabelValue({ label, value }: IProp) {
  return (
    <div>
      <StyledLabel>{label}:</StyledLabel>
      <StyledValue>{value}</StyledValue>
    </div>
  )
}

export class ResultList extends React.Component<IList> {
  render() {
    const { list } = this.props
    return (
      <StyledList>
        {list.map((item: IResult, index: number) => (
          <ListItemContainer key={index}>
            <InfoDiv>
              {item.info.map((data: IProp) => (
                <LabelValue label={data.label} value={data.value} />
              ))}
            </InfoDiv>
            <StatusDiv>
              {item.status.map((sts: IStatus) => (
                <StyledStatus>
                  {sts.type === 'orange' && <StatusOrange />}
                  {sts.type === 'gray' && <StatusGray />}
                  {sts.type === 'green' && <StatusGreen />}
                  {sts.type === 'collected' && <StatusCollected />}
                  <span>{sts.label}</span>
                </StyledStatus>
              ))}
            </StatusDiv>
          </ListItemContainer>
        ))}
      </StyledList>
    )
  }
}
