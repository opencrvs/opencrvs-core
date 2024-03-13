/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import { Checkbox, DateField, Link } from '@client/../../components/lib'
import { IDateRangePickerValue } from '@client/forms'
import { buttonMessages, formMessages as messages } from '@client/i18n/messages'
import styled from 'styled-components'
import format from '@client/utils/date-formatting'
import startOfMonth from 'date-fns/startOfMonth'
import subYears from 'date-fns/subYears'
import * as React from 'react'
import { WrappedComponentProps, injectIntl } from 'react-intl'
import { DateRangePicker } from './DateRangePicker'
const { useState } = React

interface IDateRange {
  startDate?: Date
  endDate?: Date
}

interface IDateRangePickerProps extends WrappedComponentProps {
  value: IDateRangePickerValue
  onChange: (val: IDateRangePickerValue) => void
  notice?: string
  ignorePlaceHolder?: boolean
  inputProps: any
}

const DateRangePickerContainer = styled.div`
  display: flex column;
  width: 100%;
  ${({ theme }) => theme.fonts.bold14};
`

const DateRangeBody = styled.div`
  display: flex;
  gap: 15px;
  ${({ theme }) => theme.fonts.bold14};
  align-items: center;
  margin-top: 8px;
`

function DateRangePickerForFormFieldComponent(props: IDateRangePickerProps) {
  const { intl } = props
  const [modalVisible, setModalVisible] = useState<boolean>(false)

  const handleLinkOnClick = () => {
    setModalVisible(true)
  }

  const handleExactDateChange = (val: string) => {
    props.onChange({ ...props.value, exact: val })
  }

  const handleDateRangeChange = ({ startDate, endDate }: IDateRange) => {
    props.onChange({
      ...props.value,
      rangeStart: startDate?.toISOString(),
      rangeEnd: endDate?.toISOString(),
      isDateRangeActive: true
    })
  }

  const handleDateRangeActiveChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    props.onChange({
      ...props.value,
      isDateRangeActive: event.target.checked
    })
  }

  const formatDateRangeLabel = (
    rangeStart: string | undefined,
    rangeEnd: string | undefined
  ) => {
    if (!rangeStart || !rangeEnd) {
      return
    }
    const dateStartLocale =
      rangeStart && format(new Date(rangeStart), 'MMMM yyyy')
    const dateEndLocale = rangeEnd && format(new Date(rangeEnd), 'MMMM yyyy')

    return intl.formatMessage(messages.dateRangePickerCheckboxLabel, {
      rangeStart: dateStartLocale,
      rangeEnd: dateEndLocale
    })
  }

  const isValidDateRange =
    props.value.rangeStart !== undefined && props.value.rangeEnd !== undefined
  const dateRangeLabel =
    formatDateRangeLabel(props.value.rangeStart, props.value.rangeEnd) || ''

  const linkLabel = isValidDateRange
    ? intl.formatMessage(buttonMessages.edit)
    : intl.formatMessage(buttonMessages.exactDateUnknown)

  return (
    <DateRangePickerContainer>
      <DateField
        {...props.inputProps}
        id={props.inputProps.id + 'exact'}
        notice={props.notice}
        ignorePlaceHolder={props.ignorePlaceHolder}
        onChange={handleExactDateChange}
        value={props.value.exact as string}
        disabled={props.value.isDateRangeActive}
      />
      <DateRangeBody>
        {isValidDateRange && (
          <Checkbox
            name={props.inputProps.id + 'date_range_toggle'}
            label={dateRangeLabel || ''}
            value={''}
            selected={props.value.isDateRangeActive || false}
            onChange={handleDateRangeActiveChange}
          ></Checkbox>
        )}

        <Link
          id={props.inputProps.id + '-date_range_button'}
          onClick={handleLinkOnClick}
        >
          {linkLabel}
        </Link>
        {modalVisible && (
          <DateRangePicker
            startDate={
              (props.value.rangeStart && new Date(props.value.rangeStart)) ||
              startOfMonth(subYears(new Date(Date.now()), 1))
            }
            endDate={
              (props.value.rangeEnd && new Date(props.value.rangeEnd)) ||
              new Date(Date.now())
            }
            onDatesChange={handleDateRangeChange}
            closeModalFromHOC={() => setModalVisible(false)}
            usedInsideHOC={true}
          />
        )}
      </DateRangeBody>
    </DateRangePickerContainer>
  )
}

export const DateRangePickerForFormField = injectIntl(
  DateRangePickerForFormFieldComponent
)
