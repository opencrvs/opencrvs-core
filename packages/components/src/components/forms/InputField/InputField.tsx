import * as React from 'react'
import styled from 'styled-components'
import { InputError } from './InputError'
import { InputLabel } from './InputLabel'

const InputHeader = styled.div`
  display: flex;
  justify-content: space-between;
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

const Required = styled.span.attrs<
  { disabled?: boolean } & React.LabelHTMLAttributes<HTMLLabelElement>
>({})`
  font-family: ${({ theme }) => theme.fonts.regularFont};
  font-size: 18px;
  color: ${({ disabled, theme }) =>
    disabled ? theme.colors.disabled : theme.colors.danger};
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

const InputDescription = styled.p<{
  ignoreMediaQuery?: boolean
}>`
  font-family: ${({ theme }) => theme.fonts.regularFont};
  font-size: 16px;
  color: ${({ theme }) => theme.colors.copy};

  ${({ ignoreMediaQuery, theme }) => {
    return !ignoreMediaQuery
      ? `@media (min-width: ${theme.grid.breakpoints.md}px) {
        width: 515px;
      }`
      : ''
  }}
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
  ignoreMediaQuery?: boolean
  hideAsterisk?: boolean
  hideBorder?: boolean
}

export class InputField extends React.Component<IInputFieldProps, {}> {
  render() {
    const {
      id,
      label,
      required = true,
      description,
      error,
      touched,
      ignoreMediaQuery,
      hideAsterisk,
      hideBorder
    } = this.props

    const postfix = this.props.postfix as React.ComponentClass<any> | string

    const { children, prefix } = this.props

    return (
      <div>
        <InputHeader>
          {label && (
            <InputLabel
              id={`${id}_label`}
              disabled={this.props.disabled}
              ignoreMediaQuery={ignoreMediaQuery}
              hideBorder={hideBorder}
            >
              {label}
              {required && !hideAsterisk && (
                <Required disabled={this.props.disabled}>&nbsp;*</Required>
              )}
            </InputLabel>
          )}
        </InputHeader>

        <ComponentWrapper>
          {prefix && <Padding>{prefix}</Padding>}
          {children}
          {postfix && <Padding>{postfix}</Padding>}
        </ComponentWrapper>

        {error && touched && (
          <InputError
            id={this.props.id + '_error'}
            centred={!this.props.maxLength}
            ignoreMediaQuery={ignoreMediaQuery}
          >
            {error}
          </InputError>
        )}

        {description && (
          <InputDescription ignoreMediaQuery={ignoreMediaQuery}>
            {description}
          </InputDescription>
        )}
      </div>
    )
  }
}
