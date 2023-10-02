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
import { colors } from '../colors'

export function ArrowUp({
  color = 'primary',
  ...props
}: { color?: keyof typeof colors } & React.HTMLAttributes<SVGElement>) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.99998 1.52588e-05C8.2652 1.49012e-05 8.51955 0.105371 8.70709 0.292908L15.7071 7.29291C16.0976 7.68343 16.0976 8.3166 15.7071 8.70712C15.3166 9.09765 14.6834 9.09765 14.2929 8.70712L8.99998 3.41422V15C8.99998 15.5523 8.55227 16 7.99998 16C7.4477 16 6.99998 15.5523 6.99998 15V3.41423L1.70711 8.70712C1.31658 9.09765 0.683419 9.09765 0.292894 8.70712C-0.0976307 8.3166 -0.0976314 7.68343 0.292892 7.29291L7.29288 0.292909C7.48041 0.105373 7.73477 1.55568e-05 7.99998 1.52588e-05Z"
        fill={colors[color]}
      />
    </svg>
  )
}
