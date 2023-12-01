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

export const Backspace = (props: React.HTMLAttributes<SVGElement>) => (
  <svg width={34} height={21} fill="none" {...props}>
    <path
      d="M1 11l8.707 8.707a1 1 0 0 0 .707.293H32.5V1H10.445a1 1 0 0 0-.743.331L1 11z"
      stroke="#fff"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M23.728 4.893a.748.748 0 1 1 1.057 1.057l-9.516 9.516a.748.748 0 0 1-1.057-1.057l9.516-9.516z"
      fill="#fff"
    />
    <path
      d="M14.008 4.893a.748.748 0 0 1 1.057 0l9.516 9.516a.748.748 0 0 1-1.057 1.057L14.008 5.95a.748.748 0 0 1 0-1.057z"
      fill="#fff"
    />
  </svg>
)
