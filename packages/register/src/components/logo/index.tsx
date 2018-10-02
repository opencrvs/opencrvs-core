import * as React from 'react'

import logo from './OpenCRVSLogo.svg'
export interface ISpinner {
  className?: string
}

const Logo = ({ className }: ISpinner) => (
  <img className={className} src={logo} />
)

export default Logo
