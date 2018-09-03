import * as React from 'react'
import styled from 'styled-components'

const Wrapper = styled.li`
  padding-top: 5px;
  padding-bottom: 5px;
  list-style-type: none;
`

const Label = styled.label`
  position: relative;
  left: 6px;
  top: -2px;
  color: ${({ theme }) => theme.colors.copy};
  font-family: ${({ theme }) => theme.fonts.regularFont};
  font-size: 16px;
`

const Check = styled.span`
  display: inline-block;
  background: ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
  height: 22px;
  width: 22px;
  transition: border 0.25s linear;
  -webkit-transition: border 0.25s linear;
  z-index: 1;

  &::after {
    display: block;
    position: relative;
    content: '';
    background: ${({ theme }) => theme.colors.white};
    border-radius: 50%;
    height: 8px;
    width: 8px;
    top: -7px;
    left: 7px;
    transition: background 0.25s linear;
    -webkit-transition: background 0.25s linear;
  }

  &::before {
    display: block;
    position: relative;
    content: '';
    background: ${({ theme }) => theme.colors.white};
    border-radius: 50%;
    height: 14px;
    width: 14px;
    top: 4px;
    left: 4px;
    transition: background 0.25s linear;
    -webkit-transition: background 0.25s linear;
  }
`

const Input = styled.input`
  position: absolute;
  width: 16px;
  height: 16px;
  opacity: 0;
  z-index: 2;
  cursor: pointer;
  /* stylelint-disable */
  &:checked ~ ${Check}::after {
    /* stylelint-enable */
    background: ${({ theme }) => theme.colors.primary};
  }
`

interface IRadio {
  name: string
  label: string
  value: string | number
  selected: string
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}

export class Radio extends React.Component<IRadio> {
  render() {
    const { name, selected, label, value, onChange } = this.props
    return (
      <Wrapper>
        <Input
          {...this.props}
          role="radio"
          checked={value === selected}
          type="radio"
          name={name}
          value={value}
          onChange={onChange}
        />
        <Check />
        <Label>{label}</Label>
      </Wrapper>
    )
  }
}
