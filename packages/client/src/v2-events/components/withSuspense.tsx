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
import { SuspenseLoadingFallback } from './SuspenseLoadingFallback'

/**
 * HOC to wrap a component in a suspense boundary with an offline-aware
 * loading fallback. See {@link SuspenseLoadingFallback} for why the fallback
 * is offline-aware.
 */

export function withSuspense<P extends object>(
  Component: React.ComponentType<P>
) {
  return (props: P) => (
    <React.Suspense fallback={<SuspenseLoadingFallback />}>
      <Component {...props} />
    </React.Suspense>
  )
}
