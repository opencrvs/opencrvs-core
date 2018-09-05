import * as React from 'react'
import styled from 'styled-components'

interface IWrapper {
  hide: boolean
}

const SubSectionWrapper = styled.div.attrs<IWrapper>({})`
  margin-top: 8px;
  border-top: solid 1px ${({ theme }) => theme.colors.background};
  width: calc(100% + 50px);
  margin-left: -25px;
  padding: 35px 25px;
  display: ${hide => (hide ? 'block' : 'none')};
`

const Title = styled.h2`
  font-family: ${({ theme }) => theme.fonts.lightFont};
  color: ${({ theme }) => theme.colors.copy};
`

export interface ISubSectionProps {
  label: string
  hide: boolean
}

export class SubSectionDivider extends React.Component<ISubSectionProps> {
  render() {
    const { label, hide } = this.props
    return (
      <SubSectionWrapper hide={hide}>
        <Title>{label}</Title>
      </SubSectionWrapper>
    )
  }
}
