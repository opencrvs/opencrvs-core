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

export const Sent: CustomIcon = ({ color, size, ...rest }) => (
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
      fill={color}
    />
    <path
      d="M12 7.125C12.2652 7.125 12.5196 7.23036 12.7071 7.41789L16.7071 11.4179C17.0976 11.8084 17.0976 12.4416 16.7071 12.8321C16.3166 13.2226 15.6834 13.2226 15.2929 12.8321L13 10.5392L13 16.125C13 16.6773 12.5523 17.125 12 17.125C11.4477 17.125 11 16.6773 11 16.125L11 10.5392L8.70711 12.8321C8.31658 13.2226 7.68342 13.2226 7.29289 12.8321C6.90237 12.4416 6.90237 11.8084 7.29289 11.4179L11.2929 7.41789C11.4804 7.23036 11.7348 7.125 12 7.125Z"
      fill="white"
    />
  </svg>
)
