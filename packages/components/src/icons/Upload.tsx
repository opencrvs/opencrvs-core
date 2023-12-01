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

export const Upload = (props: React.HTMLAttributes<SVGElement>) => (
  <svg width={24} height={24} fill="none" {...props}>
    <path
      d="M3 17v3a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3M16 6l-4-4-4 4M12 2v14"
      stroke="#fff"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)
