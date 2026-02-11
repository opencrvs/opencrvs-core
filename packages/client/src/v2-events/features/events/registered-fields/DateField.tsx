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
import React, { useState, useRef, useEffect } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import { FormikProps } from 'formik'
import {
  DateField as DateFieldType,
  DatetimeValue,
  DateValue,
  EventState,
  SerializedNowDateTime
} from '@opencrvs/commons/client'
import { IDateFieldProps as DateFieldProps } from '@opencrvs/components/lib/DateField'
import { TextInput } from '@opencrvs/components/lib/TextInput'
import { useResolveDefaultValue } from '../useResolveDefaultValue'
import { StringifierContext } from './RegisteredField'

const messages = defineMessages({
  dateFormat: {
    defaultMessage: 'd MMMM y',
    id: 'configuration.dateFormat',
    description: 'Default format for date values'
  }
})

const EMPTY_DATE = '--'
const MAX_DAY_NUMBER = 31
const MAX_YEAR_NUMBER = 2100
const MAX_MONTH_NUMBER = 12

const DateWrapper = styled.div`
  width: 100%;
  display: flex;
  gap: 8px;
`

interface DateState {
  dd: string
  mm: string
  yyyy: string
}

const dateRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/

function isValidDateFormat(date: string): boolean {
  return dateRegex.test(date)
}

function resolveNowForDateInput(value: string | SerializedNowDateTime): string {
  if (SerializedNowDateTime.safeParse(value).success) {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
  }

  return value.toString()
}

