import * as React from 'react'
import { PINKeypad } from '@opencrvs/components/lib/interface'

export class Unlock extends React.Component {
  render() {
    return (
      <>
        <PINKeypad
          onComplete={(pin: string) => alert(`The entered PIN is: ${pin}`)}
        />
      </>
    )
  }
}
