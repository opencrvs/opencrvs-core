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
import * as React from 'react'
import styled from 'styled-components'
import { ITextInputProps, IRef, TextInput } from '../TextInput/TextInput'
import { ISelectProps, Select, ISelectOption } from '../Select/Select'

interface IProps {
  id: string
  disabled?: boolean
  meta?: { touched: boolean; error: string }
  focusInput?: boolean
  notice?: string
  value?: string
  ignorePlaceHolder?: boolean
  is12Hr?: boolean
  onChange: (dateString: string) => void
}

interface IState {
  hh: string
  mm: string
}

const Container = styled.div`
  width: 100%;
  display: flex;
  gap: 16px;
`

export type ITimeFieldAmPmProps = IProps &
  Omit<ITextInputProps, 'onChange' | 'value'> &
  Omit<ISelectProps, 'onChange' | 'value'>

function getFormattedValue(
  time: { hh: string; mm: string },
  is12Hr: boolean,
  amPm: string | null
) {
  const formattedHours = time.hh.padStart(2, '0')
  return is12Hr
    ? `${formattedHours}:${time.mm.padStart(2, '0')} ${amPm}`
    : `${formattedHours}:${time.mm.padStart(2, '0')}`
}

function isValidMinutes(minutes: string) {
  if (minutes.length !== 2) {
    return false
  }
  const parsed = Number(minutes)
  if (isNaN(parsed)) {
    return false
  }
  return parsed >= 0 && parsed <= 59
}

function isValidHours(hours: string, is12Hr: boolean) {
  if (hours.length !== 2) return false

  const parsed = Number(hours)

  if (isNaN(parsed)) return false

  return is12Hr ? parsed >= 1 && parsed <= 12 : parsed >= 0 && parsed <= 23
}

export function TimeFieldAmPm(props: ITimeFieldAmPmProps) {
  const {
    id,
    meta,
    focusInput,
    notice,
    ignorePlaceHolder,
    is12Hr = false,
    onChange,
    ...otherProps
  } = props

  const [state, setState] = React.useState({
    hh: '',
    mm: ''
  })

  const [amPm, setAmPm] = React.useState<string>(is12Hr ? 'AM' : '')

  React.useEffect(() => {
    function getInitialState(time: string): IState {
      const parts = time.split(/[:\s]/)

      const [hh, mm, meridiem] = parts.length === 3 ? parts : [...parts, null]

      if (is12Hr && meridiem) setAmPm(meridiem)

      return { hh: hh || '', mm: mm || '' }
    }

    const isValidTime = (time: string) => {
      const cleanTime = time.replace(/\s?(AM|PM)$/i, '')
      const parts = cleanTime.split(':')

      if (parts.length !== 2) return false

      return isValidHours(parts[0], is12Hr) && isValidMinutes(parts[1])
    }

    if (props.value && isValidTime(props.value)) {
      setState(getInitialState(props.value))
    }
  }, [props.value, is12Hr])

  const hh = React.useRef<IRef>(null)
  const mm = React.useRef<IRef>(null)

  function change(event: React.ChangeEvent<HTMLInputElement>) {
    const val = event.target.value
    if (event.target.id.includes('hh')) {
      if (is12Hr) {
        if (val === '00' || Number(val) < 0 || Number(val) > 12) return
      } else {
        if (Number(val) < 0 || Number(val) > 23) return
      }
      if (val.length === 2 && mm?.current !== null) {
        mm.current.focusField()
      }
      setState((state) => ({ ...state, hh: val }))
    } else if (event.target.id.includes('mm')) {
      if (Number(val) < 0 || Number(val) > 59 || val.length > 2) return
      setState((state) => ({ ...state, mm: val }))
    }
  }

  function padStart(part: 'hh' | 'mm') {
    return (event: React.FocusEvent<HTMLInputElement>) => {
      let val = event.target.value
      if (part === 'hh' && is12Hr && (!val || val === '0')) {
        val = '01'
      }
      const paddedValue = val.padStart(2, '0')

      setState((state) => ({ ...state, [part]: paddedValue }))
    }
  }

  React.useEffect(() => {
    if (isValidHours(state.hh, is12Hr) && isValidMinutes(state.mm)) {
      onChange(getFormattedValue(state, is12Hr, amPm))
    }
  }, [state, amPm, onChange, is12Hr])

  const amPmOptions: ISelectOption[] = [
    { value: 'AM', label: 'AM' },
    { value: 'PM', label: 'PM' }
  ]

  return (
    <Container id={id}>
      <TextInput
        {...otherProps}
        id={`${id}-hh`}
        ref={hh}
        error={Boolean(meta && meta.error)}
        isDisabled={props.disabled}
        touched={meta && meta.touched}
        focusInput={focusInput}
        type="number"
        placeholder={ignorePlaceHolder ? '' : 'hh'}
        min={is12Hr ? 1 : 0}
        max={is12Hr ? 12 : 23}
        value={state.hh}
        onChange={change}
        onBlur={padStart('hh')}
        onWheel={(event: React.WheelEvent<HTMLInputElement>) => {
          event.currentTarget.blur()
        }}
      />
      <TextInput
        {...otherProps}
        id={`${id}-mm`}
        ref={mm}
        error={Boolean(meta && meta.error)}
        isDisabled={props.disabled}
        touched={meta && meta.touched}
        focusInput={focusInput}
        type="number"
        placeholder={ignorePlaceHolder ? '' : 'mm'}
        min={0}
        max={59}
        value={state.mm}
        onChange={change}
        onBlur={padStart('mm')}
        onWheel={(event: React.WheelEvent<HTMLInputElement>) => {
          event.currentTarget.blur()
        }}
      />
      {is12Hr && (
        <Select
          {...props}
          id={`${id}-amPm`}
          error={Boolean(meta && meta.error)}
          touched={meta && meta.touched}
          focusInput={focusInput}
          placeholder={ignorePlaceHolder ? '' : 'mm'}
          options={amPmOptions}
          value={amPm}
          onChange={(value: string) => setAmPm(value)}
        />
      )}
    </Container>
  )
}
