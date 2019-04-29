import * as React from 'react'
import { Shield } from '@opencrvs/components/lib/icons'
import styled from 'styledComponents'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'
import { CreatePin } from 'views/PIN/CreatePin'

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
const Bold = styled.b`
  font-family: ${({ theme }) => theme.fonts.boldFont};
`

export class SecureAccount extends React.Component<{ onComplete: () => void }> {
  state = {
    collectPin: false
  }
  render() {
    return (
      (!this.state.collectPin && (
        <SecurePageContainer>
          <Wrapper>
            <Item margin="50px 0px">
              <Shield />
            </Item>

            <Item margin="50px 0px">
              <Bold>Secure your Account</Bold>
              <p>
                A personal identification number protects your account. Your pin
                will be required before each use of the OpenCRVS app.
              </p>
            </Item>

            <Item>
              <PinButton
                id="createPinBtn"
                onClick={() => this.setState({ collectPin: true })}
              >
                CREATE A PIN
              </PinButton>
            </Item>
          </Wrapper>
        </SecurePageContainer>
      )) || <CreatePin onComplete={this.props.onComplete} />
    )
  }
}
