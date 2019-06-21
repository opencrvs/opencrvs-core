import * as React from 'react'
import styled from 'styled-components'

const Wrapper = styled.div`
  list-style-type: none;
  display: flex;
  flex-direction: row;
  width: auto;
  align-items: center;
`

const Label = styled.label.attrs<{ size?: string }>({})`
  color: ${({ theme }) => theme.colors.copy};
  cursor: pointer;
  ${({ size, theme }) =>
    size === 'large'
      ? `
    ${theme.fonts.bigBodyStyle};
    margin-left: 16px`
      : `
    ${theme.fonts.bodyBoldStyle};
    margin-left: 8px;`}
`

const Check = styled.span.attrs<{ size?: string }>({})`
  display: flex;
  justify-content: center;
  border: 2px solid ${({ theme }) => theme.colors.copy};
  ${({ size }) =>
    size === 'large'
      ? `height: 40px;
  width: 40px;`
      : `height: 28px;
  width: 28px;`}
  border-radius: 50%;
  align-items: center;
  & > span {
    display: flex;
    ${({ size }) =>
      size === 'large'
        ? `height: 20px;
    width: 20px;`
        : ` height: 16px;
    width: 16px;`}
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.white};
    align-self: center;
    transition: background 0.25s linear;
    -webkit-transition: background 0.25s linear;
  }
`

const Input = styled.input`
  position: absolute;
  opacity: 0;
  z-index: 2;
  width: 40px;
  height: 40px;
  cursor: pointer;
  /* stylelint-disable */
  &:checked ~ ${Check} > span {
    /* stylelint-enable */
    background: ${({ theme }) => theme.colors.copy};
  }
`

type Value = string | number | boolean

interface IRadioButton {
  id: string
  name: string
  label: string
  value: Value
  selected?: string
  size?: string
  onChange: (value: Value) => void
}

export class RadioButton extends React.Component<IRadioButton> {
  onChange = () => {
    this.props.onChange(this.props.value)
  }
  render() {
    const { id, name, selected, label, value, size } = this.props
    return (
      <Wrapper>
        <Input
          id={id}
          role="radio"
          checked={value === selected}
          type="radio"
          name={name}
          value={value.toString()}
          onChange={this.onChange}
        />
        <Check size={size}>
          <span />
        </Check>
        <Label size={size} htmlFor={id}>
          {label}
        </Label>
      </Wrapper>
    )
  }
}
