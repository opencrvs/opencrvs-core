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

export const ArrowDownBlue = (props: React.HTMLAttributes<SVGElement>) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M6.96967 9.21967C7.26256 8.92678 7.73744 8.92678 8.03033 9.21967L12 13.1893L15.9697 9.21967C16.2626 8.92678 16.7374 8.92678 17.0303 9.21967C17.3232 9.51256 17.3232 9.98744 17.0303 10.2803L12.5303 14.7803C12.2374 15.0732 11.7626 15.0732 11.4697 14.7803L6.96967 10.2803C6.67678 9.98744 6.67678 9.51256 6.96967 9.21967Z"
      fill={props.color || '#4972BB'}
    />
  </svg>
)
