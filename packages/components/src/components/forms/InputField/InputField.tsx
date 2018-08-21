import * as React from 'react'
import styled, { StyledFunction } from 'styled-components'
import { IInputProps, Input } from './Input'
import { InputError } from './InputError'
import { InputLabel } from './InputLabel'

export interface IProps extends IInputProps {
  id: string
  label?: string
  required?: boolean
  meta?: { touched: boolean; error: string }
}

export type IInputFieldProps = IProps & IInputProps

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

export class InputField extends React.Component<IInputFieldProps, {}> {
  render() {
    const {
      label,
      required = true,
      placeholder,
      meta,
      focusInput,
      ...props
    } = this.props

    return (
      <div>
        <InputHeader>
          {label && <InputLabel disabled={props.disabled}>{label}</InputLabel>}
          {!required && (
            <Optional disabled={props.disabled}>•&nbsp;Optional</Optional>
          )}
        </InputHeader>

        <Input
          {...props}
          placeholder={
            placeholder
              ? placeholder
              : applyDefaultIfNotDisabled(props.disabled, placeholder)
          }
          error={Boolean(meta && meta.error)}
          touched={meta && meta.touched}
          focusInput={focusInput}
        />
        {meta &&
          meta.error &&
          meta.touched && (
            <InputError id={props.id + '_error'} centred={!props.maxLength}>
              {meta.error}
            </InputError>
          )}
      </div>
    )
  }
}
