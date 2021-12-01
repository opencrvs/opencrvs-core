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

export const StatusCertified = (props: React.HTMLAttributes<SVGElement>) => (
  <svg width={16} height={16} fill="none" {...props}>
    <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" fill="#F4F4F4" />
    <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" fill="#B3CDEF" />
    <path d="M8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" fill="#6291CD" />
  </svg>
)
