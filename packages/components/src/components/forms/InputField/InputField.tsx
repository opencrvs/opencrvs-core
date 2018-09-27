import * as React from 'react'
import styled from 'styled-components'
import { InputError } from './InputError'
import { InputLabel } from './InputLabel'

const InputHeader = styled.div`
  display: flex;
  justify-content: space-between;
`

const Optional = styled.div.attrs<
  { disabled?: boolean } & React.LabelHTMLAttributes<HTMLLabelElement>
>({})`
  font-family: ${({ theme }) => theme.fonts.regularFont};
  font-size: 14px;
  color: ${({ disabled, theme }) =>
    disabled ? theme.colors.disabled : theme.colors.accent};
  flex-grow: 0;
`

const ComponentWrapper = styled.span`
  display: flex;
`

const Padding = styled.span`
  padding: 0 4px;
  display: inline-flex;
  align-items: center;
  font-family: ${({ theme }) => theme.fonts.regularFont};
  font-size: 16px;
  color: ${({ theme }) => theme.colors.accent};
`

const InputDescription = styled.p`
  font-family: ${({ theme }) => theme.fonts.regularFont};
  font-size: 16px;
  color: ${({ theme }) => theme.colors.copy};
`

export interface IInputFieldProps {
  id: string
  label?: string
  description?: string
  required?: boolean
  disabled?: boolean
  maxLength?: number
  touched: boolean
  error?: string
  prefix?: string | JSX.Element
  postfix?: string | JSX.Element
  optionalLabel: string
  children: React.ReactNode
}

export class InputField extends React.Component<IInputFieldProps, {}> {
  render() {
    const {
      label,
      optionalLabel,
      required = true,
      description,
      error,
      touched
    } = this.props

    const postfix = this.props.postfix as React.ComponentClass<any> | string

    const { children, prefix } = this.props

    return (
      <div>
        <InputHeader>
          {label && (
            <InputLabel disabled={this.props.disabled}>{label}</InputLabel>
          )}
          {!required && (
            <Optional disabled={this.props.disabled}>
              •&nbsp;{optionalLabel}
            </Optional>
          )}
        </InputHeader>

        <ComponentWrapper>
          {prefix && <Padding>{prefix}</Padding>}
          {children}
          {postfix && <Padding>{postfix}</Padding>}
        </ComponentWrapper>

        {error &&
          touched && (
            <InputError
              id={this.props.id + '_error'}
              centred={!this.props.maxLength}
            >
              {error}
            </InputError>
          )}

        {description && <InputDescription>{description}</InputDescription>}
      </div>
    )
  }
}
