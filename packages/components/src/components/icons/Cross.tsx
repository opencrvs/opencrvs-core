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

export const Cross = (props: React.HTMLAttributes<SVGElement>) => {
  let fill: string
  switch (props.color) {
    case 'white':
      fill = 'white'
      break
    case 'currentColor':
      fill = 'currentColor'
      break
    case 'red':
      fill = '#D53F3F'
      break
    default:
      fill = '#4C68C1'
  }
  return (
    <svg width={24} height={24} fill="none" {...props}>
      <path
        d="M17.793 5.207a1 1 0 1 1 1.414 1.414L6.48 19.35a1 1 0 1 1-1.414-1.414L17.793 5.207z"
        fill={fill}
      />
      <path
        d="M4.793 5.207a1 1 0 0 1 1.414 0l12.728 12.728a1 1 0 1 1-1.414 1.414L4.793 6.621a1 1 0 0 1 0-1.414z"
        fill={fill}
      />
    </svg>
  )
}
