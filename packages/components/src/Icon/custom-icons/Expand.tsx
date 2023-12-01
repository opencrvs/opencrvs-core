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
import React from 'react'
import { CustomIcon } from '../types'

export const Expand: CustomIcon = ({ size, ...rest }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 25"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...rest}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12.7386 15.4508C12.3307 15.8232 11.6714 15.8209 11.2661 15.4458L6.43255 10.9726C5.77869 10.3674 6.24679 9.33822 7.17443 9.3414L16.8721 9.37474C17.7997 9.37792 18.2607 10.4103 17.6027 11.0109L12.7386 15.4508Z"
      fill="#222222"
    />
  </svg>
)
