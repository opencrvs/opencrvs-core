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
import { colors } from '../colors'

export const BRN = (props: React.HTMLAttributes<SVGElement>) => {
  const stroke = props.color ? props.color : colors.grey600
  return (
    <svg width={24} height={24} fill="none" {...props}>
      <path
        clipRule="evenodd"
        d="M12 15a7 7 0 100-14 7 7 0 000 14z"
        stroke={stroke}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12"
        stroke={stroke}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
