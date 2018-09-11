import * as React from 'react'
import { default as ReactSelect } from 'react-select'
import styled from 'styled-components'
import { Props } from 'react-select/lib/Select'

export interface ISelectProps extends Props<any> {
  id: string
  error?: boolean
  touched?: boolean
  options: ISelectOption[]
}

interface ISelectOption {
  value: string
  label: string
}

interface IReactSelectOverrides {
  onChange: (value: string) => void
}

const StyledSelect = styled(ReactSelect).attrs<ISelectProps>({})`
  width: 100%;

  ${({ theme }) => theme.fonts.defaultFontStyle};
  .react-select__control {
    background: ${({ theme }) => theme.colors.inputBackground};
    border-radius: 0;
    border: 0;
    box-shadow: none;
    font-size: 16px;
    border-bottom: solid 1px
      ${({ error, touched, theme }) =>
        error && touched ? theme.colors.error : theme.colors.disabled};
  }

  .react-select__option {
    color: ${({ theme }) => theme.colors.copy};
    font-size: 14px;
  }

  .react-select__control--is-focused {
    border: 0;
    border-bottom: solid 1px ${({ theme }) => theme.colors.accent};
  }
`
interface IState {
  selectedOption: ISelectOption
}

function getSelectedOption(
  value: string,
  options: ISelectOption[]
): ISelectOption | null {
  const selectedOption = options.find((x: ISelectOption) => x.value === value)
  if (selectedOption) {
    return selectedOption
  }

  return null
}
export class Select extends React.Component<
  ISelectProps & IReactSelectOverrides,
  IState
> {
  change = (selectedOption: ISelectOption) => {
    this.props.onChange(selectedOption.value)
  }
  render() {
    return (
      <StyledSelect
        classNamePrefix="react-select"
        {...this.props}
        onChange={this.change}
        value={getSelectedOption(this.props.value, this.props.options)}
      />
    )
  }
}
