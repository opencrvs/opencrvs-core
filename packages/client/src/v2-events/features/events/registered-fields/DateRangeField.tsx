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

import format from 'date-fns/format'
import * as React from 'react'
import { defineMessages, IntlShape, useIntl } from 'react-intl'
import { useState } from 'react'
import styled from 'styled-components'

import startOfMonth from 'date-fns/startOfMonth'
import subYears from 'date-fns/subYears'
import { isDate } from 'lodash'
import { DateRangeFieldValue, DateValue } from '@opencrvs/commons/client'
import {
  DateField as DateFieldComponent,
  IDateFieldProps as DateFieldProps
} from '@opencrvs/components/lib/DateField'
import { Checkbox, Link } from '@opencrvs/components'
import { DateRangePicker } from '@client/components/DateRangePicker'

export interface IDateRangePickerValue {
  exact?: string
  rangeStart?: string
  rangeEnd?: string
  isDateRangeActive?: boolean
}
interface IDateRange {
  startDate?: Date
  endDate?: Date
}

interface IDateRangeFieldValue {
  rangeStart?: string
  rangeEnd?: string
}

const messages = defineMessages({
  dateRangePickerCheckboxLabel: {
    defaultMessage: '{rangeStart} to {rangeEnd}',
    description: 'Label for daterange picker checkbox',
    id: 'form.field.dateRangepicker.checkbox.dateLabel'
  },
  exactDateUnknown: {
    id: 'buttons.exactDateUnknown',
    defaultMessage: 'Exact date unknown',
    description:
      'Label for DateRangePickerForFormField components daterangepicker toggle button'
  },
  edit: {
    defaultMessage: 'Edit',
    description: 'Edit button text',
    id: 'buttons.edit'
  }
})

const DateRangePickerContainer = styled.div`
  display: flex column;
  width: 100%;
  ${({ theme }) => theme.fonts.bold14};
`

const DateRangeBody = styled.div`
  display: flex;
  justify-content: space-between;
  ${({ theme }) => theme.fonts.bold14};
  align-items: center;
  margin-top: 8px;
`

const NoShrinkLink = styled(Link)`
  flex-shrink: 0;
`

const EMPTY_DATE = '--'

function formatDateRangeLabel(
  intl: IntlShape,
  rangeStart: string | undefined,
  rangeEnd: string | undefined
) {
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

function extractDateValueFromProps(value?: DateRangeFieldValue) {
  const dateValue = DateRangeFieldValue.safeParse(value)
  if (dateValue.success) {
    if (Array.isArray(dateValue.data)) {
      const [rangeStart, rangeEnd] = dateValue.data
      return { exact: '', rangeStart, rangeEnd, isDateRangeActive: true }
    }
    return {
      exact: dateValue.data,
      rangeStart: undefined,
      rangeEnd: undefined,
      isDateRangeActive: false
    }
  }
  return {
    exact: '',
    rangeStart: undefined,
    rangeEnd: undefined,
    isDateRangeActive: false
  }
}

function DateRangeInput({
  onChange,
  value,
  ...props
}: DateFieldProps & {
  onChange: (newValue: DateRangeFieldValue) => void
  value?: DateRangeFieldValue
}) {
  const intl = useIntl()
  const [dateValue, setDateValue] = useState<IDateRangePickerValue>(
    extractDateValueFromProps(value)
  )
  /**
   * Component library returns '--' for empty dates when input has been touched.
   * We limit the behavior to this component, while still allowing partial values. (e.g. '2021-01-')
   */
  const cleanEmpty = (val: string) => (val === EMPTY_DATE ? '' : val)
  const cleanOnChange = (val: string) => onChange(cleanEmpty(val))
  const [modalVisible, setModalVisible] = useState<boolean>(false)

  const handleLinkOnClick = () => {
    setModalVisible(true)
  }

  const handleExactDateChange = (val: string) => {
    cleanOnChange(val)
    setDateValue({ ...dateValue, exact: val })
  }

  const handleDateRangeChange = ({ startDate, endDate }: IDateRange) => {
    const rangeStart = startDate && format(new Date(startDate), 'yyyy-MM-dd')
    const rangeEnd = endDate && format(new Date(endDate), 'yyyy-MM-dd')
    if (rangeStart && rangeEnd) {
      onChange([rangeStart, rangeEnd])
      setDateValue((d) => ({
        ...d,
        rangeStart,
        rangeEnd,
        isDateRangeActive: true
      }))
    }
  }

  const handleDateRangeActiveChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setDateValue((d) => ({
      ...d,
      isDateRangeActive: event.target.checked
    }))
  }

  const dateRangeLabel =
    formatDateRangeLabel(intl, dateValue.rangeStart, dateValue.rangeEnd) ||
    intl.formatMessage(messages.exactDateUnknown)

  return (
    <DateRangePickerContainer>
      <DateFieldComponent
        {...props}
        data-testid={`${props.id}`}
        disabled={dateValue.isDateRangeActive}
        value={dateValue.exact}
        onBlur={(e) => {
          const segmentType = String(e.target.id.split('-').pop())
          const val = e.target.value
          const dateSegmentVals = dateValue.exact
            ? dateValue.exact.split('-')
            : val

          // Add possibly missing leading 0 for days and months
          if (segmentType === 'dd' && val.length === 1) {
            cleanOnChange(`${dateSegmentVals[0]}-${dateSegmentVals[1]}-0${val}`)
          }

          if (segmentType === 'mm' && val.length === 1) {
            cleanOnChange(`${dateSegmentVals[0]}-0${val}-${dateSegmentVals[2]}`)
          }

          return props.onBlur && props.onBlur(e)
        }}
        onChange={handleExactDateChange}
      />

      <DateRangeBody>
        {dateValue.isDateRangeActive && (
          <Checkbox
            label={dateRangeLabel || ''}
            name={props.id + 'date_range_toggle'}
            selected={dateValue.isDateRangeActive}
            value={''}
            onChange={handleDateRangeActiveChange}
          />
        )}

        <NoShrinkLink
          id={props.id + '-date_range_button'}
          onClick={handleLinkOnClick}
        >
          {dateValue.isDateRangeActive
            ? intl.formatMessage(messages.edit)
            : intl.formatMessage(messages.exactDateUnknown)}
        </NoShrinkLink>

        {modalVisible && (
          <DateRangePicker
            closeModalFromHOC={() => setModalVisible(false)}
            endDate={
              (dateValue.rangeEnd && new Date(dateValue.rangeEnd)) ||
              new Date(Date.now())
            }
            startDate={
              (dateValue.rangeStart && new Date(dateValue.rangeStart)) ||
              startOfMonth(subYears(new Date(Date.now()), 1))
            }
            usedInsideHOC={true}
            onDatesChange={handleDateRangeChange}
          />
        )}
      </DateRangeBody>
    </DateRangePickerContainer>
  )
}

function DateRangeOutput({ value }: { value?: string }) {
  const intl = useIntl()
  const parsed = DateRangeFieldValue.safeParse(value)

  if (parsed.success) {
    if (Array.isArray(parsed.data)) {
      const dateRangeLabel =
        formatDateRangeLabel(intl, parsed.data[0], parsed.data[1]) ||
        intl.formatMessage(messages.exactDateUnknown)

      return dateRangeLabel
    }
    if (typeof parsed.data === 'string') {
      return parsed.data
    }
  }

  return value ?? ''
}

export const DateRangeField = {
  Input: DateRangeInput,
  Output: DateRangeOutput
}
