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
import { useIntl } from 'react-intl'
import { Content } from '@opencrvs/components/lib/Content'
import { WorkqueueLayout } from '@client/v2-events/layouts/workqueues'
import { UserList } from '@client/views/SysAdmin/Team/user/UserList'

const teamTitle = {
  id: 'home.header.teamTitle',
  defaultMessage: 'Settings',
  description: 'settings title'
}

export function TeamPage() {
  const intl = useIntl()
  return (
    <WorkqueueLayout title={intl.formatMessage(teamTitle)}>
      <Content showTitleOnMobile={true} title={intl.formatMessage(teamTitle)}>
        <UserList hideNavigation={true} />
      </Content>
    </WorkqueueLayout>
  )
}
