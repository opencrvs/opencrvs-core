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
import { ListViewItemSimplified } from '@opencrvs/components/lib/ListViewSimplified'
import { useIntl } from 'react-intl'
import { constantsMessages, buttonMessages } from '@client/i18n/messages'
import {
  LabelContainer,
  ValueContainer,
  DynamicHeightLinkButton
} from '@client/views/Settings/items/components'
import { useSelector } from 'react-redux'
import { IStoreState } from '@client/store'
import { getLanguage } from '@client/i18n/selectors'
import { getUserRole } from '@client/views/SysAdmin/Config/UserRoles/utils'
import { getUserDetails } from '@client/profile/profileSelectors'

export function Role() {
  const intl = useIntl()
  const language = useSelector(getLanguage)
  const systemRole = useSelector<IStoreState, string>((state) => {
    const userDetails = getUserDetails(state)
    return (userDetails && getUserRole(language, userDetails.role)) ?? ''
  })
  return (
    <ListViewItemSimplified
      label={
        <LabelContainer>
          {intl.formatMessage(constantsMessages.labelRole)}
        </LabelContainer>
      }
      value={<ValueContainer>{systemRole}</ValueContainer>}
      actions={
        <DynamicHeightLinkButton disabled>
          {intl.formatMessage(buttonMessages.change)}
        </DynamicHeightLinkButton>
      }
    />
  )
}
