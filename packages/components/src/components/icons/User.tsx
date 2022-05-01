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

export const User = (props: React.HTMLAttributes<SVGElement>) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M12 6C10.7574 6 9.75002 7.00736 9.75002 8.25C9.75002 9.49264 10.7574 10.5 12 10.5C13.2427 10.5 14.25 9.49264 14.25 8.25C14.25 7.00736 13.2427 6 12 6ZM8.25002 8.25C8.25002 6.17893 9.92896 4.5 12 4.5C14.0711 4.5 15.75 6.17893 15.75 8.25C15.75 10.3211 14.0711 12 12 12C9.92896 12 8.25002 10.3211 8.25002 8.25ZM6.34835 14.5984C7.05161 13.8951 8.00544 13.5 9 13.5H15C15.9946 13.5 16.9484 13.8951 17.6516 14.5984C18.3549 15.3016 18.75 16.2554 18.75 17.25V18.75C18.75 19.1642 18.4142 19.5 18 19.5C17.5858 19.5 17.25 19.1642 17.25 18.75V17.25C17.25 16.6533 17.0129 16.081 16.591 15.659C16.169 15.2371 15.5967 15 15 15H9C8.40326 15 7.83097 15.2371 7.40901 15.659C6.98705 16.081 6.75 16.6533 6.75 17.25V18.75C6.75 19.1642 6.41421 19.5 6 19.5C5.58579 19.5 5.25 19.1642 5.25 18.75V17.25C5.25 16.2554 5.64509 15.3016 6.34835 14.5984Z"
        fill="#222222"
      />
    </svg>
  )
}
