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

export const BRN = (props: React.HTMLAttributes<SVGElement>) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clip-path="url(#clip0_5955_18252)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12 4.5C9.51472 4.5 7.5 6.51472 7.5 9C7.5 11.4853 9.51472 13.5 12 13.5C12.8729 13.5 13.6877 13.2515 14.3776 12.8213C14.4149 12.7918 14.4551 12.7658 14.4979 12.7437C15.705 11.9366 16.5 10.5611 16.5 9C16.5 6.51472 14.4853 4.5 12 4.5ZM15.6462 13.7654C17.0772 12.6688 18 10.9422 18 9C18 5.68629 15.3137 3 12 3C8.68629 3 6 5.68629 6 9C6 10.9425 6.92312 12.6694 8.3546 13.766L7.50651 20.1513C7.46859 20.4368 7.59749 20.7188 7.8382 20.8769C8.0789 21.035 8.38889 21.0413 8.63585 20.8931L12 18.8747L15.3641 20.8931C15.611 21.0413 15.921 21.035 16.1617 20.8769C16.4024 20.7188 16.5313 20.4369 16.4935 20.1514L15.6462 13.7654ZM14.2396 14.5681C13.5476 14.8467 12.7917 15 12 15C11.2086 15 10.453 14.8468 9.7612 14.5684L9.19831 18.8064L11.6141 17.3569C11.8516 17.2144 12.1483 17.2144 12.3858 17.3569L14.8019 18.8065L14.2396 14.5681Z"
          fill="#222222"
        />
      </g>
      <defs>
        <clipPath id="clip0_5955_18252">
          <rect
            width="18"
            height="18"
            fill="white"
            transform="translate(3 3)"
          />
        </clipPath>
      </defs>
    </svg>
  )
}
