import * as React from 'react'
import styled from 'styled-components'
import { IInputProps, Input } from '../InputField/Input'
import { InputError } from '../InputField/InputError'
import { InputLabel } from '../InputField/InputLabel'

export interface IProps {
  id: string
  label?: string
  disabled: boolean
  type: string
  meta?: { touched: boolean; error: string }
  min?: number
  focusInput: boolean
  onChange: (dateString: string) => {}
}

export interface IState {
  dd: string
  mm: string
  yyyy: string
}

export type IInputFieldProps = IProps & IInputProps

const DateSegment = styled(Input)`
  width: 4em;
  margin: 0 9px;
  text-align: center;

  &:first-of-type {
    margin-left: 0;
  }
  &:last-of-type {
    margin-right: 0;
  }
`

export class DateField extends React.Component<IInputFieldProps, IState> {
  constructor(props: IInputFieldProps) {
    super(props)

    if (props.value && typeof props.value === 'string') {
      const dateSegmentVals = props.value.split('-')
      this.state = {
        dd: dateSegmentVals[0],
        mm: dateSegmentVals[1],
        yyyy: dateSegmentVals[2]
      }
    } else {
      this.state = {
        dd: '',
        mm: '',
        yyyy: ''
      }
    }

    this.change = this.change.bind(this)
  }

  change(event: React.ChangeEvent<HTMLInputElement>) {
    const update = {}
    update[event.target.id] = event.target.value
    this.setState(update, () => {
      if (this.props.onChange) {
        this.props.onChange(
          `${this.state.dd}-${this.state.mm}-${this.state.yyyy}`
        )
      }
    })
  }

  render() {
    const { label, meta, focusInput, ...props } = this.props

    return (
      <div>
        <InputLabel>{label}</InputLabel>
        <DateSegment
          {...props}
          id="dd"
          error={Boolean(meta && meta.error)}
          touched={meta && meta.touched}
          focusInput={focusInput}
          placeholder="dd"
          type="number"
          min={1}
          max={31}
          value={this.state.dd}
          onChange={this.change}
        />
        <DateSegment
          {...props}
          id="mm"
          error={Boolean(meta && meta.error)}
          touched={meta && meta.touched}
          focusInput={false}
          placeholder="mm"
          type="number"
          maxLength={2}
          min={1}
          max={12}
          value={this.state.mm}
          onChange={this.change}
        />
        <DateSegment
          {...props}
          id="yyyy"
          error={Boolean(meta && meta.error)}
          touched={meta && meta.touched}
          focusInput={false}
          placeholder="yyyy"
          type="number"
          maxLength={4}
          min={1900}
          value={this.state.yyyy}
          onChange={this.change}
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
