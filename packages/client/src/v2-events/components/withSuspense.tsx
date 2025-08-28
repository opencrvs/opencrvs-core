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
import styled from 'styled-components'
import { Spinner } from '@opencrvs/components'

/**
 * HOC to wrap a component in a suspense boundary with a spinner fallback.
 */

const FullSizeWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`

export function withSuspense<P extends object>(
  Component: React.ComponentType<P>
) {
  return (props: P) => (
    <React.Suspense
      fallback={
        <FullSizeWrapper>
          <Spinner id={`page-spinner-${Date.now()}`} />
        </FullSizeWrapper>
      }
    >
      <Component {...props} />
    </React.Suspense>
  )
}
