import * as React from 'react'
import styled, { keyframes } from 'styled-components'
import { StatusGreen, StatusOrange, StatusGray } from '../icons'
import { Status } from './Status'
import { LabelValue, IProp } from './LabelValue'

interface IStatus {
  label: string
  type: string
}
interface IResult {
  name: IProp
  dob?: IProp
  dod?: IProp
  dom?: IProp
  doa?: IProp
  doc?: IProp
  trackingID?: IProp
  regNo?: IProp
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
const StyledLabel = styled.label`
  font-family: ${({ theme }) => theme.fonts.regularFont};
  font-weight: bold;
`
export class ResultList extends React.Component<IList> {
  render() {
    const { list } = this.props
    return (
      <StyledList>
        {list.map((item: IResult, index: number) => (
          <ListItemContainer key={index}>
            <InfoDiv>
              <LabelValue label={item.name.label} value={item.name.value} />
              {item.dob && (
                <LabelValue label={item.dob.label} value={item.dob.value} />
              )}
              {item.dod && (
                <LabelValue label={item.dod.label} value={item.dod.value} />
              )}
              {item.dom && (
                <LabelValue label={item.dom.label} value={item.dom.value} />
              )}
              {item.doa && (
                <LabelValue label={item.doa.label} value={item.doa.value} />
              )}
              {item.doc && (
                <LabelValue label={item.doc.label} value={item.doc.value} />
              )}
              {item.trackingID && (
                <LabelValue
                  label={item.trackingID.label}
                  value={item.trackingID.value}
                />
              )}
              {item.regNo && (
                <LabelValue label={item.regNo.label} value={item.regNo.value} />
              )}
            </InfoDiv>
            <StatusDiv>
              {item.status.map((sts: IStatus) => (
                <Status
                  icon={() =>
                    sts.type === 'orange' ? (
                      <StatusOrange />
                    ) : sts.type === 'gray' ? (
                      <StatusGray />
                    ) : (
                      <StatusGreen />
                    )
                  }
                >
                  <strong>{sts.label}</strong>
                </Status>
              ))}
            </StatusDiv>
          </ListItemContainer>
        ))}
      </StyledList>
    )
  }
}
