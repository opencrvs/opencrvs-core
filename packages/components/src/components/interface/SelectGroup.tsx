import * as React from 'react'
import styled from 'styled-components'

import { ISelectProps, Select } from '../forms/Select'

export interface ISelectGroupProps {
  name: string
  value: string
  onChange: (value: string) => void
  options: ISelectProps[]
}

const Wrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
`

const StyledSelect = styled(Select)`
  max-width: 200px;
  margin: 10px;
  margin-left: 0;
  &:last-child {
    margin-right: 0;
  }
`

export class SelectGroup extends React.Component<ISelectGroupProps> {
  change = (value: string) => {
    if (this.props.onChange) {
      this.props.onChange(value)
    }
  }

  render() {
    const { options, value, name, ...otherProps } = this.props

    return (
      <Wrapper>
        {options.map(option => {
          return (
            <StyledSelect
              id={`${name}_${option.value}`}
              key={option.name}
              value={value as string}
              options={option.options}
              onChange={this.change}
              {...otherProps}
            />
          )
        })}
      </Wrapper>
    )
  }
}
