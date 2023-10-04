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
import * as React from 'react'

export const Location = (
  props: React.HTMLAttributes<SVGElement> & { inverse?: boolean }
) => (
  <svg width={24} height={24} fill="none" {...props}>
    <path
      clipRule="evenodd"
      d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0v0z"
      stroke={props.inverse ? '#ffffff' : '#35495D'}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      clipRule="evenodd"
      d="M12 13a3 3 0 100-6 3 3 0 000 6z"
      stroke={props.inverse ? '#ffffff' : '#35495D'}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)
