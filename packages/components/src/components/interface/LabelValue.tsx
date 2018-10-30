import * as React from 'react'
import styled, { keyframes } from 'styled-components'

export interface IProp {
  label: string
  value: string
}

const StyledContainer = styled.div`
  font-family: ${({ theme }) => theme.fonts.regularFont};
`

const StyledLabel = styled.label`
  font-family: ${({ theme }) => theme.fonts.boldFont};
  margin-right: 3px;
`
const StyledValue = styled.span`
  font-family: ${({ theme }) => theme.fonts.regularFont};
`

export class LabelValue extends React.Component<IProp> {
  render() {
    const { label, value } = this.props
    return (
      <StyledContainer>
        <StyledLabel>{label}:</StyledLabel>
        <StyledValue>{value}</StyledValue>
      </StyledContainer>
    )
  }
}
