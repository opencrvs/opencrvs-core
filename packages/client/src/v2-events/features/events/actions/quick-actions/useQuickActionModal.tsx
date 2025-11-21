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
import { v4 as uuid } from 'uuid'
import { ResponsiveModal } from '@opencrvs/components'
import {
  DangerButton,
  PrimaryButton,
  TertiaryButton
} from '@opencrvs/components/lib/buttons'
import { Dialog } from '@opencrvs/components/lib/Dialog/Dialog'
import {
  ActionType,
  CustomActionConfig,
  EventIndex,
  FieldConfig,
  FieldUpdateValue,
  runFieldValidations
} from '@opencrvs/commons/client'
import { buttonMessages } from '@client/i18n/messages'
import { ROUTES } from '@client/v2-events/routes'
import { FormFieldGenerator } from '@client/v2-events/components/forms/FormFieldGenerator'
import { useValidatorContext } from '@client/v2-events/hooks/useValidatorContext'
import { useUserAllowedActions } from '../../../workqueues/EventOverview/components/useAllowedActionConfigurations'
import { useModal } from '../../../../hooks/useModal'
import { useEvents } from '../../useEvents/useEvents'
import { actionLabels } from '../../../workqueues/EventOverview/components/useAllowedActionConfigurations'
import { validate } from './validate'
import { register } from './register'
import { archive } from './archive'

interface ModalConfig {
  label?: MessageDescriptor
  description?: MessageDescriptor
  confirmButtonType?: 'primary' | 'danger'
  confirmButtonLabel?: MessageDescriptor
  fields?: FieldConfig[]
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

interface ModalResult {
  /** Whether the modal was confirmed/accepted or not */
  result: boolean
  /** The values entered in the modal form, if any */
  values?: Record<string, FieldUpdateValue>
}

function QuickActionModal({
  close,
  config
}: {
  close: (result: ModalResult) => void
  config: ModalConfig & { label: MessageDescriptor }
}) {
  const intl = useIntl()
  const validatorContext = useValidatorContext()
  const [modalValues, setModalValues] = React.useState<
    Record<string, FieldUpdateValue>
  >({})

  const ConfirmButton =
    config.confirmButtonType === 'danger' ? DangerButton : PrimaryButton

  const handleChange = (values: Record<string, FieldUpdateValue>) => {
    setModalValues((prev) => ({
      ...prev,
      ...values
    }))
  }

  const errorsOnField = (config.fields ?? []).flatMap((field) =>
    runFieldValidations({
      field,
      values: modalValues,
      context: validatorContext
    })
  )

  return (
    <Dialog
      actions={[
        <TertiaryButton
          key="cancel"
          id="cancel-btn"
          onClick={() => close({ result: false })}
        >
          {intl.formatMessage(buttonMessages.cancel)}
        </TertiaryButton>,
        <ConfirmButton
          key="confirm"
          disabled={errorsOnField.length > 0}
          id="confirm-btn"
          onClick={() => close({ result: true, values: modalValues })}
        >
          {intl.formatMessage(
            config.confirmButtonLabel || buttonMessages.confirm
          )}
        </ConfirmButton>
      ]}
      id={`quick-action-modal-${config.label.id}`}
      isOpen={true}
      title={intl.formatMessage(config.label)}
      onClose={() => close({ result: false })}
    >
      <FormFieldGenerator
        fields={config.fields ?? []}
        id={'quick-action-modal-form'}
        validatorContext={validatorContext}
        onChange={handleChange}
      />
      {config.description ? intl.formatMessage(config.description) : null}
    </Dialog>
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
    const label = actionLabels[actionType]
    const confirmed = await openModal((close) => (
      <QuickActionModal close={close} config={{ label, ...config.modal }} />
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
  const { actions } = useEvents()

  const onCustomAction = async (
    actionConfig: CustomActionConfig,
    workqueue?: string
  ) => {
    const modalResult = await openModal<ModalResult>((close) => (
      <QuickActionModal
        close={close}
        config={{
          ...customActionConfigBase,
          label: actionConfig.label,
          description: actionConfig.supportingCopy,
          fields: actionConfig.form
        }}
      />
    ))

    if (modalResult.result) {
      void actions.custom.mutate({
        eventId: event.id,
        customActionType: actionConfig.customActionType,
        declaration: event.declaration,
        transactionId: uuid(),
        annotation: modalResult.values
      })

      if (workqueue) {
        navigate(ROUTES.V2.WORKQUEUES.WORKQUEUE.buildPath({ slug: workqueue }))
      } else {
        navigate(ROUTES.V2.buildPath({}))
      }
    }
  }

  return { customActionModal, onCustomAction }
}
