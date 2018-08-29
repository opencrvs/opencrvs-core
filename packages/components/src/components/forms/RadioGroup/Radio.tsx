import * as React from 'react'
import styled from 'styled-components'

const Wrapper = styled.li`
  padding-top: 5px;
  padding-bottom: 5px;
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
  border: 2px solid ${({ theme }) => theme.colors.primary};
  border-radius: 12px;
  height: 12px;
  width: 12px;
  top: 30px;
  left: 20px;
  transition: border 0.25s linear;
  -webkit-transition: border 0.25s linear;
  z-index: 1;

  &::before {
    display: block;
    position: relative;
    content: '';
    border-radius: 100%;
    height: 9px;
    width: 9px;
    top: 11%;
    margin: auto;
    transition: background 0.25s linear;
    -webkit-transition: background 0.25s linear;
  }
`

const Input = styled.input`
  position: absolute;
  width: 12px;
  height: 12px;
  opacity: 0;
  z-index: 2;
  cursor: pointer;
  &:checked ~ ${Check}::before {
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
