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
import * as React from 'react'
import { colors } from '../colors'

export function Condition({
  color = 'primary',
  ...props
}: { color?: keyof typeof colors } & React.HTMLAttributes<SVGElement>) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M4.75 2.375V11.875"
        stroke={colors[color]}
        stroke-width="1.58333"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M14.25 7.125C15.5617 7.125 16.625 6.06168 16.625 4.75C16.625 3.43832 15.5617 2.375 14.25 2.375C12.9383 2.375 11.875 3.43832 11.875 4.75C11.875 6.06168 12.9383 7.125 14.25 7.125Z"
        stroke={colors[color]}
        stroke-width="1.58333"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M4.75 16.625C6.06168 16.625 7.125 15.5617 7.125 14.25C7.125 12.9383 6.06168 11.875 4.75 11.875C3.43832 11.875 2.375 12.9383 2.375 14.25C2.375 15.5617 3.43832 16.625 4.75 16.625Z"
        stroke={colors[color]}
        stroke-width="1.58333"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M14.25 7.125C14.25 9.01467 13.4993 10.8269 12.1631 12.1631C10.8269 13.4993 9.01467 14.25 7.125 14.25"
        stroke={colors[color]}
        stroke-width="1.58333"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  )
}
