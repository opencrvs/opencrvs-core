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
import { DesktopHeader, IDesktopHeaderProps } from './Desktop/DesktopHeader'
import { grid } from '../../grid'
import { MobileHeader, IMobileHeaderProps } from './Mobile/MobileHeader'

type IProps = IMobileHeaderProps & IDesktopHeaderProps

interface IState {
  width: number
}

export class AppHeader extends React.Component<IProps, IState> {
  state = {
    width: window.innerWidth
  }

  componentDidMount() {
    window.addEventListener('resize', this.recordWindowWidth)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.recordWindowWidth)
  }

  recordWindowWidth = () => {
    this.setState({ width: window.innerWidth })
  }

  render() {
    const mobileHeaderProps: IMobileHeaderProps = this
      .props as IMobileHeaderProps
    const desktopHeaderProps: IDesktopHeaderProps = this
      .props as IDesktopHeaderProps

    if (this.state.width > grid.breakpoints.lg) {
      return <DesktopHeader {...desktopHeaderProps} />
    } else {
      return <MobileHeader {...mobileHeaderProps} />
    }
  }
}
