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
  defaultValue?: string
  name: string
  onChange: (value: string) => {}
}

interface IState {
  selected: string
}

export class RadioGroup extends React.Component<IRadioGroup, IState> {
  constructor(props: IRadioGroup) {
    super(props)
    if (props.defaultValue) {
      this.state = {
        selected: props.defaultValue
      }
    } else {
      this.state = {
        selected: ''
      }
    }
  }

  change = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ selected: event.target.value })
  }

  render() {
    const { options, name, ...props } = this.props
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
                selected={this.state.selected}
                onChange={this.change}
              />
            )
          })}
        </List>
      </Wrapper>
    )
  }
}
