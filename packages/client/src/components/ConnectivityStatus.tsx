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
import { Online, Offline } from '@opencrvs/components/lib/icons'
import styled from '@client/styledComponents'
import { isNavigatorOnline } from '@client/utils'

const StyledOnline = styled.div`
  position: absolute;
  top: 32px;
  right: 245px;
`

const StyledOffline = styled.div`
  position: absolute;
  top: 32px;
  right: 245px;
`

const ConnectivityStatus = () => {
  return isNavigatorOnline() ? (
    <StyledOnline>
      <Online />
    </StyledOnline>
  ) : (
    <StyledOffline>
      <Offline />
    </StyledOffline>
  )
}

export default ConnectivityStatus
