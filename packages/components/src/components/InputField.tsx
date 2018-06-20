import * as React from 'react'
import { InjectedIntl } from 'react-intl'
import { FormattedMessage } from 'react-intl'
import styled, { StyledFunction } from 'styled-components'
import { IInputProps, Input } from './form/Input'
import { InputError } from './form/InputError'
import { InputLabel } from './form/InputLabel'
import { substituteDynamicIntlProps } from './utils/intlUtils'
import { IIntlDynamicProps } from './utils/intlUtils'
export interface IInputFieldProps {
  input?: any
  intl: InjectedIntl
  id: string
  label?: string
  placeholder?: string
  disabled: boolean
  type: string
  meta?: { touched: boolean; error: FormattedMessage.MessageDescriptor }
  maxLength?: number
  min?: number
  dynamicErrors?: IIntlDynamicProps
}

export interface ILocalState {
  inputValue: string
}

const applyDefaultIfNotDisabled = (
  disabled: boolean,
  label?: string
): string => {
  return !disabled && label ? label : ''
}

const isAValidNumber = (value: string): boolean => {
  const numberRexExp = new RegExp('^\\d*$')
  return numberRexExp.test(value)
}

export class InputField extends React.Component<
  IInputFieldProps & IInputProps,
  ILocalState
> {
  constructor(props: any) {
    super(props)
    this.handleChange = this.handleChange.bind(this)
    this.state = {
      inputValue: ''
    }
  }

  handleChange(event: Event) {
    const element = event.currentTarget as HTMLInputElement
    if (this.props.type === 'number') {
      if (isAValidNumber(element.value) && element.value.length < 12) {
        this.setState({
          inputValue: element.value
        })
      }
    } else {
      this.setState({
        inputValue: element.value
      })
    }
  }

  render() {
    const {
      input,
      intl,
      id,
      label,
      type,
      placeholder,
      disabled,
      meta,
      min,
      maxLength = 50,
      dynamicErrors
    } = this.props

    return (
      <div>
        {label && <InputLabel disabled={disabled}>{label}</InputLabel>}
        <Input
          {...input}
          placeholder={
            placeholder
              ? placeholder
              : applyDefaultIfNotDisabled(disabled, label)
          }
          error={meta && meta.error}
          touched={meta && meta.touched}
          value={this.state.inputValue}
          onChange={this.handleChange}
        />
        {meta &&
          dynamicErrors &&
          meta.error &&
          meta.error.defaultMessage &&
          meta.touched && (
            <InputError
              id={id + '_error'}
              errorMessage={substituteDynamicIntlProps(
                intl,
                meta.error,
                dynamicErrors
              )}
            />
          )}
      </div>
    )
  }
}
