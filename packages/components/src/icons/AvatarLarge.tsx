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

export const AvatarLarge = (props: React.HTMLAttributes<SVGElement>) => (
  <svg width={132} height={132} fill="none" {...props}>
    <circle cx={66} cy={66} r={66} fill="#35495D" />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M66.168 32.742c11.14 0 20.256 9.115 20.256 20.256 0 11.478-9.116 20.593-20.256 20.593-11.478 0-20.594-9.115-20.594-20.593 0-11.14 9.116-20.256 20.594-20.256zM50.64 78.323h30.72c13.842 0 21.607 11.141 21.607 23.97-20.256 20.593-53.678 20.593-73.596 0 0-12.829 7.427-23.97 21.268-23.97z"
      fill="#C1C7C9"
    />
  </svg>
)
