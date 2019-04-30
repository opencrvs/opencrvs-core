import * as React from 'react'
import styled from 'styled-components'
import { Spinner } from './Spinner'

export interface ILoader {
  id: string
  loadingText?: string
  marginPercent?: number
  spinnerDiameter?: number
}
export interface IDiaMeter {
  diameter: number | undefined
}

const styledLoader = styled.div.attrs<ILoader>({})
const styledSpinnerContainer = styled.div.attrs<IDiaMeter>({})

const StyledSpinner = styled(Spinner)`
  width: 100%;
  height: 100%;
`

const StyledSpinnerContainer = styledSpinnerContainer`
  width: ${({ diameter }) => diameter}px;
  height: ${({ diameter }) => diameter}px;
`
const LoadingSpinnerContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`
const LoadingContainer = styledLoader`
  margin: ${({ marginPercent }) => marginPercent}% auto;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
`

const LoadingTextContainer = styled.div`
  margin-top: 20px;
  font-family: ${({ theme }) => theme.fonts.lightFont};
  font-size: 18px;
  line-height: 27px;
  text-align: center;
  letter-spacing: 0.4px;
`

export class Loader extends React.Component<ILoader> {
  render() {
    const {
      children,
      id,
      loadingText,
      marginPercent,
      spinnerDiameter
    } = this.props
    return (
      <LoadingContainer id={id} marginPercent={marginPercent}>
        <LoadingSpinnerContainer>
          <StyledSpinnerContainer diameter={spinnerDiameter}>
            <StyledSpinner id={id + '_spinner'} />
          </StyledSpinnerContainer>
        </LoadingSpinnerContainer>
        <LoadingTextContainer>{loadingText}</LoadingTextContainer>
        {children}
      </LoadingContainer>
    )
  }
}
