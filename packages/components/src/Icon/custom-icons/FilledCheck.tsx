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

export const FilledCheck: CustomIcon = ({ size, ...rest }) => (
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
      d="M1 12.125C1 6.04987 5.92487 1.125 12 1.125C18.0751 1.125 23 6.04987 23 12.125C23 18.2001 18.0751 23.125 12 23.125C5.92487 23.125 1 18.2001 1 12.125Z"
      fill="#49B78D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M16.7163 9.42721C16.9279 9.62247 16.9279 9.93905 16.7163 10.1343L10.758 15.6343C10.6564 15.7281 10.5187 15.7808 10.375 15.7808C10.2313 15.7808 10.0936 15.7281 9.99198 15.6343L7.28365 13.1343C7.07212 12.9391 7.07212 12.6225 7.28365 12.4272C7.49518 12.2319 7.83815 12.2319 8.04968 12.4272L10.375 14.5737L15.9503 9.42721C16.1619 9.23195 16.5048 9.23195 16.7163 9.42721Z"
      fill="white"
    />
  </svg>
)
