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

export const Success = (props: React.HTMLAttributes<SVGElement>) => (
  <svg width={40} height={40} fill="none" {...props}>
    <circle cx={20} cy={20} r={11} fill="#fff" stroke="#fff" strokeWidth={2} />
    <path
      d="M14 19.594L18.56 25 26 16"
      stroke="#49B78D"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export default Success
