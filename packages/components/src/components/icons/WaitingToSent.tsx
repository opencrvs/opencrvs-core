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

export const WaitingToSent = (props: React.HTMLAttributes<SVGElement>) => {
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
        d="M12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3ZM1 12C1 5.92487 5.92487 1 12 1C18.0751 1 23 5.92487 23 12C23 18.0751 18.0751 23 12 23C5.92487 23 1 18.0751 1 12ZM12 7C12.2652 7 12.5196 7.10536 12.7071 7.29289L16.7071 11.2929C17.0976 11.6834 17.0976 12.3166 16.7071 12.7071C16.3166 13.0976 15.6834 13.0976 15.2929 12.7071L13 10.4142L13 16C13 16.5523 12.5523 17 12 17C11.4477 17 11 16.5523 11 16L11 10.4142L8.70711 12.7071C8.31658 13.0976 7.68342 13.0976 7.29289 12.7071C6.90237 12.3166 6.90237 11.6834 7.29289 11.2929L11.2929 7.29289C11.4804 7.10536 11.7348 7 12 7Z"
        fill="#CCCCCC"
      />
    </svg>
  )
}
