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

export const EyeOff = (props: React.HTMLAttributes<SVGElement>) => (
  <svg width={24} height={24} fill="none" {...props}>
    <path
      d="M17.311 17.5a1 1 0 1 0-1.212-1.59l1.212 1.59zm-5.061.75v1h.016l-.016-1zm-8.25-6l-.881-.473a1 1 0 0 0-.013.92L4 12.25zm4.402-3.66A1 1 0 0 0 7.188 7l1.214 1.59zm2.045-3.134a1 1 0 0 0 .456 1.948l-.456-1.948zm1.803.794l-.002 1h.002v-1zm8.25 6l.882.471a1 1 0 0 0 .012-.918l-.894.447zm-2.385 1.749a1 1 0 1 0 1.53 1.287L18.115 14zm-3.543.523a1 1 0 1 0-1.464-1.364l1.464 1.364zm-3.23-3.13a1 1 0 1 0-1.364-1.464l1.364 1.464zm4.757 4.518a6.552 6.552 0 0 1-3.865 1.34l.032 2a8.553 8.553 0 0 0 5.045-1.75L16.1 15.91zm-3.849 1.34c-2.226 0-4.042-1.274-5.364-2.684a13.761 13.761 0 0 1-1.875-2.548 7.588 7.588 0 0 1-.092-.168l-.02-.04a2.166 2.166 0 0 0-.005-.009v.001L4 12.25l-.894.448.001.003.003.005a2.31 2.31 0 0 0 .041.08 14.112 14.112 0 0 0 .56.945c.386.598.961 1.398 1.716 2.203 1.49 1.59 3.798 3.316 6.823 3.316v-2zm-7.369-4.527a12.837 12.837 0 0 1 3.52-4.133L7.189 7a14.837 14.837 0 0 0-4.07 4.777l1.763.946zm6.022-5.32a5.84 5.84 0 0 1 1.345-.153l.004-2a7.84 7.84 0 0 0-1.805.206l.456 1.948zm1.347-.153c2.226 0 4.042 1.274 5.364 2.684a13.756 13.756 0 0 1 1.875 2.549c.042.074.073.13.092.167l.02.04.005.008.894-.448c.895-.447.894-.447.894-.448l-.001-.003-.003-.005-.01-.018a6.664 6.664 0 0 0-.148-.274 15.755 15.755 0 0 0-2.16-2.936c-1.489-1.59-3.798-3.316-6.822-3.316v2zm7.368 4.529c-.422.79-.926 1.534-1.503 2.22l1.53 1.287a14.87 14.87 0 0 0 1.737-2.565l-1.764-.942zm-6.51 1.38a1.25 1.25 0 0 1-1.223.358l-.495 1.938a3.25 3.25 0 0 0 3.182-.933l-1.464-1.364zm-1.223.358a1.25 1.25 0 0 1-.902-.902l-1.938.495a3.25 3.25 0 0 0 2.345 2.345l.495-1.938zm-.902-.902a1.25 1.25 0 0 1 .359-1.223L9.978 9.928a3.25 3.25 0 0 0-.933 3.182l1.938-.495z"
      fill="currentColor"
    />
    <path
      d="M4 4l16.5 16.5"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)
