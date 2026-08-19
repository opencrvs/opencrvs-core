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
import { List } from '@opencrvs/components/lib/List'
import { Content } from '@opencrvs/components/lib/Content'
import { userMessages as messages } from '@client/i18n/messages'
import {
  useAssignedOffice,
  useEmailAddress,
  useLanguage,
  useName,
  usePassword,
  usePhoneNumber,
  usePIN,
  useProfileImage,
  useRole
} from '@client/views/Settings/items'
import { WorkqueueLayout } from '@client/v2-events/layouts/workqueues'
import { withSuspense } from '@client/v2-events/components/withSuspense'

const settingsTitle = {
  id: 'home.header.settingsTitle',
  defaultMessage: 'Settings',
  description: 'settings title'
}

function SettingsPageComponent() {
  const intl = useIntl()

  const settings = [
    useName(),
    usePhoneNumber(),
    useEmailAddress(),
    useRole(),
    useAssignedOffice(),
    useLanguage(),
    usePassword(),
    usePIN(),
    useProfileImage()
  ]

  return (
    <WorkqueueLayout title={intl.formatMessage(settingsTitle)}>
      <Content
        showTitleOnMobile={true}
        title={intl.formatMessage(messages.settingsTitle)}
      >
        <List id="settings">
          {settings.map(({ id, item }) => (
            <List.Item key={id} {...item} data-testid={id} />
          ))}
        </List>
      </Content>
      {settings.map(({ id, overlay }) => (
        <React.Fragment key={id}>{overlay}</React.Fragment>
      ))}
    </WorkqueueLayout>
  )
}

export const SettingsPage = withSuspense(SettingsPageComponent)
