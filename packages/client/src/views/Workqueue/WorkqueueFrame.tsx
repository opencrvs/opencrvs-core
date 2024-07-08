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
import { Frame } from '@opencrvs/components'
import { useIntl } from 'react-intl'
import { Header } from '@client/views/SysAdmin/Performance/utils'
import { constantsMessages } from '@client/i18n/messages'
import { Navigation } from '@client/components/interface/Navigation'

export const WorkqueueFrame = ({
  title,
  children
}: {
  title: string
  children: React.ReactNode
}) => {
  const intl = useIntl()

  return (
    <Frame
      header={<Header title={title} />}
      skipToContentText={intl.formatMessage(
        constantsMessages.skipToMainContent
      )}
      navigation={<Navigation loadWorkqueueStatuses={false} />}
    >
      {children}
    </Frame>
  )
}
