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

export const Collapse: CustomIcon = ({ size, ...rest }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 25"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...rest}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M15.3258 11.3864C15.6982 11.7943 15.6959 12.4536 15.3208 12.8589L10.8476 17.6924C10.2424 18.3463 9.21322 17.8782 9.2164 16.9506L9.24974 7.25291C9.25292 6.32528 10.2853 5.86426 10.8859 6.52227L15.3258 11.3864Z"
      fill="#959595"
    />
  </svg>
)