function DateInput({
  onChange,
  value = '',
  setFieldTouched,
  ...props
  // @TODO CIHAN: dont rely on DateFieldProps
}: DateFieldProps & {
  onChange: (newValue: string) => void
  value: string | SerializedNowDateTime
  setFieldTouched: FormikProps<EventState>['setFieldTouched']
}) {
  const { meta, focusInput, disabled, ignorePlaceHolder, id, onBlur, name } =
    props

  // Ensure that 'now' is resolved to the current date and set in the form data.
  // Form values are updated in a single batched operation.
  // When multiple fields try to resolve `$$now` at the same time,
  // each calls `setValue`, but only the *last* update in the batch
  // is applied.
  //
  // Example:
  // applicant.dob = { $$now: true }, applicant.tob = "15:34"
  // applicant.dob = "1990-01-01", applicant.tob = { $$now: true }
  // → only one resolved field survives per render cycle.
  //
  // `useField` is used to get access to `helpers.setValue`, ensuring
  // the resolved value is written directly to Formik’s state rather
  // than relying on local `onChange`, which may be overwritten.
  const resolvedValue = useResolveDefaultValue({
    defaultValue: value,
    resolver: resolveNowForDateInput,
    fieldName: name
  })

  const dateSegmentVals = resolvedValue.split('-')
  const initialDate = {
    yyyy: dateSegmentVals[0] || '',
    mm: dateSegmentVals[1] || '',
    dd: dateSegmentVals[2] || ''
  }

  const [date, setDate] = useState<DateState>(initialDate)
  const prevDateRef = useRef<DateState>(initialDate)

  const ddRef = useRef<HTMLInputElement>(null)
  const mmRef = useRef<HTMLInputElement>(null)
  const yyyyRef = useRef<HTMLInputElement>(null)
  const { dd, mm, yyyy } = date

  useEffect(() => {
    /**
     * Component library returns '--' for empty dates when input has been touched.
     * We limit the behavior to this component, while still allowing partial values. (e.g. '2021-01-')
     */
    const cleanEmpty = (val: string) => (val === EMPTY_DATE ? '' : val)
    const cleanOnChange = (val: string) => onChange(cleanEmpty(val))

    const prevDate = prevDateRef.current
    const wasPrevDateValid = isValidDateFormat(
      `${prevDate.yyyy}-${prevDate.mm}-${prevDate.dd}`
    )
    const completeDate = `${date.yyyy}-${date.mm}-${date.dd}`
    const isNewDateValid = isValidDateFormat(completeDate)
    const dateValidityChanged = isNewDateValid !== wasPrevDateValid

    // Update the stored value and validate when the date changes from invalid to valid or vice versa
    if (dateValidityChanged) {
      cleanOnChange(completeDate)
      prevDateRef.current = date
      setFieldTouched(id, true, true)
      return
    }
  }, [date, onChange, onBlur, id, setFieldTouched])

  return (
    <DateWrapper id={id}>
      <TextInput
        {...props}
        ref={ddRef}
        data-testid={props['data-testid'] && `${props['data-testid']}-dd`}
        error={Boolean(meta && meta.error)}
        focusInput={focusInput}
        id={`${id}-dd`}
        isDisabled={disabled}
        max={MAX_DAY_NUMBER}
        min={1}
        placeholder={ignorePlaceHolder ? '' : 'dd'}
        touched={true}
        type="number"
        value={dd}
        onBlur={(e) => {
          const newDd = e.target.value
          // Set dd to the new value with leading 0 if needed
          setDate({ ...date, dd: newDd.length === 1 ? `0${newDd}` : newDd })
        }}
        onChange={({ target }) => {
          if (
            target.value.length > 2 ||
            Number(target.value) > MAX_DAY_NUMBER
          ) {
            return
          }

          // If we completely filled the day, focus the month input.
          if (target.value.length > 1 && mmRef.current) {
            mmRef.current.focus()
          }

          setDate({ ...date, dd: target.value })
        }}
        onWheel={(event) => event.currentTarget.blur()}
      />
      <TextInput
        {...props}
        ref={mmRef}
        data-testid={props['data-testid'] && `${props['data-testid']}-mm`}
        error={Boolean(meta && meta.error)}
        focusInput={false}
        id={`${id}-mm`}
        isDisabled={disabled}
        max={MAX_MONTH_NUMBER}
        maxLength={2}
        min={1}
        placeholder={ignorePlaceHolder ? '' : 'mm'}
        touched={true}
        type="number"
        value={mm}
        onBlur={(e) => {
          const newMm = e.target.value
          // Set mm to the new value with leading 0 if needed
          setDate({ ...date, mm: newMm.length === 1 ? `0${newMm}` : newMm })
        }}
        onChange={({ target }) => {
          if (
            target.value.length > 2 ||
            Number(target.value) > MAX_MONTH_NUMBER
          ) {
            return
          }

          // If we completely filled the month, focus the year input.
          if (target.value.length > 1 && yyyyRef.current) {
            yyyyRef.current.focus()
          }

          setDate({ ...date, mm: target.value })
        }}
        onWheel={(event) => event.currentTarget.blur()}
      />
      <TextInput
        {...props}
        ref={yyyyRef}
        data-testid={props['data-testid'] && `${props['data-testid']}-yyyy`}
        error={Boolean(meta && meta.error)}
        focusInput={false}
        id={`${id}-yyyy`}
        isDisabled={disabled}
        maxLength={4}
        placeholder={ignorePlaceHolder ? '' : 'yyyy'}
        touched={true}
        type="number"
        value={yyyy}
        onBlur={(e) => {
          const newYyyy = e.target.value
          setDate({ ...date, yyyy: newYyyy })
        }}
        onChange={({ target }) => {
          if (
            target.value.length > 4 ||
            Number(target.value) > MAX_YEAR_NUMBER
          ) {
            return
          }

          setDate({ ...date, yyyy: target.value })
        }}
        onWheel={(event) => event.currentTarget.blur()}
      />
    </DateWrapper>
  )
}

function DateOutput({ value }: { value?: string }) {
  const intl = useIntl()
  const parsed = DateValue.safeParse(value)

  if (parsed.success) {
    return format(
      new Date(parsed.data),
      intl.formatMessage(messages.dateFormat)
    )
  }

  return String(value ?? '')
}

function stringify(
  value: string | undefined,
  context: StringifierContext<DateFieldType>
) {
  // We should allow parsing valid datetimes into the configured date format.
  const parsed = DateValue.or(DatetimeValue).safeParse(value)

  if (parsed.success) {
    return format(
      new Date(parsed.data),
      context.intl.formatMessage(messages.dateFormat)
    )
  }

  return String(value ?? '')
}

export const DateField = {
  Input: DateInput,
  Output: DateOutput,
  stringify,
  toCertificateVariables: stringify
}
