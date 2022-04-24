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
import React from 'react'
import { Actions, ActionContext } from './ActionsModal'
import { ActionStatus } from '@client/views/SysAdmin/Config/Forms/utils'
import {
  FloatingNotification,
  NOTIFICATION_TYPE
} from '@opencrvs/components/lib/interface'
import { useIntl } from 'react-intl'
import { messages } from '@client/i18n/messages/views/formConfig'
import { useSelector } from 'react-redux'
import { IStoreState } from '@client/store'
import { selectFormDraft } from '@client/forms/configuration/formDrafts/selectors'
import { constantsMessages } from '@client/i18n/messages'

/* TODO: use the mappings defined in utils */
export function ActionsNotification() {
  const {
    actionState: { action, event, status },
    setAction
  } = React.useContext(ActionContext)
  const intl = useIntl()
  const { version } = useSelector((store: IStoreState) =>
    selectFormDraft(store, event)
  )

  return (
    <FloatingNotification
      type={
        status === ActionStatus.ERROR
          ? NOTIFICATION_TYPE.ERROR
          : NOTIFICATION_TYPE.SUCCESS
      }
      show={status === ActionStatus.ERROR || status === ActionStatus.COMPLETED}
      callback={() => setAction({ status: ActionStatus.IDLE })}
    >
      {status === ActionStatus.ERROR
        ? intl.formatMessage(messages.statusChangeError)
        : intl.formatMessage(
            action === Actions.PREVIEW
              ? messages.statusChangeInPreview
              : messages.statusChangePublish,
            { event: intl.formatMessage(constantsMessages[event]), version }
          )}
    </FloatingNotification>
  )
}
