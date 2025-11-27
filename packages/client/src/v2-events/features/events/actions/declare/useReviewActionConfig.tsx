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
import {
  EventState,
  DeclarationFormConfig,
  FieldConfig,
  ActionType,
  ValidatorContext
} from '@opencrvs/commons/client'
import { validationErrorsInActionFormExist } from '@client/v2-events/components/forms/validation'
import { reviewMessages } from '@client/v2-events/features/events/actions/messages'
import { useUserAllowedActions } from '@client/v2-events/features/workqueues/EventOverview/components/useAllowedActionConfigurations'

export function useReviewActionConfig({
  formConfig,
  declaration,
  annotation,
  reviewFields,
  eventType,
  validatorContext
}: {
  formConfig: DeclarationFormConfig
  declaration: EventState
  annotation?: EventState
  reviewFields: FieldConfig[]
  eventType: string
  validatorContext: ValidatorContext
}) {
  const { isActionAllowed } = useUserAllowedActions(eventType)
  const incomplete = validationErrorsInActionFormExist({
    formConfig,
    form: declaration,
    annotation,
    context: validatorContext,
    reviewFields
  })

  const userMayDeclare = isActionAllowed(ActionType.DECLARE)
  const userMayNotify = isActionAllowed(ActionType.NOTIFY)
  const userMayValidate = isActionAllowed(ActionType.VALIDATE)
  const userMayRegister = isActionAllowed(ActionType.REGISTER)

  if (incomplete && userMayNotify && userMayDeclare) {
    return {
      incomplete,
      messages: reviewMessages.incomplete.declare
    } as const
  }

  if (userMayRegister) {
    return {
      incomplete,
      messages: incomplete
        ? reviewMessages.incomplete.register
        : reviewMessages.complete.register
    } as const
  }

  if (userMayValidate) {
    return {
      incomplete,
      messages: incomplete
        ? reviewMessages.incomplete.validate
        : reviewMessages.complete.validate
    } as const
  }

  if (userMayDeclare) {
    return {
      incomplete,
      messages: incomplete
        ? reviewMessages.incomplete.declare
        : reviewMessages.complete.declare
    } as const
  }

  throw new Error('No valid scope found for the action')
}
