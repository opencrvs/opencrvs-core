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

export const Avatar = (props: React.HTMLAttributes<SVGElement>) => (
  <svg width={64} height={64} fill="none" {...props}>
    <mask
      id="prefix__a"
      maskUnits="userSpaceOnUse"
      x={0}
      y={0}
      width={64}
      height={64}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M32 64c17.673 0 32-14.327 32-32C64 14.327 49.673 0 32 0 14.327 0 0 14.327 0 32c0 17.673 14.327 32 32 32z"
        fill="#fff"
      />
    </mask>
    <g mask="url(#prefix__a)">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M32 64c17.673 0 32-14.327 32-32C64 14.327 49.673 0 32 0 14.327 0 0 14.327 0 32c0 17.673 14.327 32 32 32z"
        fill="#E0E0E0"
      />
      <circle cx={32} cy={32} r={32} fill="#35495D" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M32.081 15.875c5.402 0 9.821 4.42 9.821 9.821 0 5.565-4.42 9.985-9.82 9.985-5.566 0-9.985-4.42-9.985-9.985 0-5.402 4.42-9.821 9.984-9.821zM24.552 37.975h14.895c6.711 0 10.476 5.402 10.476 11.622-9.82 9.984-26.026 9.984-35.683 0 0-6.22 3.601-11.622 10.312-11.622z"
        fill="#83898F"
      />
    </g>
  </svg>
)
