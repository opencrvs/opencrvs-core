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
import React, { useState, useRef, useEffect } from 'react'
import styled from 'styled-components'

interface IProps {
  id?: string
  onComplete: (pin: string) => void
  forgotPinComponent?: React.ReactNode
  pin?: string
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  outline: none;
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
  height: 40px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`
const MAX_PIN_LENGTH = 4

export const PINKeypad = ({
  pin: initialPin,
  onComplete,
  forgotPinComponent,
  ...props
}: IProps) => {
  const [pin, setPin] = useState(initialPin || '')
  const pinInput = useRef<HTMLInputElement>(null)

  const focusKeyInput = () => {
    pinInput.current?.focus()
  }

  useEffect(() => {
    focusKeyInput()
  }, [pin])

  const keyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const kc = e.keyCode
    if (kc === 8 || kc === 46) {
      // delete or backspace
      const newPinValue = pin.length ? pin.slice(0, pin.length - 1) : ''
      setPin(newPinValue)
    } else if (kc >= 48 && kc <= 57) {
      // '0' <= kc <= '9'
      if (pin.length <= 3) {
        const newPIN = pin + (kc - 48)
        if (newPIN.length === MAX_PIN_LENGTH) {
          onComplete(newPIN)
        }
        setPin(newPIN)
      }
    } else if (kc >= 96 && kc <= 105) {
      // numpad
      if (pin.length <= 3) {
        const newPIN = pin + (kc - 96)
        if (newPIN.length === MAX_PIN_LENGTH) {
          onComplete(newPIN)
        }
        setPin(newPIN)
      }
    }
  }

  const onBlur = () => {
    focusKeyInput()
  }

  return (
    <Container id="pin-keypad-container" tabIndex={0} {...props}>
      <DotsContainer>
        <StyledInput
          type="number"
          onKeyDown={keyDown}
          id="pin-input"
          ref={pinInput}
          onBlur={onBlur}
          autoFocus
        />
        <div
          onClick={() => {
            pinInput?.current?.focus()
          }}
        >
          {new Array(pin.length).fill('').map((_, i) => (
            <DotFilled key={`dot-filled-${i}`} />
          ))}
          {new Array(MAX_PIN_LENGTH - pin.length).fill('').map((_, i) => (
            <DotUnfilled key={`dot-unfilled-${i}`} />
          ))}
        </div>
        {forgotPinComponent}
      </DotsContainer>
    </Container>
  )
}
