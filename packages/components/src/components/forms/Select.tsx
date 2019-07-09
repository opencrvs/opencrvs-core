import * as React from 'react'
import { default as ReactSelect, components } from 'react-select'
import styled from 'styled-components'
import { Props } from 'react-select/lib/Select'
import { Omit } from '../omit'
import { ArrowDownBlue } from '../icons'
import { IndicatorProps } from 'react-select/lib/components/indicators'

export interface ISelectOption {
  value: string
  label: string
}

export interface IStyledSelectProps extends Props<ISelectOption> {
  id: string
  error?: boolean
  touched?: boolean
  hideBorder?: boolean
  options: ISelectOption[]
  ignoreMediaQuery?: boolean
  color?: string
  isSmallSized?: boolean
}

const DropdownIndicator = (props: IndicatorProps<ISelectOption>) => {
  return (
    components.DropdownIndicator && (
      <components.DropdownIndicator {...props}>
        <ArrowDownBlue />
      </components.DropdownIndicator>
    )
  )
}

const StyledSelect = styled(ReactSelect).attrs<IStyledSelectProps>({})`
  width: 100%;

  ${({ theme }) => theme.fonts.bodyStyle};
  .react-select__control {
    background: ${({ theme, color }) =>
      color ? color : theme.colors.background};
    border-radius: 0;
    height: 40px;
    box-shadow: none;
    ${({ theme }) => theme.fonts.bodyStyle};
    padding: 0 5px;
    border: solid ${({ hideBorder }) => (hideBorder ? '0px' : '2px')}
      ${({ error, touched, theme }) =>
        error && touched ? theme.colors.error : theme.colors.copy};
    &:hover {
      border: solid ${({ hideBorder }) => (hideBorder ? '0px' : '2px')}
        ${({ error, touched, theme }) =>
          error && touched ? theme.colors.error : theme.colors.copy};
    }
  }

  .react-select__option {
    color: ${({ theme }) => theme.colors.copy};
  }

  .react-select__indicator-separator {
    display: none;
  }

  .react-select__control--is-focused {
    box-shadow: 0 0 0px 3px ${({ theme }) => theme.colors.focus};
    border: solid ${({ hideBorder }) => (hideBorder ? '0px' : '2px')}
      ${({ theme }) => theme.colors.copy};
  }

  ${({ ignoreMediaQuery, isSmallSized, theme }) => {
    return !ignoreMediaQuery
      ? isSmallSized
        ? `@media (min-width: ${theme.grid.breakpoints.md}px) {
        width: 200px;
      }`
        : `@media (min-width: ${theme.grid.breakpoints.md}px) {
        width: 275px;
      }`
      : ''
  }}
`

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

export interface ISelectProps
  extends Omit<IStyledSelectProps, 'value' | 'onChange'> {
  onChange: (value: string) => void
  value: string
  color?: string
  isSmallSized?: boolean
}

export class Select extends React.Component<ISelectProps> {
  change = (selectedOption: ISelectOption) => {
    if (this.props.onChange) {
      this.props.onChange(selectedOption.value)
    }
  }
  render() {
    return (
      <StyledSelect
        classNamePrefix="react-select"
        components={{ DropdownIndicator }}
        {...this.props}
        onChange={this.change}
        value={getSelectedOption(this.props.value, this.props.options)}
      />
    )
  }
}
