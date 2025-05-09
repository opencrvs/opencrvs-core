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
  Scope,
  SCOPES,
  FieldConfig
} from '@opencrvs/commons/client'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { validationErrorsInActionFormExist } from '@client/v2-events/components/forms/validation'
import { reviewMessages } from '@client/v2-events/features/events/actions/messages'

export function useReviewActionConfig({
  formConfig,
  declaration,
  annotation,
  reviewFields,
  scopes
}: {
  formConfig: DeclarationFormConfig
  declaration: EventState
  annotation?: EventState
  reviewFields: FieldConfig[]
  scopes?: Scope[]
}) {
  const events = useEvents()
  const incomplete = validationErrorsInActionFormExist({
    formConfig,
    form: declaration,
    annotation,
    reviewFields
  })

  if (scopes?.includes(SCOPES.RECORD_REGISTER)) {
    return {
      buttonType: 'positive' as const,
      incomplete,
      onConfirm: (eventId: string) =>
        events.customActions.registerOnValidate.mutate({
          eventId,
          declaration,
          annotation
        }),
      messages: incomplete
        ? reviewMessages.incomplete.register
        : reviewMessages.complete.register,
      icon: 'PaperPlaneTilt'
    } as const
  }

  if (scopes?.includes(SCOPES.RECORD_SUBMIT_FOR_APPROVAL)) {
    return {
      buttonType: 'positive' as const,
      incomplete,
      onConfirm: (eventId: string) =>
        events.actions.validate.mutate({
          eventId,
          declaration,
          annotation,
          transactionId: uuid(),
          duplicates: []
        }),
      messages: incomplete
        ? reviewMessages.incomplete.validate
        : reviewMessages.complete.validate,
      icon: 'PaperPlaneTilt'
    } as const
  }

  throw new Error('No valid scope found for the action')
}
