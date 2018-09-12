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

interface IRadioOption {
  label: string
  value: string
}

export interface IRadioGroup {
  options: IRadioOption[]
  name: string
  value: string
  onChange: (value: string) => {}
}

export class RadioGroup extends React.Component<IRadioGroup> {
  change = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (this.props.onChange) {
      this.props.onChange(event.target.value)
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
