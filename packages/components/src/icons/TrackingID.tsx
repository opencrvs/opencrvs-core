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
import { colors } from '../colors'

export const TrackingID = (props: React.HTMLAttributes<SVGElement>) => {
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
        d="M12 5.25C8.27208 5.25 5.25 8.27208 5.25 12C5.25 15.7279 8.27208 18.75 12 18.75C15.7279 18.75 18.75 15.7279 18.75 12C18.75 8.27208 15.7279 5.25 12 5.25ZM3.75 12C3.75 7.44365 7.44365 3.75 12 3.75C16.5564 3.75 20.25 7.44365 20.25 12C20.25 16.5564 16.5564 20.25 12 20.25C7.44365 20.25 3.75 16.5564 3.75 12ZM12 8.24999C9.92892 8.24999 8.24999 9.92892 8.24999 12C8.24999 14.0711 9.92892 15.75 12 15.75C14.0711 15.75 15.75 14.0711 15.75 12C15.75 9.92892 14.0711 8.24999 12 8.24999ZM6.74999 12C6.74999 9.10049 9.10049 6.74999 12 6.74999C14.8995 6.74999 17.25 9.10049 17.25 12C17.25 14.8995 14.8995 17.25 12 17.25C9.10049 17.25 6.74999 14.8995 6.74999 12ZM12 11.25C11.5858 11.25 11.25 11.5858 11.25 12C11.25 12.4142 11.5858 12.75 12 12.75C12.4142 12.75 12.75 12.4142 12.75 12C12.75 11.5858 12.4142 11.25 12 11.25ZM9.74998 12C9.74998 10.7573 10.7573 9.74998 12 9.74998C13.2426 9.74998 14.25 10.7573 14.25 12C14.25 13.2426 13.2426 14.25 12 14.25C10.7573 14.25 9.74998 13.2426 9.74998 12Z"
        fill="#222222"
      />
    </svg>
  )
}
