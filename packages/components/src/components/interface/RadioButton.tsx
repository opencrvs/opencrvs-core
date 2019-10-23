import * as React from 'react'
import styled from 'styled-components'

const Wrapper = styled.div`
  list-style-type: none;
  display: flex;
  flex-direction: row;
  width: auto;
  align-items: center;
`

const Label = styled.label.attrs<{ size?: string; disabled?: boolean }>({})`
  color: ${({ theme, disabled }) =>
    disabled ? theme.colors.disabled : theme.colors.copy};
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
const CheckOuter = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border-radius: 50%;
  position: relative;
`
const Check = styled.span.attrs<{ size?: string; disabled?: boolean }>({})`
  display: flex;
  justify-content: center;
  border: 2px solid
    ${({ theme, disabled }) =>
      disabled ? theme.colors.disabled : theme.colors.copy};
  ${({ size }) =>
    size === 'large'
      ? `height: 40px;
  width: 40px;`
      : `height: 28px;
  width: 28px;`}
  border-radius: 50%;
  align-items: center;
  ${({ disabled }) => (disabled ? `&:focus { box-shadow:none}` : '')}

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

const Input = styled.input.attrs<{ disabled?: boolean }>({})`
  position: absolute;
  opacity: 0;
  z-index: 2;
  width: 40px;
  height: 40px;
  cursor: pointer;
  &:focus ~ ${Check} {
    box-shadow: ${({ theme, disabled }) =>
        disabled ? theme.colors.white : theme.colors.focus}
      0 0 0 4px;
  }
  /* stylelint-disable */
  &:checked ~ ${Check} > span {
    /* stylelint-enable */

    background: ${({ theme }) => theme.colors.copy};
  }
  -webkit-tap-highlight-color: transparent;
`

type Value = string | number | boolean

interface IRadioButton {
  id: string
  name: string
  label: string
  value: Value
  selected?: string
  disabled?: boolean
  size?: string
  onChange?: (value: Value) => void
}

export class RadioButton extends React.Component<IRadioButton> {
  onChange = () => {
    if (this.props.onChange) {
      this.props.onChange(this.props.value)
    }
  }
  render() {
    const { id, name, selected, label, value, size, disabled } = this.props
    return (
      <Wrapper>
        <CheckOuter>
          <Input
            id={id}
            disabled={disabled}
            role="radio"
            checked={value === selected}
            type="radio"
            name={name}
            value={value.toString()}
            onChange={disabled ? () => null : this.onChange}
          />
          <Check disabled={disabled} size={size}>
            {disabled ? '' : <span />}
          </Check>
        </CheckOuter>
        <Label disabled={disabled} size={size} htmlFor={id}>
          {label}
        </Label>
      </Wrapper>
    )
  }
}
