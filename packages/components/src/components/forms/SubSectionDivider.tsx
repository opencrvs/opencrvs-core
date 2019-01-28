import * as React from 'react'
import styled from 'styled-components'

const SubSectionWrapper = styled.div`
  border-top: solid 1px ${({ theme }) => theme.colors.background};
  width: calc(100% + 50px);
  margin-left: -25px;
  padding-top: 14px;
  padding-left: 25px;
  padding-right: 25px;
  flex-direction: row;
  h2 {
    display: inline;
  }
`

const Title = styled.h2`
  font-family: ${({ theme }) => theme.fonts.lightFont};
  color: ${({ theme }) => theme.colors.copy};
`
const Optional = styled.span.attrs<
  { disabled?: boolean } & React.LabelHTMLAttributes<HTMLLabelElement>
>({})`
  font-family: ${({ theme }) => theme.fonts.regularFont};
  font-size: 18px;
  color: ${({ disabled, theme }) =>
    disabled ? theme.colors.disabled : theme.colors.placeholder};
  flex-grow: 0;
`

export interface ISubSectionProps {
  label: string
  required?: boolean
  optionalLabel: string
  disabled?: boolean
}

export class SubSectionDivider extends React.Component<ISubSectionProps> {
  render() {
    const { label, required, optionalLabel } = this.props
    return (
      <SubSectionWrapper>
        <Title>{label}</Title>
        {required === false && (
          <Optional disabled={this.props.disabled}>
            &nbsp;&nbsp;•&nbsp;{optionalLabel}
          </Optional>
        )}
      </SubSectionWrapper>
    )
  }
}
