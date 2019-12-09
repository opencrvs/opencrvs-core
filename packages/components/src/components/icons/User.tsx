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

export const User = (props: React.HTMLAttributes<SVGElement>) => {
  const stroke = props.color === 'invert' ? 'white' : '#35495D'
  return (
    <svg width={24} height={24} fill="none" {...props}>
      <path
        stroke={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"
      />
      <path
        stroke={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M12 11a4 4 0 100-8 4 4 0 000 8z"
        clipRule="evenodd"
      />
    </svg>
  )
}
