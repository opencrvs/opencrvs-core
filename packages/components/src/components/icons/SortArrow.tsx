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

export const SortArrow = (
  props: React.HTMLAttributes<SVGElement> & { active?: boolean }
) => (
  <svg width="13" height="7" {...props}>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M6.9046 6.32584C6.49669 6.69817 5.83742 6.6959 5.43208 6.32078L0.598569 1.84755C-0.0552939 1.24243 0.412809 0.213215 1.34044 0.216404L11.0381 0.249736C11.9657 0.252924 12.4268 1.28533 11.7687 1.88595L6.9046 6.32584Z"
      fill={props.active ? '#5B5B5B' : '#CCCCCC'}
    />
  </svg>
)
