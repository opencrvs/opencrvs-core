import * as React from 'react'
import styled, { keyframes } from 'styled-components'
import {
  StatusGreen,
  StatusOrange,
  StatusGray,
  StatusCollected
} from '../icons'
import { Chip } from './Chip'

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
  font-family: ${({ theme }: any) => theme.fonts.regularFont};
  list-style-type: none;
  padding: 0;
  margin: 0;
  width: 100%;
`

const ListItemContainer = styled.li`
  font-family: ${({ theme }: any) => theme.fonts.regularFont};
  background-color: ${({ theme }: any) => theme.colors.white};
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
  color: ${({ theme }: any) => theme.colors.copy};
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

const StyledLabel = styled.label`
  font-family: ${({ theme }: any) => theme.fonts.boldFont};
  margin-right: 3px;
`

const StyledValue = styled.span`
  font-family: ${({ theme }: any) => theme.fonts.regularFont};
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
              {item.status.map((sts: IStatus, i) => {
                let status
                switch (sts.type) {
                  case 'orange':
                    status = <StatusOrange />
                    break
                  case 'gray':
                    status = <StatusGray />
                    break
                  case 'green':
                    status = <StatusGreen />
                    break
                  case 'collected':
                    status = <StatusCollected />
                    break
                  default:
                    status = <StatusGray />
                }
                return <Chip key={i} status={status} text={sts.label} />
              })}
            </StatusDiv>
          </ListItemContainer>
        ))}
      </StyledList>
    )
  }
}
