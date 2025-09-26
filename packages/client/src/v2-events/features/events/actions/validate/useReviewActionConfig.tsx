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
  EventStatus,
  ActionType
} from '@opencrvs/commons/client'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { validationErrorsInActionFormExist } from '@client/v2-events/components/forms/validation'
import { reviewMessages } from '@client/v2-events/features/events/actions/messages'
import { useUserAllowedActions } from '@client/v2-events/features/workqueues/EventOverview/components/useAllowedActionConfigurations'
import { useValidatorContext } from '@client/v2-events/hooks/useValidatorContext'

export function useReviewActionConfig({
  formConfig,
  declaration,
  annotation,
  reviewFields,
  status,
  eventType
}: {
  formConfig: DeclarationFormConfig
  declaration: EventState
  annotation?: EventState
  reviewFields: FieldConfig[]
  status: EventStatus
  eventType: string
}) {
  const events = useEvents()
  const validatorContext = useValidatorContext()
  const incomplete = validationErrorsInActionFormExist({
    formConfig,
    form: declaration,
    annotation,
    reviewFields,
    context: validatorContext
  })

  const { isActionAllowed } = useUserAllowedActions(eventType)

  if (isActionAllowed(ActionType.REGISTER)) {
    return {
      buttonType: 'positive' as const,
      incomplete,
      onConfirm: (eventId: string) => {
        if (status === EventStatus.Enum.NOTIFIED) {
          return events.customActions.registerOnDeclare.mutate({
            eventId,
            declaration,
            transactionId: uuid(),

            annotation
          })
        }
        return events.customActions.registerOnValidate.mutate({
          eventId,
          declaration,
          transactionId: uuid(),
          annotation
        })
      },
      messages: incomplete
        ? reviewMessages.incomplete.register
        : reviewMessages.complete.register,
      icon: 'PaperPlaneTilt'
    } as const
  }

  if (isActionAllowed(ActionType.VALIDATE)) {
    return {
      buttonType: 'positive' as const,
      incomplete,
      onConfirm: (eventId: string) => {
        if (status === EventStatus.Enum.NOTIFIED) {
          return events.customActions.validateOnDeclare.mutate({
            eventId,
            declaration,
            annotation,
            transactionId: uuid()
          })
        }
        return events.actions.validate.mutate({
          eventId,
          declaration,
          annotation,
          transactionId: uuid()
        })
      },
      messages: incomplete
        ? reviewMessages.incomplete.validate
        : reviewMessages.complete.validate,
      icon: 'PaperPlaneTilt'
    } as const
  }

  throw new Error('No valid scope found for the action')
}
