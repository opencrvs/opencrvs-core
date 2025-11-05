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
import { MessageDescriptor, useIntl } from 'react-intl'
import { useNavigate } from 'react-router-dom'
import { ResponsiveModal } from '@opencrvs/components'
import {
  DangerButton,
  PrimaryButton,
  TertiaryButton
} from '@opencrvs/components/lib/buttons'
import { ActionType, EventIndex } from '@opencrvs/commons/client'
import { buttonMessages } from '@client/i18n/messages'
import { ROUTES } from '@client/v2-events/routes'
import {
  actionLabels,
  useUserAllowedActions
} from '../../../workqueues/EventOverview/components/useAllowedActionConfigurations'
import { useModal } from '../../../../hooks/useModal'
import { useEvents } from '../../useEvents/useEvents'
import { validate } from './validate'
import { register } from './register'
import { archive } from './archive'

export interface QuickActionConfig {
  description: MessageDescriptor
  onConfirm: ({
    event,
    actions,
    customActions,
    isActionAllowed
  }: {
    event: EventIndex
    actions: ReturnType<typeof useEvents>['actions']
    customActions: ReturnType<typeof useEvents>['customActions']
    isActionAllowed: (action: ActionType) => boolean
  }) => void | Promise<void>
  confirmButtonType?: 'primary' | 'danger'
  confirmButtonLabel?: MessageDescriptor
}

const quickActions = {
  [ActionType.VALIDATE]: validate,
  [ActionType.REGISTER]: register,
  [ActionType.ARCHIVE]: archive
} as const satisfies Partial<Record<ActionType, QuickActionConfig>>

function QuickActionModal({
  close,
  actionType
}: {
  close: (result: boolean) => void
  actionType: keyof typeof quickActions
}) {
  const intl = useIntl()
  const config = quickActions[actionType]

  const ConfirmButton =
    config.confirmButtonType === 'danger' ? DangerButton : PrimaryButton

  return (
    <ResponsiveModal
      actions={[
        <TertiaryButton
          key="cancel"
          id="cancel-btn"
          onClick={() => close(false)}
        >
          {intl.formatMessage(buttonMessages.cancel)}
        </TertiaryButton>,
        <ConfirmButton
          key="confirm"
          id="confirm-btn"
          onClick={() => close(true)}
        >
          {intl.formatMessage(
            config.confirmButtonLabel || buttonMessages.confirm
          )}
        </ConfirmButton>
      ]}
      autoHeight={true}
      handleClose={() => close(false)}
      id={`quick-action-modal-${actionType}`}
      responsive={true}
      show={true}
      title={intl.formatMessage(actionLabels[actionType])}
      width={800}
    >
      {intl.formatMessage(config.description)}
    </ResponsiveModal>
  )
}

export function useQuickActionModal(event: EventIndex) {
  const [quickActionModal, openModal] = useModal()
  const navigate = useNavigate()
  const { actions, customActions } = useEvents()
  const { isActionAllowed } = useUserAllowedActions(event.type)

  const onQuickAction = async (
    actionType: keyof typeof quickActions,
    workqueue?: string
  ) => {
    const confirmed = await openModal<boolean>((close) => (
      <QuickActionModal actionType={actionType} close={close} />
    ))

    // On confirmed modal, we will:
    // - Execute the configured onConfirm() for the action
    // - Redirect the user to the workqueue they arrived from if provided, or the home page if not
    if (confirmed) {
      void quickActions[actionType].onConfirm({
        event,
        actions,
        customActions,
        isActionAllowed
      })

      if (workqueue) {
        navigate(ROUTES.V2.WORKQUEUES.WORKQUEUE.buildPath({ slug: workqueue }))
      } else {
        navigate(ROUTES.V2.buildPath({}))
      }
    }
  }

  return { onQuickAction, quickActionModal }
}
