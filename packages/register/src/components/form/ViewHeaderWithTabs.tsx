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
import { Tabs } from '@opencrvs/components/lib/interface'
import styled from '@register/styledComponents'
import { ViewHeader } from '@register/components/ViewHeader'

export const ViewHeaderWithTabs = styled(ViewHeader)`
  padding-bottom: 0;

  #informant_parent_view {
    min-height: 107px;
  }

  #informant_parent_view > h2 {
    margin-top: 12px;
  }

  /* stylelint-disable */
  ${Tabs} {
    /* stylelint-enable */
    overflow-x: auto;
    width: 100%;
  }
`
