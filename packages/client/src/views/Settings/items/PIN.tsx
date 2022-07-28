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
import { ListViewItemSimplified } from '@opencrvs/components/lib/interface'
import { constantsMessages, buttonMessages } from '@client/i18n/messages'
import { useIntl } from 'react-intl'
import {
  LabelContainer,
  ValueContainer,
  DynamicHeightLinkButton
} from '@client/views/Settings/items/components'

export function PIN() {
  const intl = useIntl()
  return (
    <ListViewItemSimplified
      label={
        <LabelContainer>
          {intl.formatMessage(constantsMessages.labelPin)}
        </LabelContainer>
      }
      value={<ValueContainer>****</ValueContainer>}
      actions={
        <DynamicHeightLinkButton disabled>
          {intl.formatMessage(buttonMessages.change)}
        </DynamicHeightLinkButton>
      }
    />
  )
}
