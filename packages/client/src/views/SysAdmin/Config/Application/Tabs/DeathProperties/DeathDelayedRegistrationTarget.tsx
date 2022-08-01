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
import { useSelector } from 'react-redux'
import {
  Label,
  Value
} from '@client/views/SysAdmin/Config/Application/Components'
import { IStoreState } from '@client/store'
import { ListViewItemSimplified } from '@opencrvs/components/lib/interface'
import { DeathActionId } from '@client/views/SysAdmin/Config/Application'
import { useIntl } from 'react-intl'
import { messages } from '@client/i18n/messages/views/config'
import { buttonMessages } from '@client/i18n/messages'
import { getOfflineData } from '@client/offline/selectors'
import { LinkButton } from '@opencrvs/components/lib/buttons'
import { isString } from 'lodash'

export function DeathDelayedRegistrationTarget() {
  const intl = useIntl()
  const offlineCountryConfiguration = useSelector((store: IStoreState) =>
    getOfflineData(store)
  )
  const item = {
    label: intl.formatMessage(messages.delayedRegistrationLabel),
    value: intl.formatMessage(messages.delayedRegistrationValue, {
      lateTime: offlineCountryConfiguration.config.DEATH.REGISTRATION_TARGET
    }),
    action: {
      id: DeathActionId.DEATH_REGISTRATION_DELAYED_TARGET,
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
