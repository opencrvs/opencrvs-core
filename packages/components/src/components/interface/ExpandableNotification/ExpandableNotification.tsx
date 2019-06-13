import * as React from 'react'
import styled from 'styled-components'
import { Button } from '../../buttons'
import { InvertSpinner } from '../InvertSpinner'
import { KeyboardArrowUp, KeyboardArrowDown, Outbox } from '../../icons'

export interface IState {
  expand: boolean
}

interface IProps {
  processingText: string
  outboxText: string
}
const NotificationBar = styled.div`
  padding: 8px 16px;
  height: 64px;
  align-items: center;
  width: 100%;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  color: ${({ theme }) => theme.colors.white};
  ${({ theme }) => theme.fonts.bodyStyle};
  background-color: ${({ theme }) => theme.colors.primary};
  ${({ theme }) => theme.shadows.thickShadow};
  z-index: 1;
  &:hover {
    ${({ theme }) => theme.gradients.gradientSkyDark};
  }
`
const ExpandableOverlay = styled.div.attrs<{ show: boolean }>({})`
  height: ${({ show }) => (show ? 'calc(100vh - 64px)' : 0)};
  background: ${({ theme }) => theme.colors.background};
  transition: all 0.3s ease;
`

const Left = styled.span`
  display: flex;
  align-items: center;
`
const Text = styled.span`
  margin-left: 16px;
`

export class ExpandableNotification extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)
    this.state = {
      expand: false
    }
  }
  handleClick = () => {
    this.setState(prev => ({
      expand: !prev.expand
    }))
  }
  render() {
    const { processingText, outboxText, children } = this.props
    return (
      <>
        <NotificationBar onClick={this.handleClick}>
          <Left>
            {this.state.expand ? (
              <>
                <Outbox />
                <Text>{outboxText}</Text>
              </>
            ) : (
              <>
                <InvertSpinner id="InvertSpinner" size="24px" />
                <Text>{processingText}</Text>
              </>
            )}
          </Left>
          <Button
            icon={() =>
              this.state.expand ? <KeyboardArrowDown /> : <KeyboardArrowUp />
            }
          />
        </NotificationBar>
        <ExpandableOverlay show={this.state.expand}>
          {children}
        </ExpandableOverlay>
      </>
    )
  }
}
