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

export function Calendar(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width={18} height={18} viewBox="0 0 18 18" fill="none" {...props}>
      <path
        clipRule="evenodd"
        d="M2.25 5a2 2 0 012-2h9.5a2 2 0 012 2v9.5a2 2 0 01-2 2h-9.5a2 2 0 01-2-2V5z"
        stroke="#4C68C1"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 1.5v3M6 1.5v3M2.25 7.5h13.5"
        stroke="#4C68C1"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
