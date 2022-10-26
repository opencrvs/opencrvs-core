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
import React from 'react'
import styled from 'styled-components'

const Logo = styled.img<{ size: ISize }>`
  max-height: ${({ size }) => (size === 'small' ? 96 : 120)}px;
`

type ISize = 'small' | 'medium'

export function CountryLogo({
  size = 'medium',
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement> & { size?: ISize }) {
  return <Logo alt="country-logo" size={size} {...props} />
}
