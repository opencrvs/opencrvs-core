import * as React from 'react'
import styled from 'styled-components'
import { Button } from '../../buttons'
import { InvertSpinner } from '../InvertSpinner'
import { KeyboardArrowUp, KeyboardArrowDown, Outbox } from '../../icons'

export interface IState {
  expand: boolean
}

interface IProps {
  processing: number
  total: number
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
  & > svg {
    margin: 16px;
  }
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
    return (
      <>
        <NotificationBar onClick={this.handleClick}>
          <Left>
            {this.state.expand ? (
              <>
                <Outbox />
                <span>Outbox({this.props.total})</span>
              </>
            ) : (
              <>
                <Spinner id="InvertSpinner" size="24px" />
                <span> {this.props.processing} application processing...</span>
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
          {this.props.children}
        </ExpandableOverlay>
      </>
    )
  }
}

const Spinner = styled(InvertSpinner)`
  margin-right: 16px;
`
