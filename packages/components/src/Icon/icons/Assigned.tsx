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
import React from 'react'
import { CustomIcon } from '../types'

export const Assigned: CustomIcon = ({ size, ...rest }) => (
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
      d="M12 7.125C12.5523 7.125 13 7.57271 13 8.125L13 13.7108L15.2929 11.4179C15.6834 11.0274 16.3166 11.0274 16.7071 11.4179C17.0976 11.8084 17.0976 12.4416 16.7071 12.8321L12.7071 16.8321C12.5196 17.0196 12.2652 17.125 12 17.125C11.7348 17.125 11.4804 17.0196 11.2929 16.8321L7.29289 12.8321C6.90237 12.4416 6.90237 11.8084 7.29289 11.4179C7.68342 11.0274 8.31658 11.0274 8.70711 11.4179L11 13.7108L11 8.125C11 7.57272 11.4477 7.125 12 7.125Z"
      fill="white"
    />
  </svg>
)
