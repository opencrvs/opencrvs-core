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
import { colorDictionary } from '../colors'

export const Phone = (props: React.HTMLAttributes<SVGElement>) => {
  const stroke = props.color ? props.color : colorDictionary.blackStormy
  return (
    <svg width={24} height={24} fill="none" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M21 15.476v2.71c.002.509-.21.995-.586 1.338a1.812 1.812 0 0 1-1.387.468 17.933 17.933 0 0 1-7.81-2.772 17.631 17.631 0 0 1-5.43-5.42A17.852 17.852 0 0 1 3.007 3.97 1.804 1.804 0 0 1 4.809 2h2.715a1.809 1.809 0 0 1 1.81 1.554c.115.867.327 1.718.634 2.538.248.66.09 1.404-.408 1.905l-.068.069c-.638.637-.783 1.631-.256 2.363a14.467 14.467 0 0 0 3.324 3.316c.73.523 1.722.38 2.358-.256l.073-.072a1.813 1.813 0 0 1 1.91-.406c.82.305 1.674.517 2.542.632.91.128 1.58.916 1.557 1.833z"
        stroke={stroke}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
