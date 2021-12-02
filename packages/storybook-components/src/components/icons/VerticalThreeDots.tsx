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

export const VerticalThreeDots = (props: React.HTMLAttributes<SVGElement>) => (
  <svg width={40} height={40} fill="none" {...props}>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M21 14a1 1 0 1 0-2 0 1 1 0 0 0 2 0zM21 20a1 1 0 1 0-2 0 1 1 0 0 0 2 0zM21 26a1 1 0 1 0-2 0 1 1 0 0 0 2 0z"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)
