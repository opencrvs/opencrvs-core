import * as React from 'react'
import styled from 'styled-components'
import { ITextInputProps, TextInput } from './TextInput'

export interface IProps {
  id: string
  disabled: boolean
  meta?: { touched: boolean; error: string }
  focusInput: boolean
  onChange: (dateString: string) => {}
}

export interface IState {
  dd: string
  mm: string
  yyyy: string
}

export type IInputFieldProps = IProps & ITextInputProps

const DateSegment = styled(TextInput)`
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
  private dd: React.RefObject<TextInput>
  private mm: React.RefObject<TextInput>
  private yyyy: React.RefObject<TextInput>

  constructor(props: IInputFieldProps) {
    super(props)
    this.dd = React.createRef()
    this.mm = React.createRef()
    this.yyyy = React.createRef()

    if (props.value && typeof props.value === 'string') {
      const dateSegmentVals = props.value.split('-')
      this.state = {
        yyyy: dateSegmentVals[0],
        mm: dateSegmentVals[1],
        dd: dateSegmentVals[2]
      }
    } else {
      this.state = {
        yyyy: '',
        mm: '',
        dd: ''
      }
    }
  }

  change = (event: React.ChangeEvent<HTMLInputElement>) => {
    const segmentType = String(event.target.id.split('-').pop())
    const val = event.target.value

    if (['dd', 'mm', 'yyyy'].includes(segmentType)) {
      switch (segmentType) {
        case 'dd':
          if (val.length > 2) {
            return
          }
          if (val.length > 1 && this.mm.current) {
            this.mm.current.focusField()
          }
          break
        case 'mm':
          if (val.length > 2) {
            return
          }
          if (val.length > 1 && this.yyyy.current) {
            this.yyyy.current.focusField()
          }
          break
        case 'yyyy':
          if (val.length > 4) {
            return
          }
          break
      }

      this.setState(
        { [segmentType]: val } as Pick<IState, 'dd' | 'mm' | 'yyyy'>,
        () => {
          if (this.props.onChange) {
            this.props.onChange(
              `${this.state.yyyy}-${this.state.mm}-${this.state.dd}`
            )
          }
        }
      )
    }
  }

  render() {
    const { id, meta, focusInput, ...props } = this.props

    return (
      <div id={id}>
        <DateSegment
          {...props}
          id={`${id}-dd`}
          innerRef={this.dd}
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
          id={`${id}-mm`}
          innerRef={this.mm}
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
          id={`${id}-yyyy`}
          innerRef={this.yyyy}
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
      </div>
    )
  }
}
