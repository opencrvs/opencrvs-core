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
import { ListViewSimplified } from '@opencrvs/components/lib/ListViewSimplified'
import { Content } from '@opencrvs/components/lib/Content'
import { userMessages as messages } from '@client/i18n/messages'
import {
  Name,
  Role,
  Language,
  Password,
  PIN,
  PhoneNumber,
  ProfileImage
} from '@client/views/Settings/items'
import { WorkqueueLayout } from '@client/v2-events/layouts/workqueues'
import { EmailAddress } from '@client/views/Settings/items/EmailAddress'

export function SettingsPage() {
  const intl = useIntl()
  return (
    <WorkqueueLayout>
      <Content
        showTitleOnMobile={true}
        title={intl.formatMessage(messages.settingsTitle)}
      >
        <ListViewSimplified>
          <Name />
          <PhoneNumber />
          <EmailAddress />
          <Role />
          <Language />
          <Password />
          <PIN />
          <ProfileImage />
        </ListViewSimplified>
      </Content>
    </WorkqueueLayout>
  )
}
