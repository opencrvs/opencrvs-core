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
import { defineMessages, useIntl } from 'react-intl'
import { useState } from 'react'
import styled from 'styled-components'

import startOfMonth from 'date-fns/startOfMonth'
import subYears from 'date-fns/subYears'
import { DateKind, DateValue } from '@opencrvs/commons/client'
import {
  DateField as DateFieldComponent,
  IDateFieldProps as DateFieldProps
} from '@opencrvs/components/lib/DateField'
import { Checkbox, Link } from '@opencrvs/components'
import { SearchKey } from '@client/v2-events/features/events/AdvancedSearch/utils'
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

interface IDateRangeValue {
  startDate?: string
  endDate?: string
}

const messages = defineMessages({
  dateFormat: {
    defaultMessage: 'd MMMM y',
    id: 'v2.configuration.dateFormat',
    description: 'Default format for date values'
  },
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

function DateInput({
  onChange,
  value = '',
  kind = SearchKey.EXACT,
  ...props
}: DateFieldProps & {
  onChange: (newValue: string | Partial<IDateRangeValue>) => void
  value: string | IDateRangeValue
  kind: DateKind
}) {
  const intl = useIntl()
  const [dateValue, setDateValue] = useState<IDateRangePickerValue>({
    exact: value && typeof value === 'string' ? value : '',
    isDateRangeActive: false,
    rangeEnd: value && typeof value !== 'string' ? value.endDate : '',
    rangeStart: value && typeof value !== 'string' ? value.startDate : ''
  })
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
    onChange({
      startDate: startDate?.toISOString(),
      endDate: endDate?.toISOString()
    })
    setDateValue({
      ...dateValue,
      rangeStart: startDate?.toISOString(),
      rangeEnd: endDate?.toISOString(),
      isDateRangeActive: true
    })
  }

  const handleDateRangeActiveChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setDateValue({ ...dateValue, isDateRangeActive: event.target.checked })
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

  const dateRangeLabel =
    formatDateRangeLabel(dateValue.rangeStart, dateValue.rangeEnd) ||
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

      {kind === SearchKey.RANGE && (
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
      )}
    </DateRangePickerContainer>
  )
}

function DateOutput({ value }: { value?: string }) {
  const intl = useIntl()
  const parsed = DateValue.safeParse(value)

  if (parsed.success && typeof parsed.data === 'string') {
    return format(
      new Date(parsed.data),
      intl.formatMessage(messages.dateFormat)
    )
  }

  return value ?? ''
}

export const DateField = {
  Input: DateInput,
  Output: DateOutput
}
