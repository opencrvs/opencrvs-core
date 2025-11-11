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
import {
  ActionType,
  CustomActionConfig,
  EventIndex
} from '@opencrvs/commons/client'
import { buttonMessages } from '@client/i18n/messages'
import { ROUTES } from '@client/v2-events/routes'
import { useUserAllowedActions } from '../../../workqueues/EventOverview/components/useAllowedActionConfigurations'
import { useModal } from '../../../../hooks/useModal'
import { useEvents } from '../../useEvents/useEvents'
import { validate } from './validate'
import { register } from './register'
import { archive } from './archive'

interface ModalConfig {
  label: MessageDescriptor
  description: MessageDescriptor
  confirmButtonType?: 'primary' | 'danger'
  confirmButtonLabel?: MessageDescriptor
}

export interface QuickActionConfig {
  modal: ModalConfig
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
}

const quickActions = {
  [ActionType.VALIDATE]: validate,
  [ActionType.REGISTER]: register,
  [ActionType.ARCHIVE]: archive
} as const satisfies Partial<Record<ActionType, QuickActionConfig>>

function QuickActionModal({
  close,
  config
}: {
  close: (result: boolean) => void
  config: ModalConfig
}) {
  const intl = useIntl()

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
      id={`quick-action-modal-${config.label.id}`}
      responsive={true}
      show={true}
      title={intl.formatMessage(config.label)}
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
    const config = quickActions[actionType]
    const confirmed = await openModal<boolean>((close) => (
      <QuickActionModal close={close} config={config.modal} />
    ))

    // On confirmed modal, we will:
    // - Execute the configured onConfirm() for the action
    // - Redirect the user to the workqueue they arrived from if provided, or the home page if not
    if (confirmed) {
      void config.onConfirm({
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

  return { quickActionModal, onQuickAction }
}

const customActionConfigBase: Partial<ModalConfig> = {
  confirmButtonType: 'primary',
  confirmButtonLabel: {
    id: 'buttons.confirm',
    defaultMessage: 'Confirm',
    description: 'Confirm button text'
  }
}

export function useCustomActionModal(event: EventIndex) {
  const [customActionModal, openModal] = useModal()
  const navigate = useNavigate()
  const { actions, customActions } = useEvents()

  const onCustomAction = async (
    actionConfig: CustomActionConfig,
    workqueue?: string
  ) => {
    const config: ModalConfig = {
      ...customActionConfigBase,
      label: actionConfig.label,
      description: {
        id: 'custom.action.description',
        defaultMessage: 'Custom action description'
      }
    }
    const confirmed = await openModal<boolean>((close) => (
      <QuickActionModal close={close} config={config} />
    ))

    if (confirmed) {
      // TODO CIHAN: send backend request

      if (workqueue) {
        navigate(ROUTES.V2.WORKQUEUES.WORKQUEUE.buildPath({ slug: workqueue }))
      } else {
        navigate(ROUTES.V2.buildPath({}))
      }
    }
  }

  return { customActionModal, onCustomAction }
}
