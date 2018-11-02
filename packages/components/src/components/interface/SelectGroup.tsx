import * as React from 'react'
import styled from 'styled-components'

import { Select, ISelectOption } from '../forms/Select'
import { Omit } from '../omit'
import _ = require('lodash')

export interface ISelectGroupOption {
  name: string
  options: ISelectOption[]
  value: string
}

export interface ISelectGroupProps {
  name: string
  value: ISelectGroupValue[]
  onChange: (
    value: ISelectGroupValue[],
    changedValue: ISelectGroupValue
  ) => void
  options: ISelectGroupOption[]
}

interface ISelectGroupValue extends Omit<ISelectGroupOption, 'options'> {}

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
  change = ({ name, value }: ISelectGroupValue) => {
    const change: ISelectGroupValue[] = [{ name, value }]
    const newValue: ISelectGroupValue[] = _.unionBy(
      this.props.value,
      change,
      'name'
    )
    this.props.onChange(newValue, change[0])
  }

  render() {
    const { options, value, name, onChange, ...otherProps } = this.props

    return (
      <Wrapper>
        {options.map(option => {
          return (
            <StyledSelect
              id={`${name}_${option.value}`}
              key={option.name}
              value={option.value}
              options={option.options}
              onChange={(selectedValue: string) =>
                this.change({ name: option.name, value: selectedValue })
              }
              {...otherProps}
            />
          )
        })}
      </Wrapper>
    )
  }
}
