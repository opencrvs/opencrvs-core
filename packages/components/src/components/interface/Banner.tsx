import * as React from 'react'
import styled from 'styled-components'

export interface IBannerProps {
  text: string
  count: number
}

const StyledBanner = styled.div`
  padding: 25px;
  height: 109px;
  width: 940px;
  border-radius: 1px;
  font-family: ${({ theme }) => theme.fonts.regularFont};
  background-color: ${({ theme }) => theme.colors.accentLight};
`

const StatusOrange = () => (
  <svg width={16} height={16}>
    <title>{`0D0FCF6B-B898-4A22-808D-F0BAA2FF4146-565-000007DCE1416776`}</title>
    <g fillRule="nonzero" fill="none">
      <circle fill="#F4F4F4" cx={8} cy={8} r={8} />
      <circle fill="#F4C78A" cx={8} cy={8} r={8} />
      <circle fill="#F4A34E" cx={8} cy={8} r={4} />
    </g>
  </svg>
)

const StyledStatus = styled.div`
  width: 64px;
  display: flex;
  flex-flow: row nowrap;
  border-radius: 16px;
  padding: 5px 10px 5px 7px;
  margin: 13px 5px 2px 0;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.blackAlpha20};
  height: 32px;
`
const StyledText = styled.div`
  color: ${({ theme }) => theme.colors.white};
  font-family: ${({ theme }) => theme.fonts.regularFont};
  float: left;
  height: 38px;
  width: 475px;
  margin-top: 13px;
  margin-left: 10px;
  display: inline-block;
  font-size: 32px;
  font-weight: 300;
  line-height: 25px;
`

const StyledNumber = styled.span`
  height: 25px;
  width: 46px;
  font-size: 20px;
  line-height: 27px;
  text-align: center;
  margin-left: 10px;
  color: ${({ theme }) => theme.colors.white};
  font-family: ${({ theme }) => theme.fonts.regularFont};
`

export const Banner = ({ text, count }: IBannerProps) => {
  return (
    <StyledBanner>
      <StyledText>{text}</StyledText>
      <StyledStatus>
        <StatusOrange />
        <StyledNumber>{count}</StyledNumber>
      </StyledStatus>
    </StyledBanner>
  )
}
