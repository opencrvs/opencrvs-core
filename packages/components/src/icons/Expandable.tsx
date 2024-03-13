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

export const Expandable = (
  props: React.HTMLAttributes<SVGElement> & { selected?: boolean }
) => {
  return props.selected ? (
    <svg
      width="10"
      height="6"
      viewBox="0 0 10 6"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5.70711 5.29289L9.29289 1.70711C9.92286 1.07714 9.47669 -8.20502e-07 8.58579 -7.42617e-07L1.41421 -1.15658e-07C0.523309 -3.7773e-08 0.0771432 1.07714 0.707108 1.70711L4.29289 5.29289C4.68342 5.68342 5.31658 5.68342 5.70711 5.29289Z"
        fill="#CCCCCC"
      />
    </svg>
  ) : (
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
        fill="#CCCCCC"
      />
    </svg>
  )
}
