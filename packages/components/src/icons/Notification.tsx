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

export const Notification = (props: React.HTMLAttributes<SVGElement>) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M22 18C22.5523 18 23 17.5523 23 17C23 16.4477 22.5523 16 22 16V18ZM2 16C1.44772 16 1 16.4477 1 17C1 17.5523 1.44772 18 2 18V16ZM5 9H4H5ZM19 9H20H19ZM13.73 21L14.595 21.5018C14.7744 21.1924 14.775 20.8108 14.5965 20.5009C14.418 20.191 14.0876 20 13.73 20V21ZM10.27 21V20C9.91237 20 9.58196 20.191 9.40346 20.5009C9.22497 20.8108 9.22555 21.1924 9.405 21.5018L10.27 21ZM22 16H2V18H22V16ZM2 18C4.20914 18 6 16.2091 6 14H4C4 15.1046 3.10457 16 2 16V18ZM6 14V9H4V14H6ZM6 9C6 5.68629 8.68629 3 12 3V1C7.58172 1 4 4.58172 4 9H6ZM12 3C15.3137 3 18 5.68629 18 9H20C20 4.58172 16.4183 1 12 1V3ZM18 9V14H20V9H18ZM18 14C18 16.2091 19.7909 18 22 18V16C20.8954 16 20 15.1046 20 14H18ZM12.865 20.4982C12.6861 20.8066 12.3565 20.9965 12 20.9965V22.9965C13.0696 22.9965 14.0583 22.427 14.595 21.5018L12.865 20.4982ZM12 20.9965C11.6435 20.9965 11.3139 20.8066 11.135 20.4982L9.405 21.5018C9.9417 22.427 10.9304 22.9965 12 22.9965V20.9965ZM10.27 22H13.73V20H10.27V22Z"
      fill={props.color ?? 'currentColor'}
    />
  </svg>
)
