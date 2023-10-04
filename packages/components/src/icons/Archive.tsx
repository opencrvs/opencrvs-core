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

export const Archive = (props: React.HTMLAttributes<SVGElement>) => (
  <svg
    width={18}
    height={15}
    viewBox="0 0 18 15"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M0 0.75C0 0.335786 0.335786 0 0.75 0H17.25C17.6642 0 18 0.335786 18 0.75V4.5C18 4.91421 17.6642 5.25 17.25 5.25H16.5V14.25C16.5 14.6642 16.1642 15 15.75 15H2.25C1.83579 15 1.5 14.6642 1.5 14.25V5.25H0.75C0.335786 5.25 0 4.91421 0 4.5V0.75ZM15 13.5V5.25H3V13.5H15ZM16.5 3.75H15.75H2.25H1.5V1.5H16.5V3.75ZM7.5 6.75C7.08579 6.75 6.75 7.08579 6.75 7.5C6.75 7.91421 7.08579 8.25 7.5 8.25H10.5C10.9142 8.25 11.25 7.91421 11.25 7.5C11.25 7.08579 10.9142 6.75 10.5 6.75H7.5Z"
      fill="#4972BB"
    />
  </svg>
)
