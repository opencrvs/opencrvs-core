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
import React, { useCallback } from 'react'
import { useIntl } from 'react-intl'
import { useTypedSearchParams } from 'react-router-typesafe-routes/dom'
import { v4 as uuid } from 'uuid'
import { useSelector } from 'react-redux'
import {
  ActionType,
  getDeclaration,
  EventStatus,
  EventDocument,
  getCurrentEventState,
  TokenUserType,
  UUID,
  isActionAvailable,
  getActionConfig
} from '@opencrvs/commons/client'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'
import { DropdownMenu } from '@opencrvs/components/lib/Dropdown'
import { CaretDown } from '@opencrvs/components/lib/Icon/all-icons'
import { Icon } from '@opencrvs/components'
import { getUserDetails } from '@client/profile/profileSelectors'
import { useModal } from '@client/v2-events/hooks/useModal'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { useDrafts } from '@client/v2-events/features/drafts/useDrafts'
import { messages } from '@client/i18n/messages/views/action'
import { ROUTES } from '@client/v2-events/routes'
import { useEventFormNavigation } from '@client/v2-events/features/events/useEventFormNavigation'
import { messages as formHeaderMessages } from '@client/v2-events/layouts/form/FormHeader'
import { useUserAllowedActions } from '@client/v2-events/features/workqueues/EventOverview/components/useAllowedActionConfigurations'
import { actionLabels } from '@client/v2-events/features/workqueues/EventOverview/components/useAllowedActionConfigurations'
import { useValidatorContext } from '@client/v2-events/hooks/useValidatorContext'
import { Review } from '@client/v2-events/features/events/components/Review'
import { useSaveAndExitModal } from '@client/v2-events/components/SaveAndExitModal'
import { useActionAnnotation } from '../../useActionAnnotation'
import { useEventFormData } from '../../useEventFormData'
import { useRejectionModal } from '../reject/useRejectionModal'
import { useEventConfiguration } from '../../useEventConfiguration'
import { useReviewActionConfig } from './useReviewActionConfig'

/**
 * Declaration actions contain actions available on the review page of the declare flow. This can include:
 *   - Notify (incomplete records)
 *   - Declare (non-incomplete records)
 *   - Validate (aka. 'direct validation', which means declare+validate actions)
 *   - Register (aka. 'direct registration', which means declare+validate+register actions)
 *   - Reject (only available for previously notified events)
 *   - Save and exit
 *   - Delete declaration
 */
