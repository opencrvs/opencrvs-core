import * as React from 'react'
import styled from 'styled-components'

const SubSectionWrapper = styled.div`
  margin-top: 8px;
  border-top: solid 1px ${({ theme }) => theme.colors.background};
  width: calc(100% + 50px);
  margin-left: -25px;
  padding: 35px 25px;
`

const Title = styled.h2`
  font-family: ${({ theme }) => theme.fonts.lightFont};
  color: ${({ theme }) => theme.colors.copy};
`

export interface ISubSectionProps {
  label: string
}

export class SubSectionDivider extends React.Component<ISubSectionProps> {
  render() {
    const { label } = this.props
    return (
      <SubSectionWrapper>
        <Title>{label}</Title>
      </SubSectionWrapper>
    )
  }
}
