import * as React from 'react'
import styled from 'styled-components'
import { Backspace } from '../icons/Backspace'

interface IProps {
  onComplete: (pin: string) => void
  pin?: string
}

interface IState {
  pin: string
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`

const DotFilled = styled.span`
  height: 18px;
  width: 18px;
  background-color: ${({ theme }) => theme.colors.accentLight};
  border-radius: 50%;
  display: inline-block;
  margin: 24px;
`

const DotUnfilled = styled.span`
  height: 18px;
  width: 18px;
  border: 2px solid ${({ theme }) => theme.colors.accentLight};
  border-radius: 50%;
  display: inline-block;
  margin: 24px;
`

const NumberContainer = styled.div`
  display: grid;
  grid-template-columns: auto auto auto;
`

const Key = styled.span`
  color: ${({ theme }) => theme.colors.white};
  font-size: 34px;
  font-family: ${({ theme }) => theme.fonts.boldFont};
  padding: 24px 48px;
  text-align: center;
`

export class PINKeypad extends React.Component<IProps, IState> {
  state = { pin: this.props.pin || '' }

  keyPress = (key: number) => {
    const { pin } = this.state

    if (key === -1) {
      this.setState({ pin: pin.slice(0, pin.length - 1) })
      return
    }

    if (pin.length === 4) {
      return
    }

    const newPIN = pin + key
    this.setState({ pin: newPIN })
  }

  render() {
    const { pin } = this.state
    const { onComplete } = this.props

    if (pin.length === 4) {
      // call onComplete after render so last dot shows as filled
      setImmediate(() => {
        onComplete(pin)
      })
    }

    return (
      <Container>
        <div>
          {new Array(pin.length).fill('').map((e, i) => (
            <DotFilled key={`dot-filled-${i}`} />
          ))}
          {new Array(4 - pin.length).fill('').map((e, i) => (
            <DotUnfilled key={`dot-unfilled-${i}`} />
          ))}
        </div>
        <NumberContainer>
          <Key
            id="keypad-1"
            onClick={() => {
              this.keyPress(1)
            }}
          >
            1
          </Key>
          <Key
            id="keypad-2"
            onClick={() => {
              this.keyPress(2)
            }}
          >
            2
          </Key>
          <Key
            id="keypad-3"
            onClick={() => {
              this.keyPress(3)
            }}
          >
            3
          </Key>
          <Key
            id="keypad-4"
            onClick={() => {
              this.keyPress(4)
            }}
          >
            4
          </Key>
          <Key
            id="keypad-5"
            onClick={() => {
              this.keyPress(5)
            }}
          >
            5
          </Key>
          <Key
            id="keypad-6"
            onClick={() => {
              this.keyPress(6)
            }}
          >
            6
          </Key>
          <Key
            id="keypad-7"
            onClick={() => {
              this.keyPress(7)
            }}
          >
            7
          </Key>
          <Key
            id="keypad-8"
            onClick={() => {
              this.keyPress(8)
            }}
          >
            8
          </Key>
          <Key
            id="keypad-9"
            onClick={() => {
              this.keyPress(9)
            }}
          >
            9
          </Key>
          <Key id="keypad-blank">&nbsp;</Key>
          <Key
            id="keypad-0"
            onClick={() => {
              this.keyPress(0)
            }}
          >
            0
          </Key>
          <Key
            id="keypad-backspace"
            onClick={() => {
              this.keyPress(-1)
            }}
          >
            <Backspace />
          </Key>
        </NumberContainer>
      </Container>
    )
  }
}
