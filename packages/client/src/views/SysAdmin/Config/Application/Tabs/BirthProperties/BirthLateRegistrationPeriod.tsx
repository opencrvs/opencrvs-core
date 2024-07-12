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
import { useSelector } from 'react-redux'
import {
  Label,
  Value
} from '@client/views/SysAdmin/Config/Application/Components'
import { IStoreState } from '@client/store'
import { ListViewItemSimplified } from '@opencrvs/components/lib/ListViewSimplified'
import { BirthActionId } from '@client/views/SysAdmin/Config/Application'
import { useIntl } from 'react-intl'
import { messages } from '@client/i18n/messages/views/config'
import { buttonMessages } from '@client/i18n/messages'
import { getOfflineData } from '@client/offline/selectors'
import { LinkButton } from '@opencrvs/components/lib/buttons'
import { isString } from 'lodash'

export function BirthLateRegistrationPeriod() {
  const intl = useIntl()
  const offlineCountryConfiguration = useSelector((store: IStoreState) =>
    getOfflineData(store)
  )
  const item = {
    label: intl.formatMessage(messages.lateRegistrationLabel),
    value: intl.formatMessage(messages.lateRegistrationValue, {
      onTime: offlineCountryConfiguration.config.BIRTH.REGISTRATION_TARGET,
      lateTime:
        offlineCountryConfiguration.config.BIRTH.LATE_REGISTRATION_TARGET
    }),
    action: {
      id: BirthActionId.BIRTH_PERIOD_BETWEEN_LATE_DELAYED_TARGET,
      label: intl.formatMessage(buttonMessages.change),
      disabled: true
    }
  }
  const id = isString(item.label)
    ? item.label.split(' ').join('-')
    : 'label-component'

  return (
    <>
      <ListViewItemSimplified
        label={<Label id={`${id}_label`}>{item.label}</Label>}
        value={<Value id={`${id}_value`}>{item.value}</Value>}
        actions={
          <LinkButton id={item.action.id} disabled={item.action.disabled}>
            {item.action?.label}
          </LinkButton>
        }
      />
    </>
  )
}
