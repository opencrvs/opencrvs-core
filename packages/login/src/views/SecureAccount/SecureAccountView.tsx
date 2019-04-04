import * as React from 'react'
import { Shield } from '@opencrvs/components/lib/icons'
import styled from 'styled-components'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'

const SecurePageContainer = styled.div`
  font-family: ${({ theme }) => theme.fonts.lightFont};
  background: ${({ theme }) =>
    `linear-gradient(180deg, ${theme.colors.headerGradientDark} 0%, ${
      theme.colors.headerGradientLight
    } 100%)`};
  height: 100vh;
  text-align: center;
  color: ${({ theme }) => theme.colors.white};
`
const Wrapper = styled.div`
  width: 80%;
  margin: auto;
`
const Item = styled.div.attrs<{ margin?: string }>({})`
  margin: ${({ margin }) => margin || '0px'};
`
const PinButton = styled(PrimaryButton)`
  width: 100%;
  text-align: center;
  box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.16);
  display: block;
`

export class SecureAccount extends React.Component {
  render() {
    return (
      <SecurePageContainer>
        <Wrapper>
          <Item margin="50px 0px">
            <Shield />
          </Item>

          <Item margin="50px 0px">
            <b>Secure your Account</b>
            <p>
              A personal identification number protects your account. Your pin
              will be required before each use of the OpenCRVS app.
            </p>
          </Item>

          <Item>
            <PinButton id="createPinBtn">CREATE A PIN</PinButton>
          </Item>
        </Wrapper>
      </SecurePageContainer>
    )
  }
}
