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
import styled from 'styled-components'
import { ITextInputProps, IRef, TextInput } from '../TextInput/TextInput'

interface IProps {
  id: string
  disabled?: boolean
  meta?: { touched: boolean; error: string }
  focusInput?: boolean
  notice?: string
  ignorePlaceHolder?: boolean
  onChange: (dateString: string) => void
}

interface IState {
  hh: string
  mm: string
}

const Container = styled.div`
  width: 100%;
`
const Segment = styled(TextInput)`
  width: 54px !important;
  margin: 0 4px;

  &:first-of-type {
    margin-left: 0;
  }
  &:last-of-type {
    margin-right: 0;
  }
`

export type ITimeFieldProps = IProps & Omit<ITextInputProps, 'onChange'>

export function TimeField(props: ITimeFieldProps) {
  const { id, meta, focusInput, notice, ignorePlaceHolder, ...otherProps } =
    props
  function getInitialState(): IState {
    if (props.value && typeof props.value === 'string') {
      const dateSegmentVals = props.value.split('-')
      return {
        hh: dateSegmentVals[0],
        mm: dateSegmentVals[1]
      }
    } else {
      return {
        hh: '',
        mm: ''
      }
    }
  }
  const [state, setState] = React.useState(getInitialState())
  const hh = React.useRef<IRef>(null)
  const mm = React.useRef<IRef>(null)
  function change(event: React.ChangeEvent<HTMLInputElement>) {
    const val = event.target.value
    if (event.target.id.includes('hh')) {
      if (Number(val) < 0 && Number(val) > 23) return
      if (val.length > 2 && mm?.current !== null) {
        mm.current.focusField()
      }
      setState((state) => ({ ...state, hh: val }))
    } else if (event.target.id.includes('mm')) {
      if (Number(val) < 0 && Number(val) > 59) return
      setState((state) => ({ ...state, mm: val }))
    }
    if (state.hh && state.mm) {
      props.onChange(`${state.hh}-${state.mm}`)
    }
  }
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
        onWheel={(event: React.WheelEvent<HTMLInputElement>) => {
          event.currentTarget.blur()
        }}
      />
    </Container>
  )
}
