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

export const Rejected = (props: React.HTMLAttributes<SVGElement>) => (
  <svg viewBox="0 0 60 60" width={60} height={60} {...props}>
    <defs>
      <linearGradient x1="50%" y1="2.378%" x2="50%" y2="79.891%" id="a">
        <stop stopColor="#6291CD" offset="0%" />
        <stop stopColor="#AACAF3" offset="100%" />
      </linearGradient>
    </defs>
    <g fill="none" fillRule="evenodd">
      <path
        fill="url(#a)"
        d="M30 60l-1.884-.06-1.876-.177-1.861-.294-1.84-.412-1.81-.525-1.773-.639-1.73-.748-1.679-.856-1.622-.96-1.559-1.058-1.489-1.156-1.413-1.246-1.333-1.333-1.246-1.413-1.156-1.49-1.059-1.558-.96-1.622-.855-1.68-.748-1.73-.639-1.772-.525-1.81-.412-1.84-.294-1.861-.178-1.876L0 30l.06-1.884.177-1.876.294-1.861.412-1.84.525-1.81.639-1.773.748-1.73.856-1.679.96-1.622 1.058-1.559 1.156-1.489L8.13 9.464 9.464 8.13l1.413-1.246 1.49-1.156 1.558-1.059 1.622-.96 1.68-.855 1.73-.748 1.772-.639 1.81-.525L24.38.53 26.24.237l1.876-.178L30 0l1.884.06 1.876.177 1.861.294 1.84.412 1.81.525 1.773.639 1.73.748 1.679.856 1.622.96 1.559 1.058 1.489 1.156 1.413 1.246 1.333 1.333 1.246 1.413 1.156 1.49 1.059 1.558.96 1.622.855 1.68.748 1.73.639 1.772.525 1.81.412 1.84.294 1.861.178 1.876L60 30l-.06 1.884-.177 1.876-.294 1.861-.412 1.84-.525 1.81-.639 1.773-.748 1.73-.856 1.679-.96 1.622-1.058 1.559-1.156 1.489-1.246 1.413-1.333 1.333-1.413 1.246-1.49 1.156-1.558 1.059-1.622.96-1.68.855-1.73.748-1.772.639-1.81.525-1.84.412-1.861.294-1.876.178z"
      />
      <path
        stroke="#FFF"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M29.657 28.314L24 22.657 29.657 17"
      />
      <path
        d="M25 22.5h13.5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-20"
        stroke="#FFF"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </g>
  </svg>
)
