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

export const DraftSimple = (props: React.HTMLAttributes<SVGElement>) => (
  <svg width={16} height={20} {...props}>
    <title>{'Group 6'}</title>
    <g fill="#35495D" fillRule="nonzero">
      <g transform="rotate(90 4 8.5)">
        <rect width={2} height={9} rx={1} />
        <rect x={4} width={2} height={9} rx={1} />
        <rect x={8} y={4} width={2} height={5} rx={1} />
      </g>
      <rect width={16} height={2} rx={1} />
      <path d="M2 18h12V1a1 1 0 0 1 2 0v18a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V1a1 1 0 1 1 2 0v17z" />
    </g>
  </svg>
)
