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

export interface IProps {
  id: string
  disabled?: boolean
  meta?: { touched: boolean; error: string }
  focusInput?: boolean
  notice?: string
  value?: string
  ignorePlaceHolder?: boolean
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
const Segment = styled(TextInput)`
  width: 100%;
`

export type ITimeFieldProps = IProps &
  Omit<ITextInputProps, 'onChange' | 'value'>

function getFormattedValue(time: { hh: string; mm: string }) {
  return `${time.hh.padStart(2, '0')}:${time.mm.padStart(2, '0')}`
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

function isValidHours(hours: string) {
  if (hours.length !== 2) {
    return false
  }
  const parsed = Number(hours)
  if (isNaN(parsed)) {
    return false
  }
  return parsed >= 0 && parsed <= 23
}

export function TimeField(props: ITimeFieldProps) {
  const {
    id,
    meta,
    focusInput,
    notice,
    ignorePlaceHolder,
    onChange,
    ...otherProps
  } = props

  const [state, setState] = React.useState({
    hh: '',
    mm: ''
  })

  React.useEffect(() => {
    function getInitialState(time: string): IState {
      const dateSegmentVals = time.split(':')
      return {
        hh: dateSegmentVals[0],
        mm: dateSegmentVals[1]
      }
    }

    const isValidTime = (time: string) => {
      const parts = time.split(':')

      if (parts.length !== 2) {
        return false
      }

      return isValidHours(parts[0]) && isValidMinutes(parts[1])
    }

    if (props.value && isValidTime(props.value)) {
      setState(getInitialState(props.value))
    }
  }, [props.value])

  const hh = React.useRef<IRef>(null)
  const mm = React.useRef<IRef>(null)

  function change(event: React.ChangeEvent<HTMLInputElement>) {
    const val = event.target.value
    if (event.target.id.includes('hh')) {
      if (Number(val) < 0 || Number(val) > 23) return
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
      const val = event.target.value
      if (part === 'hh') {
        setState((state) => ({ ...state, hh: val.padStart(2, '0') }))
      } else if (part === 'mm') {
        setState((state) => ({ ...state, mm: val.padStart(2, '0') }))
      }
    }
  }

  React.useEffect(() => {
    if (isValidHours(state.hh) && isValidMinutes(state.mm)) {
      onChange(getFormattedValue(state))
    }
  }, [state, onChange])

  return (
    <Container id={id}>
      <Segment
        {...otherProps}
        id={`${id}-hh`}
        ref={hh}
        error={Boolean(meta && meta.error)}
        isDisabled={props.disabled}
        touched={meta && meta.touched}
        focusInput={focusInput}
        type="number"
        placeholder={ignorePlaceHolder ? '' : 'hh'}
        min={1}
        max={31}
        value={state.hh}
        onChange={change}
        onBlur={padStart('hh')}
        onWheel={(event: React.WheelEvent<HTMLInputElement>) => {
          event.currentTarget.blur()
        }}
      />
      <Segment
        {...otherProps}
        id={`${id}-mm`}
        ref={mm}
        error={Boolean(meta && meta.error)}
        isDisabled={props.disabled}
        touched={meta && meta.touched}
        focusInput={focusInput}
        type="number"
        placeholder={ignorePlaceHolder ? '' : 'mm'}
        min={1}
        max={31}
        value={state.mm}
        onChange={change}
        onBlur={padStart('mm')}
        onWheel={(event: React.WheelEvent<HTMLInputElement>) => {
          event.currentTarget.blur()
        }}
      />
    </Container>
  )
}
