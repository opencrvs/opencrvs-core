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

export const OffLineCircled = (props: React.HTMLAttributes<SVGElement>) => (
  <svg width={60} height={60} {...props}>
    <title>{'Icons/offlineCicled'}</title>
    <defs>
      <linearGradient
        x1="50%"
        y1="2.378%"
        x2="50%"
        y2="79.891%"
        id="offlineCicled"
      >
        <stop stopColor="#6291CD" offset="0%" />
        <stop stopColor="#AACAF3" offset="100%" />
      </linearGradient>
    </defs>
    <g fill="none" fillRule="evenodd">
      <path
        d="M30 60l-1.884-.06-1.876-.177-1.861-.294-1.84-.412-1.81-.525-1.773-.639-1.73-.748-1.679-.856-1.622-.96-1.559-1.058-1.489-1.156-1.413-1.246-1.333-1.333-1.246-1.413-1.156-1.49-1.059-1.558-.96-1.622-.855-1.68-.748-1.73-.639-1.772-.525-1.81-.412-1.84-.294-1.861-.178-1.876L0 30l.06-1.884.177-1.876.294-1.861.412-1.84.525-1.81.639-1.773.748-1.73.856-1.679.96-1.622 1.058-1.559 1.156-1.489L8.13 9.464 9.464 8.13l1.413-1.246 1.49-1.156 1.558-1.059 1.622-.96 1.68-.855 1.73-.748 1.772-.639 1.81-.525L24.38.53 26.24.237l1.876-.178L30 0l1.884.06 1.876.177 1.861.294 1.84.412 1.81.525 1.773.639 1.73.748 1.679.856 1.622.96 1.559 1.058 1.489 1.156 1.413 1.246 1.333 1.333 1.246 1.413 1.156 1.49 1.059 1.558.96 1.622.855 1.68.748 1.73.639 1.772.525 1.81.412 1.84.294 1.861.178 1.876L60 30l-.06 1.884-.177 1.876-.294 1.861-.412 1.84-.525 1.81-.639 1.773-.748 1.73-.856 1.679-.96 1.622-1.058 1.559-1.156 1.489-1.246 1.413-1.333 1.333-1.413 1.246-1.49 1.156-1.558 1.059-1.622.96-1.68.855-1.73.748-1.772.639-1.81.525-1.84.412-1.861.294-1.876.178z"
        fill="url(#offlineCicled)"
      />
      <g fillRule="nonzero" transform="translate(10 19)">
        <g fill="#FFF">
          <path d="M15.85 18.137l2.385 2.316 2.305 2.238 2.305-2.238 2.384-2.316c-1.073-1.467-2.782-2.47-4.729-2.47a5.627 5.627 0 0 0-4.65 2.47zM33.655 9.684l.08.077L36 7.561C32.026 3.431 26.382 1 20.5 1S8.974 3.393 5 7.6l2.265 2.2.08-.077c3.378-3.59 8.187-5.635 13.155-5.635s9.777 2.045 13.155 5.596z" />
          <path d="M28.13 15.242l2.266-2.2a13.408 13.408 0 0 0-19.792 0l2.265 2.2c1.868-2.2 4.69-3.474 7.631-3.474s5.763 1.274 7.63 3.474z" />
        </g>
        <circle fill="#B74949" cx={6} cy={6} r={6} />
      </g>
    </g>
  </svg>
)
