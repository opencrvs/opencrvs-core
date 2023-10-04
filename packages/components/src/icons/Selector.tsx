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

export const Selector = (props: React.HTMLAttributes<SVGElement>) => (
  <svg width={16} height={6} fill="none" {...props}>
    <path d="M8 6H0L6.8.9a2 2 0 0 1 2.4 0L16 6H8z" fill="#fff" />
  </svg>
)
