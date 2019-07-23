import * as React from 'react'
import { Radio } from './Radio'
import { RadioButton } from '../../interface/RadioButton'
import { NoticeWrapper } from '../DateField'
import { InputLabel } from '../InputField/InputLabel'
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
const LargeList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  & div {
    margin-bottom: 16px;
  }
`

export enum RadioSize {
  LARGE = 'large',
  NORMAL = 'normal'
}
export interface IRadioOption {
  label: string
  value: string | boolean
}

export interface IRadioGroupProps {
  options: IRadioOption[]
  name: string
  value: string
  size?: RadioSize
  notice?: string
  onChange: (value: string) => void
}

export class RadioGroup extends React.Component<IRadioGroupProps> {
  change = (value: string) => {
    if (this.props.onChange) {
      this.props.onChange(value)
    }
  }

  render() {
    const { options, value, name, size, notice, ...props } = this.props

    return (
      <Wrapper>
        {notice && (
          <NoticeWrapper>
            <InputLabel>{notice}</InputLabel>
          </NoticeWrapper>
        )}
        {size && size === RadioSize.LARGE ? (
          <LargeList>
            {options.map(option => {
              return (
                <RadioButton
                  {...props}
                  size={'large'}
                  key={option.label}
                  name={name}
                  label={option.label}
                  value={option.value}
                  id={`${name}_${option.value}`}
                  selected={value}
                  onChange={this.change}
                />
              )
            })}
          </LargeList>
        ) : (
          <List>
            {options.map(option => {
              return (
                <Radio
                  {...props}
                  key={option.label}
                  name={name}
                  label={option.label}
                  value={option.value}
                  id={`${name}_${option.value}`}
                  selected={value}
                  onChange={this.change}
                />
              )
            })}
          </List>
        )}
      </Wrapper>
    )
  }
}
