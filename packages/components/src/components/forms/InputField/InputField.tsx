import * as React from 'react'
import styled, { StyledFunction } from 'styled-components'
import { ITextInputProps, TextInput } from '../TextInput'
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

const renderComponentOrString = (
  componentOrString: React.ComponentClass<any> | string
) => {
  if (typeof componentOrString === 'string') {
    return componentOrString
  } else {
    const Component = componentOrString
    return <Component />
  }
}

export interface IInputFieldProps {
  id: string
  label?: string
  description?: string
  required?: boolean
  disabled?: boolean
  maxLength?: number
  meta?: { touched: boolean; error: string }
  prefix?: React.ComponentClass<any> | string
  postfix?: React.ComponentClass<any> | string
}

export class InputField extends React.Component<IInputFieldProps, {}> {
  render() {
    const { label, required = true, description, meta } = this.props

    const postfix = this.props.postfix as React.ComponentClass<any> | string

    const { children, prefix } = this.props

    return (
      <div>
        <InputHeader>
          {label && (
            <InputLabel disabled={this.props.disabled}>{label}</InputLabel>
          )}
          {!required && (
            <Optional disabled={this.props.disabled}>•&nbsp;Optional</Optional>
          )}
        </InputHeader>

        <ComponentWrapper>
          {prefix && <Padding>{renderComponentOrString(prefix)}</Padding>}
          {children}
          {postfix && <Padding>{renderComponentOrString(postfix)}</Padding>}
        </ComponentWrapper>

        {meta &&
          meta.error &&
          meta.touched && (
            <InputError
              id={this.props.id + '_error'}
              centred={!this.props.maxLength}
            >
              {meta.error}
            </InputError>
          )}

        {description && <InputDescription>{description}</InputDescription>}
      </div>
    )
  }
}
