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

export const Expandable = (props: React.HTMLAttributes<SVGElement>) => {
  return (
    <svg
      width="6"
      height="10"
      viewBox="0 0 6 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M5.29289 4.29289L1.70711 0.707107C1.07714 0.0771418 -6.65859e-08 0.523308 -1.05529e-07 1.41421L-4.19008e-07 8.58579C-4.57951e-07 9.47669 1.07714 9.92286 1.70711 9.29289L5.29289 5.70711C5.68342 5.31658 5.68342 4.68342 5.29289 4.29289Z"
        fill="#909397"
      />
    </svg>
  )
}
