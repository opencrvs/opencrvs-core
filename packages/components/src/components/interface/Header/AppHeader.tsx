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
