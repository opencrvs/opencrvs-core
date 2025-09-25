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

import { v4 as uuid } from 'uuid'
import {
  EventState,
  DeclarationFormConfig,
  FieldConfig,
  ActionType,
  Location,
  UUID
} from '@opencrvs/commons/client'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { validationErrorsInActionFormExist } from '@client/v2-events/components/forms/validation'
import { reviewMessages } from '@client/v2-events/features/events/actions/messages'
import { useUserAllowedActions } from '@client/v2-events/features/workqueues/EventOverview/components/useAllowedActionConfigurations'
import { useContext } from '@client/v2-events/hooks/useContext'

export function useReviewActionConfig({
  formConfig,
  declaration,
  annotation,
  reviewFields,
  eventType
}: {
  formConfig: DeclarationFormConfig
  declaration: EventState
  annotation?: EventState
  reviewFields: FieldConfig[]
  eventType: string
}) {
  const events = useEvents()
  const userContext = useContext()
  const { isActionAllowed } = useUserAllowedActions(eventType)
  const incomplete = validationErrorsInActionFormExist({
    formConfig,
    form: declaration,
    annotation,
    context: userContext,
    reviewFields
  })

  const userMayDeclare = isActionAllowed(ActionType.DECLARE)
  const userMayNotify = isActionAllowed(ActionType.NOTIFY)
  const userMayValidate = isActionAllowed(ActionType.VALIDATE)
  const userMayRegister = isActionAllowed(ActionType.REGISTER)

  if (incomplete && userMayNotify && userMayDeclare) {
    return {
      buttonType: 'primary',
      incomplete,
      onConfirm: (eventId: string) => {
        events.actions.notify.mutate({
          eventId,
          declaration,
          annotation,
          transactionId: uuid()
        })
      },
      messages: reviewMessages.incomplete.declare,
      icon: 'UploadSimple'
    } as const
  }

  if (userMayRegister) {
    return {
      buttonType: 'positive' as const,
      incomplete,
      onConfirm: (eventId: string) =>
        events.customActions.registerOnDeclare.mutate({
          eventId,
          declaration,
          transactionId: uuid(),
          annotation
        }),
      messages: incomplete
        ? reviewMessages.incomplete.register
        : reviewMessages.complete.register,
      icon: 'Check'
    } as const
  }

  if (userMayValidate) {
    return {
      buttonType: 'positive',
      incomplete,
      onConfirm: (eventId: string) =>
        events.customActions.validateOnDeclare.mutate({
          eventId,
          declaration,
          transactionId: uuid(),
          annotation
        }),
      messages: incomplete
        ? reviewMessages.incomplete.validate
        : reviewMessages.complete.validate,
      icon: 'PaperPlaneTilt'
    } as const
  }

  if (userMayDeclare) {
    return {
      buttonType: 'positive',
      incomplete,
      onConfirm: (eventId: string) =>
        events.actions.declare.mutate({
          eventId,
          declaration,
          annotation,
          transactionId: uuid()
        }),
      messages: incomplete
        ? reviewMessages.incomplete.declare
        : reviewMessages.complete.declare,
      icon: 'UploadSimple'
    } as const
  }

  throw new Error('No valid scope found for the action')
}
