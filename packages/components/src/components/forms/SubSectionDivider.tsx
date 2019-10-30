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
`

const Title = styled.div`
  ${({ theme }) => theme.fonts.h4Style};
  color: ${({ theme }) => theme.colors.copy};
`
const Optional = styled.span<
  { disabled?: boolean } & React.LabelHTMLAttributes<HTMLLabelElement>
>`
  ${({ theme }) => theme.fonts.bigBodyBoldStyle};
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
