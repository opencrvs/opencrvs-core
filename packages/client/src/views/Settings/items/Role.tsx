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
import { buttonMessages, constantsMessages } from '@client/i18n/messages'
import { getUserDetails } from '@client/profile/profileSelectors'
import { IStoreState } from '@client/store'
import {
  DynamicHeightLinkButton,
  SettingsRow
} from '@client/views/Settings/items/components'
import * as React from 'react'
import { useIntl } from 'react-intl'
import { useSelector } from 'react-redux'
import { formatUserRole } from '@client/v2-events/hooks/useRoles'

export function useRole(): SettingsRow {
  const intl = useIntl()
  const role = useSelector<IStoreState, string>((state) => {
    const userDetails = getUserDetails(state)
    return formatUserRole(userDetails?.role, intl)
  })

  return {
    id: 'role',
    item: {
      label: intl.formatMessage(constantsMessages.labelRole),
      value: role,
      actions: (
        <DynamicHeightLinkButton disabled>
          {intl.formatMessage(buttonMessages.change)}
        </DynamicHeightLinkButton>
      )
    }
  }
}
