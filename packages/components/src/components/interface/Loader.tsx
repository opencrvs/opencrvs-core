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

const StyledSpinner = styled(Spinner)`
  width: 100%;
  height: 100%;
  margin: 24px 0;
`
const LoadingContainer = styledLoader`
  width: 100%;
  margin: ${({ marginPercent }) => marginPercent}% auto;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction:column;
`
const LoadingTextContainer = styled.div`
  ${({ theme }) => theme.fonts.bigBodyStyle};
  text-align: center;
`

export class Loader extends React.Component<ILoader> {
  render() {
    const { id, loadingText, marginPercent, spinnerDiameter } = this.props
    return (
      <LoadingContainer id={id} marginPercent={marginPercent}>
        <StyledSpinner id={id + '_spinner'} size={spinnerDiameter} />
        {loadingText && (
          <LoadingTextContainer>{loadingText}</LoadingTextContainer>
        )}
      </LoadingContainer>
    )
  }
}
