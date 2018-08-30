import * as React from 'react'
import styled, { StyledFunction } from 'styled-components'
import { ITextInputProps, TextInput } from '../TextInput'
import { InputError } from './InputError'
import { InputLabel } from './InputLabel'
import { ISelectProps } from '../Select'

export interface IInputFieldProps {
  id: string
  label?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  maxLength?: number
  meta?: { touched: boolean; error: string }
  component?: React.ComponentClass<any>
  prefix?: React.ComponentClass<any> | string
  postfix?: React.ComponentClass<any> | string
}

const applyDefaultIfNotDisabled = (
  disabled?: boolean,
  label?: string
): string => {
  return !disabled && label ? label : ''
}

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

export class InputField<
  P = ITextInputProps | ISelectProps
> extends React.Component<IInputFieldProps & P, {}> {
  render() {
    const {
      label,
      required = true,
      placeholder,
      component = TextInput,
      meta
    } = this.props
    const prefix = this.props.prefix as React.ComponentClass<any> | string
    const postfix = this.props.postfix as React.ComponentClass<any> | string

    const Component = component

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
          <Component
            {...this.props}
            placeholder={
              placeholder
                ? placeholder
                : applyDefaultIfNotDisabled(this.props.disabled, placeholder)
            }
            error={Boolean(meta && meta.error)}
            touched={meta && meta.touched}
          />
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
      </div>
    )
  }
}
