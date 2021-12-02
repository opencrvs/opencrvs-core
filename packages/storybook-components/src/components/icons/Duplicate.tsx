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

export const Duplicate = (props: React.HTMLAttributes<SVGElement>) => (
  <svg width={34} height={20} {...props}>
    <g fill="none">
      <path
        d="M1 0h8.003L15 6.008V19a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V1a1 1 0 0 1 1-1z"
        fill="#EC9284"
      />
      <path fill="#D53F3F" d="M9 0l6 6H9z" />
      <path
        d="M20 0h8.003L34 6.008V19a1 1 0 0 1-1 1H20a1 1 0 0 1-1-1V1a1 1 0 0 1 1-1z"
        fill="#EC9284"
      />
      <path fill="#D53F3F" d="M28 0l6 6h-6z" />
    </g>
  </svg>
)
