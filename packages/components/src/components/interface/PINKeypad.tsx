import * as React from 'react'
import styled from 'styled-components'
import Backspace from '../icons/Backspace'

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
          {new Array(pin.length).fill('').map(() => (
            <DotFilled key={Math.random()} />
          ))}
          {new Array(4 - pin.length).fill('').map(() => (
            <DotUnfilled key={Math.random()} />
          ))}
        </div>
        <NumberContainer>
          <Key
            onClick={() => {
              this.keyPress(1)
            }}
          >
            1
          </Key>
          <Key
            onClick={() => {
              this.keyPress(2)
            }}
          >
            2
          </Key>
          <Key
            onClick={() => {
              this.keyPress(3)
            }}
          >
            3
          </Key>
          <Key
            onClick={() => {
              this.keyPress(4)
            }}
          >
            4
          </Key>
          <Key
            onClick={() => {
              this.keyPress(5)
            }}
          >
            5
          </Key>
          <Key
            onClick={() => {
              this.keyPress(6)
            }}
          >
            6
          </Key>
          <Key
            onClick={() => {
              this.keyPress(7)
            }}
          >
            7
          </Key>
          <Key
            onClick={() => {
              this.keyPress(8)
            }}
          >
            8
          </Key>
          <Key
            onClick={() => {
              this.keyPress(9)
            }}
          >
            9
          </Key>
          <Key>&nbsp;</Key>
          <Key
            onClick={() => {
              this.keyPress(0)
            }}
          >
            0
          </Key>
          <Key
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