function useDeclarationActions(event: EventDocument) {
  const eventType = event.type
  const drafts = useDrafts()
  const { closeActionView, deleteDeclaration } = useEventFormNavigation()
  const { eventConfiguration } = useEventConfiguration(eventType)
  const formConfig = getDeclaration(eventConfiguration)
  const validatorContext = useValidatorContext()
  const declaration = useEventFormData((state) => state.getFormValues())
  const { getAnnotation } = useActionAnnotation()
  const annotation = getAnnotation()
  const [modal, openModal] = useModal()
  const { rejectionModal, handleRejection } = useRejectionModal(event.id)
  const [{ workqueue: slug }] = useTypedSearchParams(
    ROUTES.V2.EVENTS.DECLARE.REVIEW
  )
  const { saveAndExitModal, handleSaveAndExit } = useSaveAndExitModal()
  const events = useEvents()
  const userDetails = useSelector(getUserDetails)

  const mutateFns = {
    [ActionType.NOTIFY]: events.actions.notify.mutate,
    [ActionType.DECLARE]: events.actions.declare.mutate,
    [ActionType.VALIDATE]: events.customActions.validateOnDeclare.mutate,
    [ActionType.REGISTER]: events.customActions.registerOnDeclare.mutate
  }

  const actionConfiguration = eventConfiguration.actions.find(
    (a) => a.type === ActionType.DECLARE
  )
  if (!actionConfiguration) {
    throw new Error('Action configuration not found')
  }

  const reviewConfig = actionConfiguration.review

  // @TODO CIHAN: can we clean up useReviewActionConfig?
  const reviewActionConfiguration = useReviewActionConfig({
    eventType,
    formConfig,
    declaration,
    annotation,
    reviewFields: reviewConfig.fields,
    validatorContext
  })

  const { isActionAllowed } = useUserAllowedActions(eventType)
  const eventId = event.id

  const onDelete = useCallback(async () => {
    await deleteDeclaration(eventId)
  }, [eventId, deleteDeclaration])

  async function handleDeclaration(actionType: keyof typeof mutateFns) {
    const mutateFn = mutateFns[actionType]

    const confirmedDeclaration = await openModal<boolean | null>((close) => {
      if (reviewActionConfiguration.messages.modal === undefined) {
        // eslint-disable-next-line no-console
        console.error(
          'Tried to render declare modal without message definitions.'
        )
        return null
      }

      return (
        <Review.ActionModal.Accept
          action="Declare"
          close={close}
          copy={{
            // @TODO: make these configurable in action config?
            // Will be implemented as part of https://github.com/opencrvs/opencrvs-core/issues/10900
            ...reviewActionConfiguration.messages.modal,
            onConfirm: actionLabels[actionType],
            eventLabel: eventConfiguration.label
          }}
        />
      )
    })

    if (confirmedDeclaration) {
      mutateFn({
        eventId,
        declaration,
        annotation,
        transactionId: uuid()
      })
      closeActionView(slug)
    }
  }

  const eventIndex = getCurrentEventState(event, eventConfiguration)

  /**
   * Logic to check whether direct declare + validate or declare + validate + register is possible.
   * We do this by 'looking in to the future' by applying the would-be actions to the event,
   * and checking if the validate and register actions are still allowed.
   */
  function isDirectActionPossible(
    actionType: typeof ActionType.VALIDATE | typeof ActionType.REGISTER
  ) {
    if (!userDetails) {
      return false
    }

    const eventAfterDeclare = {
      ...event,
      actions: event.actions.concat({
        type: ActionType.DECLARE,
        id: 'placeholder' as UUID,
        transactionId: 'placeholder' as UUID,
        createdByUserType: TokenUserType.enum.user,
        createdByRole: userDetails.role.id,
        declaration,
        annotation,
        createdAt: new Date().toISOString(),
        createdBy: userDetails.id,
        originalActionId: null,
        status: 'Accepted',
        createdBySignature: undefined,
        createdAtLocation: userDetails.primaryOffice.id as UUID
      })
    }

    const eventIndexAfterDeclare = getCurrentEventState(
      eventAfterDeclare,
      eventConfiguration
    )

    const validateActionConfig = getActionConfig({
      eventConfiguration,
      actionType: ActionType.VALIDATE
    })

    if (!validateActionConfig) {
      return false
    }

    const validateIsAvailable = isActionAvailable(
      validateActionConfig,
      eventIndexAfterDeclare,
      validatorContext
    )

    if (actionType === ActionType.VALIDATE) {
      return validateIsAvailable
    }

    const eventAfterValidate = {
      ...eventAfterDeclare,
      actions: eventAfterDeclare.actions.concat({
        type: ActionType.VALIDATE,
        id: 'placeholder' as UUID,
        transactionId: 'placeholder' as UUID,
        createdByUserType: TokenUserType.enum.user,
        createdByRole: userDetails.role.id,
        declaration,
        annotation,
        createdAt: new Date().toISOString(),
        createdBy: userDetails.id,
        originalActionId: null,
        status: 'Accepted',
        createdBySignature: undefined,
        createdAtLocation: userDetails.primaryOffice.id as UUID
      })
    }

    const registerActionConfig = getActionConfig({
      eventConfiguration,
      actionType: ActionType.REGISTER
    })

    if (!registerActionConfig) {
      return false
    }

    const eventIndexAfterValidate = getCurrentEventState(
      eventAfterValidate,
      eventConfiguration
    )

    return isActionAvailable(
      registerActionConfig,
      eventIndexAfterValidate,
      validatorContext
    )
  }

  return {
    modals: [modal, rejectionModal, saveAndExitModal],
    actions: [
      {
        icon: 'Check' as const,
        label: actionLabels[ActionType.REGISTER],
        onClick: async () => handleDeclaration(ActionType.REGISTER),
        hidden: !isActionAllowed(ActionType.REGISTER),
        disabled:
          reviewActionConfiguration.incomplete ||
          !isDirectActionPossible(ActionType.REGISTER)
      },
      {
        icon: 'PaperPlaneTilt' as const,
        label: actionLabels[ActionType.VALIDATE],
        onClick: async () => handleDeclaration(ActionType.VALIDATE),
        hidden: !isActionAllowed(ActionType.VALIDATE),
        disabled:
          reviewActionConfiguration.incomplete ||
          !isDirectActionPossible(ActionType.VALIDATE)
      },
      {
        icon: 'UploadSimple' as const,
        label: actionLabels[ActionType.DECLARE],
        onClick: async () => handleDeclaration(ActionType.DECLARE),
        hidden: !isActionAllowed(ActionType.DECLARE),
        disabled: reviewActionConfiguration.incomplete
      },
      {
        icon: 'UploadSimple' as const,
        label: actionLabels[ActionType.NOTIFY],
        onClick: async () => handleDeclaration(ActionType.NOTIFY),
        hidden: !isActionAllowed(ActionType.NOTIFY),
        disabled: false
      },
      {
        icon: 'FileX' as const,
        label: actionLabels[ActionType.REJECT],
        // @TODO: ensure this works
        onClick: async () => handleRejection(() => closeActionView(slug)),
        hidden: eventIndex.status !== EventStatus.enum.NOTIFIED
      },
      {
        icon: 'FloppyDisk' as const,
        label: formHeaderMessages.saveExitButton,
        onClick: async () =>
          handleSaveAndExit(() => {
            drafts.submitLocalDraft()
            closeActionView(slug)
          }),
        hidden: false
      },
      {
        icon: 'Trash' as const,
        label: formHeaderMessages.deleteDeclaration,
        onClick: () => onDelete,
        hidden: false
      }
    ].filter((a) => !a.hidden)
  }
}

/**
 * Menu component available on the declaration review page.
 * We have tried to contain all logic to which actions are available in the declaration in this component.
 * */
export function DeclareActionMenu({ event }: { event: EventDocument }) {
  const intl = useIntl()
  const { modals, actions } = useDeclarationActions(event)

  return (
    <>
      <DropdownMenu id="action">
        <DropdownMenu.Trigger asChild>
          <PrimaryButton
            data-testid="action-dropdownMenu"
            icon={() => <CaretDown />}
            size="medium"
          >
            {intl.formatMessage(messages.action)}
          </PrimaryButton>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          {actions.map(({ onClick, icon, label, disabled }, index) => (
            <DropdownMenu.Item
              key={index}
              disabled={disabled}
              onClick={onClick}
            >
              <Icon color="currentColor" name={icon} size="small" />
              {intl.formatMessage(label)}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu>
      {modals}
    </>
  )
}
