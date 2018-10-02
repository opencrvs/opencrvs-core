import * as React from 'react'

import logo from './opencrvs_logo.svg'
export interface ISpinner {
  className?: string
}

const Logo = ({ className }: ISpinner) => (
  <img className={className} src={logo} />
)

export default Logo
