/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import * as React from 'react'
import Select, { components } from 'react-select'
import { ISelectOption } from '@opencrvs/components/lib/forms/Select'
import styled from '@client/styledComponents'
import { IndicatorProps } from 'react-select/lib/components/indicators'
import { KeyboardArrowDown } from '@opencrvs/components/lib/icons'

interface IOperationalSelectProps {
  id?: string
  value: string
  options: ISelectOption[]
  onChange?: (val: string) => void
}

const StyledSelect = styled(Select)`
  width: auto;

  .react-select__container {
    border-radius: 2px;
    ${({ theme }) => theme.fonts.bodyStyle};
  }

  .react-select__control {
    min-width: 136px;
    min-height: 36px;

    background-color: ${({ theme }) => theme.colors.secondary} !important;
    justify-content: center;
    ${({ theme }) => theme.fonts.smallButtonBoldStyle};
    border: none;
    &:hover {
      ${({ theme }) => theme.gradients.gradientBabyShade}
    }
  }

  .react-select__indicator {
    padding: 0 8px;
  }

  .react-select__indicator-separator {
    display: none;
  }

  .react-select__value-container {
    padding: 0 8px;
  }

  .react-select__single-value {
    margin: 0;
    color: ${({ theme }) => theme.colors.white};
  }
  .react-select__control--is-focused {
    background: ${({ theme }) => theme.colors.secondary};
    box-shadow: 0 0 0px 3px ${({ theme }) => theme.colors.focus};
  }
`

const DropdownIndicator = (props: IndicatorProps<ISelectOption>) => {
  return (
    components.DropdownIndicator && (
      <components.DropdownIndicator {...props}>
        <KeyboardArrowDown pathStroke="white" />
      </components.DropdownIndicator>
    )
  )
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

export function PerformanceSelect(props: IOperationalSelectProps) {
  function handleChange(item: ISelectOption) {
    if (props.onChange) {
      props.onChange(item.value)
    }
  }

  return (
    <StyledSelect
      id={props.id}
      isSearchable={false}
      value={getSelectedOption(props.value, props.options)}
      classNamePrefix="react-select"
      components={{ DropdownIndicator }}
      options={props.options}
      onChange={handleChange}
    />
  )
}
