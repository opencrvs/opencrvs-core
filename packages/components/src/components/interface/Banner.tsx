import * as React from 'react'
import styled from 'styled-components'
import { StatusOrange, StatusGray, StatusRejected } from '../icons'
export interface IBannerProps {
  text: string
  count: number
  status: string
}

const StyledBanner = styled.div`
  padding: 0 30px;
  width: 100%;
  border-radius: 1px;
  display: flex;
  align-items: center;
  ${({ theme }) => theme.fonts.bodyStyle};
  background-color: ${({ theme }) => theme.colors.secondary};
  min-height: 109px;
  margin: 20px 0;
  box-shadow: 0 0 12px 0 rgba(0, 0, 0, 0.32);
`
const StyledStatus = styled.div`
  display: flex;
  flex-flow: row nowrap;
  border-radius: 16px;
  padding: 5px 10px 5px 7px;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.placeholder};
  height: 32px;
  margin-left: 10px;
`
const StyledText = styled.div`
  color: ${({ theme }) => theme.colors.white};
  ${({ theme }) => theme.fonts.h3Style};
  min-height: 42px;
`

const StyledNumber = styled.span`
  ${({ theme }) => theme.fonts.h4Style};
  margin-left: 5px;
  color: ${({ theme }) => theme.colors.white};
`

export const Banner = ({ text, count, status }: IBannerProps) => {
  return (
    <StyledBanner>
      <StyledText>{text}</StyledText>
      <StyledStatus>
        {status === 'applications' ? (
          <StatusOrange />
        ) : status === 'rejected' ? (
          <StatusRejected />
        ) : (
          <StatusGray />
        )}
        <StyledNumber>{count}</StyledNumber>
      </StyledStatus>
    </StyledBanner>
  )
}
