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
import { PrimaryButton, TertiaryButton } from '@opencrvs/components/lib/buttons'
import { ActionType, EventIndex } from '@opencrvs/commons/client'
import { buttonMessages } from '@client/i18n/messages'
import { ROUTES } from '@client/v2-events/routes'
import { actionLabels } from '../../../workqueues/EventOverview/components/useAllowedActionConfigurations'
import { useModal } from '../../../../hooks/useModal'
import { useEvents } from '../../useEvents/useEvents'
import { validate } from './validate'
import { register } from './register'

export interface QuickActionConfig {
  description: MessageDescriptor
  onConfirm: (
    event: EventIndex,
    actions: ReturnType<typeof useEvents>['actions']
  ) => void | Promise<void>
}

const quickActions = {
  [ActionType.VALIDATE]: validate,
  [ActionType.REGISTER]: register
  // TODO CIHAN: add archive
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
        <PrimaryButton
          key="confirm"
          id="confirm-btn"
          onClick={() => close(true)}
        >
          {intl.formatMessage(buttonMessages.confirm)}
        </PrimaryButton>
      ]}
      autoHeight={true}
      handleClose={() => close(false)}
      id={`quick-action-modal-${actionType}`}
      responsive={true}
      show={true}
      title={intl.formatMessage(actionLabels[actionType])}
      // TODO CIHAN: fix size
      width={800}
    >
      {intl.formatMessage(config.description)}
    </ResponsiveModal>
  )
}

export function useQuickActionModal(event: EventIndex) {
  const [quickActionModal, openModal] = useModal()
  const navigate = useNavigate()
  const { actions } = useEvents()

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
      void quickActions[actionType].onConfirm(event, actions)

      if (workqueue) {
        navigate(ROUTES.V2.WORKQUEUES.WORKQUEUE.buildPath({ slug: workqueue }))
      } else {
        navigate(ROUTES.V2.buildPath({}))
      }
    }
  }

  return { onQuickAction, quickActionModal }
}
