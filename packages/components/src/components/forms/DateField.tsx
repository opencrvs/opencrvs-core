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
import { ITextInputProps, IRef, TextInput } from './TextInput'
import { InputLabel } from './InputField/InputLabel'
import { Omit } from '../omit'

const DateWrapper = styled.div`
  width: 100%;
`
export const NoticeWrapper = styled.div`
  padding-bottom: 15px;
`
export interface IProps {
  id: string
  disabled?: boolean
  meta?: { touched: boolean; error: string }
  focusInput?: boolean
  notice?: string
  ignorePlaceHolder?: boolean
  onChange: (dateString: string) => void
}

export interface IState {
  dd: string
  mm: string
  yyyy: string
}

export type IDateFieldProps = IProps & Omit<ITextInputProps, 'onChange'>

const DateSegment = styled(TextInput)`
  width: 54px;
  margin: 0 4px;

  &:first-of-type {
    margin-left: 0;
  }
  &:last-of-type {
    margin-right: 0;
    width: 78px;
  }
`

export class DateField extends React.Component<IDateFieldProps, IState> {
  private dd: React.RefObject<IRef>
  private mm: React.RefObject<IRef>
  private yyyy: React.RefObject<IRef>

  constructor(props: IDateFieldProps) {
    super(props)
    this.dd = React.createRef()
    this.mm = React.createRef()
    this.yyyy = React.createRef()

    this.state = this.getInitialState()
  }

  componentDidUpdate(prevProps: IDateFieldProps) {
    if (this.props.value !== prevProps.value) {
      const state = this.getInitialState()
      this.setState(() => state)
    }
  }

  getInitialState() {
    if (this.props.value && typeof this.props.value === 'string') {
      const dateSegmentVals = this.props.value.split('-')
      return {
        yyyy: dateSegmentVals[0],
        mm: dateSegmentVals[1],
        dd: dateSegmentVals[2]
      }
    } else {
      return {
        yyyy: '',
        mm: '',
        dd: ''
      }
    }
  }

  change = (event: React.ChangeEvent<HTMLInputElement>) => {
    const segmentType = String(event.target.id.split('-').pop())
    const val = event.target.value

    if (['dd', 'mm', 'yyyy'].includes(segmentType)) {
      switch (segmentType) {
        case 'dd':
          if (val.length > 2 || Number(val) > 31) {
            return
          }
          if (val.length > 1 && this.mm.current) {
            this.mm.current.focusField()
          }
          break
        case 'mm':
          if (val.length > 2 || Number(val) > 12) {
            return
          }
          if (val.length > 1 && this.yyyy.current) {
            this.yyyy.current.focusField()
          }
          break
        case 'yyyy':
          if (
            val.length > 4 ||
            Number(val) > 2100 ||
            (val.length === 2 && Number(val) < 19)
          ) {
            return
          }
          break
      }

      this.setState(
        { [segmentType]: val } as Pick<IState, 'dd' | 'mm' | 'yyyy'>,
        () => {
          if (this.props.onChange) {
            if (
              this.state.yyyy === '' &&
              this.state.mm === '' &&
              this.state.dd === ''
            ) {
              this.props.onChange('')
            } else {
              this.props.onChange(
                `${this.state.yyyy}-${this.state.mm}-${this.state.dd}`
              )
            }
          }
        }
      )
    }
  }

  render() {
    const { id, meta, focusInput, notice, ignorePlaceHolder, ...props } =
      this.props

    return (
      <>
        <DateWrapper id={id}>
          {notice && (
            <NoticeWrapper>
              <InputLabel id={`${id}_notice`}>{notice}</InputLabel>
            </NoticeWrapper>
          )}
          <DateSegment
            {...props}
            id={`${id}-dd`}
            ref={this.dd}
            error={Boolean(meta && meta.error)}
            touched={meta && meta.touched}
            focusInput={focusInput}
            type="number"
            placeholder={ignorePlaceHolder ? '' : 'dd'}
            min={1}
            max={31}
            value={this.state.dd}
            onChange={this.change}
            onWheel={(event: React.WheelEvent<HTMLInputElement>) => {
              event.currentTarget.blur()
            }}
          />
          <DateSegment
            {...props}
            id={`${id}-mm`}
            ref={this.mm}
            error={Boolean(meta && meta.error)}
            touched={meta && meta.touched}
            focusInput={false}
            type="number"
            placeholder={ignorePlaceHolder ? '' : 'mm'}
            maxLength={2}
            min={1}
            max={12}
            value={this.state.mm}
            onChange={this.change}
            onWheel={(event: React.WheelEvent<HTMLInputElement>) => {
              event.currentTarget.blur()
            }}
          />
          <DateSegment
            {...props}
            id={`${id}-yyyy`}
            ref={this.yyyy}
            error={Boolean(meta && meta.error)}
            touched={meta && meta.touched}
            focusInput={false}
            type="number"
            placeholder={ignorePlaceHolder ? '' : 'yyyy'}
            maxLength={4}
            min={1900}
            value={this.state.yyyy}
            onChange={this.change}
            onWheel={(event: React.WheelEvent<HTMLInputElement>) => {
              event.currentTarget.blur()
            }}
          />
        </DateWrapper>
      </>
    )
  }
}
