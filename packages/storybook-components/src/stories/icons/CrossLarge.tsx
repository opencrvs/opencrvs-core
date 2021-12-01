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

export const CrossLarge = (props: React.HTMLAttributes<SVGElement>) => (
  <svg width={20} height={20} {...props}>
    <g transform="rotate(-45 8.194 14.284)" fill="#FFF" fillRule="nonzero">
      <rect x={11} width={3} height={25} rx={1.5} />
      <rect
        transform="rotate(90 12.5 12.5)"
        x={11}
        width={3}
        height={25}
        rx={1.5}
      />
    </g>
  </svg>
)
