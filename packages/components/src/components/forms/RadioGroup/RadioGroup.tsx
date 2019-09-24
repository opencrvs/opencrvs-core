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
  & > div {
    margin-bottom: 16px;
  }
`
const NestedChildren = styled.div`
  margin: 15px 0px 0px 18px;
  padding-left: 33px;
  border-left: 4px solid ${({ theme }) => theme.colors.copy};
  padding-top: 0px !important;

  > div {
    padding: 16px 0;
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
  nestedFields?: { [key: string]: JSX.Element[] }
  onChange: (value: string) => void
}

export class RadioGroup extends React.Component<IRadioGroupProps> {
  render() {
    const {
      options,
      value,
      name,
      size,
      notice,
      nestedFields,
      ...props
    } = this.props

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
                <div key={option.label}>
                  <RadioButton
                    {...props}
                    size={'large'}
                    name={name}
                    label={option.label}
                    value={option.value}
                    id={`${name}_${option.value}`}
                    selected={value}
                    onChange={this.props.onChange}
                  />
                  {nestedFields &&
                    value === option.value &&
                    nestedFields[value] && (
                      <NestedChildren>{nestedFields[value]}</NestedChildren>
                    )}
                </div>
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
                  onChange={this.props.onChange}
                />
              )
            })}
          </List>
        )}
      </Wrapper>
    )
  }
}
