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

export const Edit = (props: React.HTMLAttributes<SVGElement>) => (
  <svg width={18} height={17} fill="none" {...props}>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M15 1.659a.841.841 0 0 0-.595.246L7.427 8.883l-.396 1.586 1.586-.396 6.978-6.978A.841.841 0 0 0 15 1.659ZM13.345.845a2.34 2.34 0 1 1 3.31 3.31L9.53 11.28a.75.75 0 0 1-.348.197l-3 .75a.75.75 0 0 1-.91-.909l.75-3a.75.75 0 0 1 .198-.348L13.345.845ZM1.409 2.409A2.25 2.25 0 0 1 3 1.75h5.25a.75.75 0 0 1 0 1.5H3a.75.75 0 0 0-.75.75v10.5a.75.75 0 0 0 .75.75h10.5a.75.75 0 0 0 .75-.75V9.25a.75.75 0 0 1 1.5 0v5.25a2.25 2.25 0 0 1-2.25 2.25H3A2.25 2.25 0 0 1 .75 14.5V4c0-.597.237-1.17.659-1.591Z"
      fill="#4972BB"
    />
  </svg>
)
