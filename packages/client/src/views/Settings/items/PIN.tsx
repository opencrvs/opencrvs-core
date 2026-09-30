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
import { constantsMessages, buttonMessages } from '@client/i18n/messages'
import { useIntl } from 'react-intl'
import {
  DynamicHeightLinkButton,
  SettingsRow
} from '@client/views/Settings/items/components'

export function usePIN(): SettingsRow {
  const intl = useIntl()

  return {
    id: 'pin',
    item: {
      label: intl.formatMessage(constantsMessages.labelPin),
      value: '****',
      actions: (
        <DynamicHeightLinkButton disabled>
          {intl.formatMessage(buttonMessages.change)}
        </DynamicHeightLinkButton>
      )
    }
  }
}
