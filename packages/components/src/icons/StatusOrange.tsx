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

export const StatusOrange = (props: React.HTMLAttributes<SVGElement>) => (
  <svg width={16} height={16} {...props}>
    <g fillRule="nonzero" fill="none">
      <circle fill="#F4F4F4" cx={8} cy={8} r={8} />
      <circle fill="#F4C78A" cx={8} cy={8} r={8} />
      <circle fill="#F4A34E" cx={8} cy={8} r={4} />
    </g>
  </svg>
)
