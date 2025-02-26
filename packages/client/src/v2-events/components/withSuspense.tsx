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
import { Spinner } from '@opencrvs/components'

/**
 * HOC to wrap a component in a suspense boundary with a spinner fallback.
 */
export function withSuspense<
  ComponentProps extends { children?: React.ReactNode }
>(Component: React.ComponentType<ComponentProps>) {
  // eslint-disable-next-line react/display-name
  return (props: ComponentProps) => (
    <React.Suspense
      fallback={<Spinner id={`page-spinner-${new Date().getTime()}`} />}
    >
      <Component {...props} />
    </React.Suspense>
  )
}
