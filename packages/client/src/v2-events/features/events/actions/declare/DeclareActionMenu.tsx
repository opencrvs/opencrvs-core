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
import { v4 as uuid } from 'uuid'
import {
  ActionType,
  EventDocument,
  getActionFormFields,
  getActionConfig
} from '@opencrvs/commons/client'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import {
  actionIcons,
  actionLabels
} from '@client/v2-events/features/workqueues/Actions/utils'
import { useCanDirectlyRegister } from '../useCanDirectlyRegister'
import { useReviewPageActions } from '../useReviewPageActions'
import { ActionMenuDropdown } from '../ActionMenuDropdown'

/**
 * Declaration actions contain actions available on the review page of the declare flow. This can include:
 *   - Declare
 *   - Register (aka. 'direct registration', which means declare+validate+register actions)
 *   - Save and exit
 *   - Delete draft
 */
function useDeclarationActions(event: EventDocument) {
  const events = useEvents()
  const canDirectlyRegister = useCanDirectlyRegister(event)
  const {
    eventConfiguration,
    declaration,
    annotation,
    hasValidationErrors,
    isActionAllowed,
    confirmAction,
    commonActions,
    modals
  } = useReviewPageActions(event, ActionType.DECLARE)

  const actionConfig = getActionConfig({
    eventConfiguration,
    actionType: ActionType.DECLARE
  })

  const dialogCopy =
    actionConfig && 'dialogCopy' in actionConfig
      ? actionConfig.dialogCopy
      : null

  const eventId = event.id

  const actions = [
    {
      icon: actionIcons[ActionType.REGISTER],
      label: actionLabels[ActionType.REGISTER],
      onClick: async () =>
        confirmAction({
          confirmLabel: actionLabels[ActionType.REGISTER],
          supportingCopy: dialogCopy?.register,
          // Combined declare+register shows only REGISTER's dialog fields
          fields: getActionFormFields(eventConfiguration, ActionType.REGISTER),
          title: {
            id: 'review.register.confirmModal.title',
            defaultMessage: 'Register the {event}?',
            description: 'The title for review action modal when registering'
          },
          // Combined flow: dialog values belong to the final REGISTER action only
          onConfirm: (values) =>
            events.customActions.registerOnDeclare.mutate({
              eventId,
              declaration,
              annotation,
              targetActionAnnotation: values,
              transactionId: uuid()
            })
        }),
      hidden: !isActionAllowed(ActionType.REGISTER),
      disabled: hasValidationErrors || !canDirectlyRegister
    },
    {
      icon: actionIcons[ActionType.DECLARE],
      label: actionLabels[ActionType.DECLARE],
      onClick: async () =>
        confirmAction({
          confirmLabel: actionLabels[ActionType.DECLARE],
          supportingCopy: dialogCopy?.declare,
          fields: getActionFormFields(eventConfiguration, ActionType.DECLARE),
          title: {
            id: 'review.declare.confirmModal.title',
            defaultMessage: 'Declare the {event}?',
            description: 'The title for review action modal when declaring'
          },
          onConfirm: (values) =>
            events.actions.declare.mutate({
              eventId,
              declaration,
              annotation: { ...annotation, ...values },
              transactionId: uuid()
            })
        }),
      hidden: !isActionAllowed(ActionType.DECLARE),
      disabled: hasValidationErrors
    }
  ].filter((a) => !a.hidden)

  return { modals, actions: [...actions, ...commonActions] }
}

/**
 * Menu component available on the declaration review page.
 * We have tried to contain all logic to which actions are available in the declaration in this component.
 * */
export function DeclareActionMenu({ event }: { event: EventDocument }) {
  const { modals, actions } = useDeclarationActions(event)

  return <ActionMenuDropdown actions={actions} modals={modals} />
}
