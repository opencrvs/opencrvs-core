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

export function Trash({
  color = 'primary',
  ...props
}: { color?: keyof typeof colors } & React.HTMLAttributes<SVGElement>) {
  return (
    <svg
      width="20"
      height="22"
      viewBox="0 0 20 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.00002 2C7.7348 2 7.48045 2.10536 7.29291 2.29289C7.10537 2.48043 7.00002 2.73478 7.00002 3V3.99998H13V3C13 2.73478 12.8947 2.48043 12.7071 2.29289C12.5196 2.10536 12.2652 2 12 2H8.00002ZM15 3.99998V3C15 2.20435 14.6839 1.44129 14.1213 0.87868C13.5587 0.316071 12.7957 0 12 0H8.00002C7.20437 0 6.44131 0.316071 5.8787 0.87868C5.31609 1.44129 5.00002 2.20435 5.00002 3V3.99999L1 3.99998C0.447715 3.99998 0 4.4477 0 4.99998C0 5.55227 0.447715 5.99998 1 5.99998H2L2.00002 19C2.00002 19.7956 2.31609 20.5587 2.8787 21.1213C3.4413 21.6839 4.20437 22 5.00002 22H15C15.7957 22 16.5587 21.6839 17.1213 21.1213C17.6839 20.5587 18 19.7957 18 19V5.99998H19C19.5523 5.99998 20 5.55227 20 4.99998C20 4.4477 19.5523 3.99998 19 3.99998H15ZM6.00519 5.99999C6.00347 6 6.00174 6 6.00002 6C5.99829 6 5.99656 6 5.99484 5.99999L4 5.99998L4.00002 19C4.00002 19.2652 4.10537 19.5196 4.29291 19.7071C4.48044 19.8946 4.7348 20 5.00002 20H15C15.2652 20 15.5196 19.8946 15.7071 19.7071C15.8947 19.5196 16 19.2652 16 19V6L14.0027 6C14.0018 6 14.0009 6 14 6C13.9991 6 13.9982 6 13.9973 6L6.00519 5.99999ZM7.99998 9C8.55227 9 8.99998 9.44771 8.99998 10V16C8.99998 16.5523 8.55227 17 7.99998 17C7.4477 17 6.99998 16.5523 6.99998 16V10C6.99998 9.44771 7.4477 9 7.99998 9ZM12 9C12.5523 9 13 9.44771 13 10V16C13 16.5523 12.5523 17 12 17C11.4477 17 11 16.5523 11 16V10C11 9.44771 11.4477 9 12 9Z"
        fill={colors[color]}
      />
    </svg>
  )
}
