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
import React from 'react'
import styled from 'styled-components'

interface IProps {
  id?: string
  onComplete: (pin: string) => void
  forgotPinComponent?: React.ReactNode
  pin?: string
}

interface IState {
  pin: string
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  outline: none;
  margin-top: 32px;
`
const StyledInput = styled.input`
  position: absolute;
  opacity: 0;
`

const DotFilled = styled.span`
  height: 18px;
  width: 18px;
  background-color: ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
  display: inline-block;
  margin: 0 8px;
`

const DotUnfilled = styled.span`
  height: 18px;
  width: 18px;
  border: 2px solid ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
  display: inline-block;
  margin: 0 8px;
`
const DotsContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
`

export class PINKeypad extends React.Component<IProps, IState> {
  state = { pin: this.props.pin || '' }
  pinInput: React.RefObject<HTMLInputElement> = React.createRef()

  componentDidMount() {
    this.focusKeyInput()
  }

  focusKeyInput = () => {
    this.pinInput?.current?.focus()
  }
  componentDidUpdate = () => this.focusKeyInput()

  keyPress = (key: number) => {
    const { pin } = this.state
    const { onComplete } = this.props

    if (key === -1) {
      this.setState({ pin: pin.slice(0, pin.length - 1) })
      return
    }

    if (pin.length === 4) {
      return
    }

    const newPIN = pin + key
    this.setState({ pin: newPIN }, () => {
      if (newPIN.length === 4) {
        onComplete(newPIN)
      }
    })
  }

  keyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const { pin } = this.state
    const { onComplete } = this.props
    const kc = e.keyCode
    if (kc === 8 || kc === 46) {
      // delete or backspace
      this.setState({ pin: pin.length ? pin.slice(0, pin.length - 1) : '' })
    } else if (kc >= 48 && kc <= 57) {
      // '0' <= kc <= '9'
      if (pin.length <= 3) {
        const newPIN = pin + (kc - 48)
        if (newPIN.length === 4) {
          onComplete(newPIN)
        }
        this.setState({ pin: newPIN })
      }
    } else if (kc >= 96 && kc <= 105) {
      // numpad
      if (pin.length <= 3) {
        const newPIN = pin + (kc - 96)
        if (newPIN.length === 4) {
          onComplete(newPIN)
        }
        this.setState({ pin: newPIN })
      }
    }
  }

  onBlur = () => {
    this.focusKeyInput()
  }

  render() {
    const { pin } = this.state
    const { onComplete, ...props } = this.props
    return (
      <Container id="pin-keypad-container" tabIndex={0} {...props}>
        <DotsContainer>
          <StyledInput
            type="number"
            onKeyDown={this.keyDown}
            id="pin-input"
            ref={this.pinInput}
            onBlur={this.onBlur}
            autoFocus
          />
          <div
            onClick={() => {
              this.pinInput?.current?.focus()
            }}
          >
            {new Array(pin.length).fill('').map((_, i) => (
              <DotFilled key={`dot-filled-${i}`} />
            ))}
            {new Array(4 - pin.length).fill('').map((_, i) => (
              <DotUnfilled key={`dot-unfilled-${i}`} />
            ))}
          </div>
          {this.props.forgotPinComponent}
        </DotsContainer>
      </Container>
    )
  }
}
