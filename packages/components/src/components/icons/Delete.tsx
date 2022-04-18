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

export const Delete = (props: React.HTMLAttributes<SVGElement>) => (
  <svg width={16} height={20} {...props}>
    <g fill={props.color || '#D53F3F'} fillRule="nonzero" opacity={0.9}>
      <rect x={5} y={7} width={2} height={9} rx={1} />
      <rect x={9} y={7} width={2} height={9} rx={1} />
      <path d="M7 0h2a2 2 0 0 1 2 2H5a2 2 0 0 1 2-2z" />
      <rect y={2} width={16} height={2} rx={1} />
      <path d="M2 18h12V6a1 1 0 0 1 2 0v13a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V6a1 1 0 1 1 2 0v12z" />
    </g>
  </svg>
)
