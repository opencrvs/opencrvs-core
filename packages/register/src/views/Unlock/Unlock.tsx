import * as React from 'react'
import { PINKeypad } from '@opencrvs/components/lib/interface'
import { Logo } from '@opencrvs/components/lib/icons'
import styled from 'styled-components'

const PageWrapper = styled.div`
  background: ${({ theme }) =>
    `linear-gradient(180deg, ${theme.colors.headerGradientDark} 0%, ${
      theme.colors.headerGradientLight
    } 100%);`};
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`
export class Unlock extends React.Component {
  render() {
    return (
      <PageWrapper>
        <Logo />
        <PINKeypad
          onComplete={(pin: string) => alert(`The entered PIN is: ${pin}`)}
        />
      </PageWrapper>
    )
  }
}
