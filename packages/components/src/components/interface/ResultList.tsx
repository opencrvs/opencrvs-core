/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
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
  ${({ theme }) => theme.fonts.bodyStyle};
  list-style-type: none;
  padding: 0;
  margin: 0;
  width: 100%;
`

const ListItemContainer = styled.li`
  ${({ theme }) => theme.fonts.bodyStyle};
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
  ${({ theme }) => theme.fonts.bodyBoldStyle};
  margin-right: 3px;
`

const StyledValue = styled.span`
  ${({ theme }) => theme.fonts.bodyStyle};
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
