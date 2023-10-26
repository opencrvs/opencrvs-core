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

export const Archived: CustomIcon = ({ size, ...rest }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 25"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...rest}
  >
    <path
      d="M3 1.03125C3 0.478966 3.44772 0.03125 4 0.03125L13.804 0.03125L21 7.24028V23.0312C21 23.5835 20.5523 24.0312 20 24.0312H4C3.44772 24.0312 3 23.5835 3 23.0312V1.03125Z"
      fill="#CCCCCC"
    />
    <path
      d="M13.7998 0.03125L20.9998 7.23125H13.7998V0.03125Z"
      fill="#5B5B5B"
    />
    <g clipPath="url(#clip0_10_3425)">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7 11.2812C7 11.0511 7.18655 10.8646 7.41667 10.8646H16.5833C16.8135 10.8646 17 11.0511 17 11.2812V13.3646C17 13.5947 16.8135 13.7812 16.5833 13.7812H16.1667V18.7812C16.1667 19.0113 15.9801 19.1979 15.75 19.1979H8.25C8.01988 19.1979 7.83333 19.0113 7.83333 18.7812V13.7812H7.41667C7.18655 13.7812 7 13.5947 7 13.3646V11.2812ZM15.3333 18.3646V13.7812H8.66667V18.3646H15.3333ZM16.1667 12.9479H15.75H8.25H7.83333V11.6979H16.1667V12.9479ZM11.1667 14.6146C10.9365 14.6146 10.75 14.8011 10.75 15.0312C10.75 15.2613 10.9365 15.4479 11.1667 15.4479H12.8333C13.0635 15.4479 13.25 15.2613 13.25 15.0312C13.25 14.8011 13.0635 14.6146 12.8333 14.6146H11.1667Z"
        fill="#5B5B5B"
      />
    </g>
    <defs>
      <clipPath id="clip0_10_3425">
        <rect
          width="10"
          height="10"
          fill="white"
          transform="translate(7 10.0312)"
        />
      </clipPath>
    </defs>
  </svg>
)
