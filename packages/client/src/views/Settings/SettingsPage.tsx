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
import { Header } from '@client/components/Header/Header'
import { ListViewSimplified } from '@opencrvs/components/lib/ListViewSimplified'
import {
  constantsMessages,
  userMessages as messages
} from '@client/i18n/messages'
import { Navigation } from '@client/components/interface/Navigation'
import { Content } from '@opencrvs/components/lib/Content'
import { Frame } from '@opencrvs/components/lib/Frame'
import {
  Name,
  Role,
  Language,
  Password,
  PIN,
  PhoneNumber,
  ProfileImage
} from '@client/views/Settings/items'
import { EmailAddress } from './items/EmailAddress'

export function SettingsPage() {
  const intl = useIntl()
  return (
    <Frame
      header={<Header title={intl.formatMessage(messages.settingsTitle)} />}
      navigation={<Navigation />}
      skipToContentText={intl.formatMessage(
        constantsMessages.skipToMainContent
      )}
    >
      <Content
        title={intl.formatMessage(messages.settingsTitle)}
        showTitleOnMobile={true}
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
    </Frame>
  )
}
