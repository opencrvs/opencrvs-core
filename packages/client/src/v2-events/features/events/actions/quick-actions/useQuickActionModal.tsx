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
import { ResponsiveModal } from '@opencrvs/components'
import { PrimaryButton, TertiaryButton } from '@opencrvs/components/lib/buttons'
import { ActionType } from '@opencrvs/commons/client'
import { buttonMessages } from '@client/i18n/messages'
import { actionLabels } from '../../../workqueues/EventOverview/components/useAllowedActionConfigurations'
import { useModal } from '../../../../hooks/useModal'
import { validate } from './validate'
import { register } from './register'

export interface QuickActionConfig {
  description: MessageDescriptor
  onConfirm: () => void | Promise<void>
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

export function useQuickActionModal() {
  const [quickActionModal, openModal] = useModal()

  const onQuickAction = async (actionType: keyof typeof quickActions) => {
    const result = await openModal<boolean>((close) => (
      <QuickActionModal actionType={actionType} close={close} />
    ))

    if (result) {
      return quickActions[actionType].onConfirm()
    }
  }

  return { onQuickAction, quickActionModal }
}
