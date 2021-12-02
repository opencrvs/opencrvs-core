/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import * as React from 'react'
import styled, { withTheme } from 'styled-components'
import { Button } from '../../buttons'
import { Spinner } from '../Spinner'
import { KeyboardArrowUp, KeyboardArrowDown, Outbox } from '../../icons'
import { colors } from '../../colors'
import { ITheme } from '../../theme'

export interface IState {
  expand: boolean
}

export interface IProps {
  processingText: string
  outboxText: string
  theme: ITheme
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
  z-index: 3;
  &:hover {
    ${({ theme }) => theme.gradients.gradientSkyDark};
  }
`
const ExpandableOverlay = styled.div<{ show: boolean }>`
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

class ExpandableNotificationComponent extends React.Component<IProps, IState> {
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
                <Spinner
                  id="Spinner"
                  size={24}
                  baseColor={this.props.theme.colors.background}
                />
                <Text>{processingText}</Text>
              </>
            )}
          </Left>
          <Button
            icon={() =>
              this.state.expand ? (
                <KeyboardArrowDown color={colors.white} />
              ) : (
                <KeyboardArrowUp color={colors.white} />
              )
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

// cast because of styled-components bug
// https://stackoverflow.com/questions/53724583/why-this-wrapped-styled-component-errors-has-no-properties-in-common-with/53902817#53902817
export const ExpandableNotification = (withTheme(
  ExpandableNotificationComponent
) as unknown) as React.ComponentClass<Omit<IProps, 'theme'>, IState>
