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
import React from 'react'
import { CustomIcon } from '../types'

export const DuplicateYellow: CustomIcon = ({ size, ...rest }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 26"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...rest}
  >
    <path
      d="M9.5 1.03125C9.5 0.478966 9.94772 0.03125 10.5 0.03125L17.603 0.03125L23 5.43802V17.0312C23 17.5835 22.5523 18.0312 22 18.0312H10.5C9.94772 18.0312 9.5 17.5835 9.5 17.0312V1.03125Z"
      fill="#9EC0E9"
    />
    <path
      d="M17.6001 0.03125L23.0001 5.43125H17.6001V0.03125Z"
      fill="#2B70C3"
    />
    <mask
      id="path-3-outside-1_10_3420"
      maskUnits="userSpaceOnUse"
      x="0"
      y="5.03125"
      width="16"
      height="20"
      fill="black"
    >
      <rect fill="white" y="5.03125" width="16" height="20" />
      <path d="M1 7.03125C1 6.47897 1.44772 6.03125 2 6.03125L9.10299 6.03125L14.5 11.438V23.0312C14.5 23.5835 14.0523 24.0312 13.5 24.0312H2C1.44772 24.0312 1 23.5835 1 23.0312V7.03125Z" />
    </mask>
    <path
      d="M1 7.03125C1 6.47897 1.44772 6.03125 2 6.03125L9.10299 6.03125L14.5 11.438V23.0312C14.5 23.5835 14.0523 24.0312 13.5 24.0312H2C1.44772 24.0312 1 23.5835 1 23.0312V7.03125Z"
      fill="#F9E0C0"
    />
    <path
      d="M9.10299 6.03125L9.81074 5.32478L9.51773 5.03125H9.10299V6.03125ZM14.5 11.438H15.5V11.0243L15.2077 10.7316L14.5 11.438ZM2 7.03125H9.10299V5.03125H2V7.03125ZM8.39525 6.73772L13.7923 12.1445L15.2077 10.7316L9.81074 5.32478L8.39525 6.73772ZM13.5 11.438V23.0312H15.5V11.438H13.5ZM13.5 23.0312H2V25.0312H13.5V23.0312ZM2 23.0312V7.03125H0V23.0312H2ZM2 23.0312H2H0C0 24.1358 0.895431 25.0312 2 25.0312V23.0312ZM13.5 23.0312V25.0312C14.6046 25.0312 15.5 24.1358 15.5 23.0312H13.5ZM2 5.03125C0.89543 5.03125 0 5.92668 0 7.03125H2L2 7.03125V5.03125Z"
      fill="white"
      mask="url(#path-3-outside-1_10_3420)"
    />
    <path d="M9.1001 6.03125L14.5001 11.4313H9.1001V6.03125Z" fill="#ED9A33" />
  </svg>
)
