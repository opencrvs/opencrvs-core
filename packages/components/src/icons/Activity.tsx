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

interface IPropsActivity {
  stroke?: string
  height?: number
  width?: number
}

export function Activity(
  props: React.HTMLAttributes<SVGElement> & IPropsActivity
) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.75001 5C10.0728 5 10.3594 5.20657 10.4615 5.51283L14.25 16.8783L15.7885 12.2628C15.8906 11.9566 16.1772 11.75 16.5 11.75H19.5C19.9142 11.75 20.25 12.0858 20.25 12.5C20.25 12.9142 19.9142 13.25 19.5 13.25H17.0406L14.9615 19.4872C14.8594 19.7934 14.5728 20 14.25 20C13.9272 20 13.6406 19.7934 13.5385 19.4872L9.75001 8.12171L8.21153 12.7372C8.10944 13.0434 7.82284 13.25 7.50001 13.25H4.50001C4.0858 13.25 3.75001 12.9142 3.75001 12.5C3.75001 12.0858 4.0858 11.75 4.50001 11.75H6.95944L9.0385 5.51283C9.14059 5.20657 9.42719 5 9.75001 5Z"
        fill={props.stroke || 'currentColor'}
      />
    </svg>
  )
}
