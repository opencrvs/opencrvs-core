import * as React from 'react'
import { Radio } from './Radio'
import styled from 'styled-components'

const Wrapper = styled.div`
  margin-top: 8px;
  margin-bottom: 10px;
`

const List = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`

export interface IRadioOption {
  label: string
  value: string | boolean
}

export interface IRadioGroupProps {
  options: IRadioOption[]
  name: string
  value: string
  onChange: (value: string) => void
}

export class RadioGroup extends React.Component<IRadioGroupProps> {
  change = (value: any) => {
    if (this.props.onChange) {
      this.props.onChange(value)
    }
  }

  render() {
    const { options, value, name, ...props } = this.props

    return (
      <Wrapper>
        <List>
          {options.map(option => {
            return (
              <Radio
                {...props}
                key={option.label}
                name={name}
                label={option.label}
                value={option.value}
                selected={value}
                onChange={this.change}
              />
            )
          })}
        </List>
      </Wrapper>
    )
  }
}
