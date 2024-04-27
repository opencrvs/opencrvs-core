/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import React from 'react'
import { DesktopHeader, IDesktopHeaderProps } from './Desktop/DesktopHeader'
import { grid } from '../grid'
import { MobileHeader, IMobileHeaderProps } from './Mobile/MobileHeader'
import { useWindowWidth } from '@client/hooks/useWindowWidth'

export interface IDomProps {
  id?: string
  className?: string
}

type IProps = IMobileHeaderProps & IDesktopHeaderProps & IDomProps

export const AppHeader = (props: IProps) => {
  const width = useWindowWidth()

  if (width > grid.breakpoints.lg) {
    return <DesktopHeader {...props} />
  }

  return <MobileHeader {...props} />
}
