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
import { buttonMessages } from '@client/i18n/messages'
import { messages as userSetupMessages } from '@client/i18n/messages/views/userSetup'
import { getUserDetails } from '@client/profile/profileSelectors'
import {
  DynamicHeightLinkButton,
  SettingsRow
} from '@client/views/Settings/items/components'
import { useLocations } from '@client/v2-events/hooks/useLocations'
import { todayISO, UUID } from '@opencrvs/commons/client'
import { resolveLocationName } from '@client/v2-events/utils'
import * as React from 'react'
import { useIntl } from 'react-intl'
import { useSelector } from 'react-redux'

export function useAssignedOffice(): SettingsRow {
  const intl = useIntl()
  const userDetails = useSelector(getUserDetails)
  const { getLocations } = useLocations()
  const locations = getLocations.useSuspenseQuery()

  // The current user's own office is a present-tense surface — today's name.
  const officeName = resolveLocationName(
    userDetails?.primaryOfficeId
      ? locations.get(userDetails.primaryOfficeId as UUID)
      : undefined,
    todayISO()
  )

  return {
    id: 'assigned-office',
    item: {
      label: intl.formatMessage(userSetupMessages.assignedOffice),
      value: officeName,
      actions: (
        <DynamicHeightLinkButton disabled>
          {intl.formatMessage(buttonMessages.change)}
        </DynamicHeightLinkButton>
      )
    }
  }
}
