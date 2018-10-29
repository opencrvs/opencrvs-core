import * as React from 'react'
import styled, { keyframes } from 'styled-components'
import { StatusGreen, StatusOrange, StatusGray } from '../icons'

interface IProp {
  label: string
  value: string
}
interface IStatus {
  label: string
  color: string
}
interface IResult {
  name: IProp
  dob?: IProp
  dod?: IProp
  dom?: IProp
  doa: IProp
  trackingID: IProp
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
const StyledLabel = styled.label`
  font-family: ${({ theme }) => theme.fonts.regularFont};
  font-weight: bold;
`

const StyledStatus = styled.div`
  background-color: rgba(150, 150, 150, 0.1);
  border-radius: 17px;
  padding: 5px 10px 6px;
  margin: 0 5px;
  display: inline-flex;
  align-items: center;
  text-transform: uppercase;
  font-size: 14px;
  & span {
    font-weight: bold;
    margin-left: 5px;
  }
`
export class ResultList extends React.Component<IList> {
  render() {
    const { list } = this.props
    return (
      <StyledList>
        {list.map((item: IResult, index: number) => (
          <ListItemContainer key={index}>
            <div>
              <div>
                <StyledLabel>{item.name.label}: </StyledLabel>
                {item.name.value}
                &nbsp;|&nbsp;
                {item.dob && <StyledLabel>{item.dob.label}: </StyledLabel>}
                {item.dob && item.dob.value}
                {item.dod && <StyledLabel>{item.dod.label}: </StyledLabel>}
                {item.dod && item.dod.value}
                {item.dom && <StyledLabel>{item.dom.label}: </StyledLabel>}
                {item.dom && item.dom.value}
              </div>
              <div>
                <StyledLabel>{item.trackingID.label}: </StyledLabel>
                {item.trackingID.value}
              </div>
              <div>
                <StyledLabel>{item.doa.label}: </StyledLabel>
                {item.doa.value}
              </div>
            </div>
            <div>
              {item.status.map((sts: IStatus) => (
                <StyledStatus>
                  {sts.color === 'orange' && <StatusOrange />}
                  {sts.color === 'gray' && <StatusGray />}
                  {sts.color === 'green' && <StatusGreen />}
                  <span>{sts.label}</span>
                </StyledStatus>
              ))}
            </div>
          </ListItemContainer>
        ))}
      </StyledList>
    )
  }
}
