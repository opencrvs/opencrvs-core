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
  ActionType,
  ActionUpdate,
  DeclarationUpdateActions,
  AnnotationActionType,
  EventConfig,
  isPageVisible,
  isVerificationPage,
  annotationActions,
  findRecordActionPages,
  DeclarationUpdateActionType,
  getActionReviewFields,
  getDeclaration,
  getVisiblePagesFormFields,
  DeclarationActions,
  getCurrentEventState,
  stripHiddenFields,
  EventDocument,
  deepMerge,
  deepDropNulls
} from '@opencrvs/commons/events'
import { getEventConfigurationById } from '@events/service/config/config'
import { getEventById } from '@events/service/events/events'
import { ActionMiddlewareOptions } from '@events/router/middleware/utils'
import {
  getFormFieldErrors,
  getInvalidUpdateKeys,
  getVerificationPageErrors,
  throwWhenNotEmpty
} from './utils'

function validateDeclarationUpdateAction({
  eventConfig,
  event,
  actionType,
  declarationUpdate,
  annotation
}: {
  eventConfig: EventConfig
  event: EventDocument
  actionType: DeclarationUpdateActionType
  declarationUpdate: ActionUpdate
  // @TODO: annotation is always specific to action. Is there ever a need for null?
  annotation?: ActionUpdate
}) {
  /*
   * Declaration allows partial updates. Updates are validated against primitive types (zod) and field based custom validators (JSON schema).
   * We need to validate the update against the cleaned declaration, which is a merged version of the previous declaration and the update.
   */

  // 1. Merge declaration update with previous declaration to validate based on the right conditional rules
  const previousDeclaration = getCurrentEventState(event).declaration
  const completeDeclaration = deepMerge(previousDeclaration, declarationUpdate)

  const declarationConfig = getDeclaration(eventConfig)

  // 2. Strip declaration of hidden fields. Without additional checks, client could send an update with hidden fields that are malformed (e.g. conditional toggle between 2 fields, where the value is updated but not the toggle).
  const cleanedDeclaration = stripHiddenFields(
    getVisiblePagesFormFields(declarationConfig, completeDeclaration),
    completeDeclaration
  )

  // 3. When declaration update has fields that are not in the cleaned declaration, payload is invalid. Even though it could work when cleaned and merged, it would make it harder to use the `getCurrentEventState` function.
  const invalidKeys = getInvalidUpdateKeys({
    update: declarationUpdate,
    cleaned: cleanedDeclaration
  })

  if (invalidKeys.length > 0) {
    return invalidKeys
  }

  // 4. Validate declaration update against conditional rules, taking into account conditional pages.
  const declarationErrors = declarationConfig.pages
    .filter((page) => isPageVisible(page, cleanedDeclaration))
    .flatMap((page) => getFormFieldErrors(page.fields, cleanedDeclaration))

  const declarationActionParse = DeclarationActions.safeParse(actionType)

  // 5. Validate against action review fields, if applicable
  const reviewFields = declarationActionParse.success
    ? getActionReviewFields(eventConfig, declarationActionParse.data)
    : []

  const visibleAnnotationFields = stripHiddenFields(
    reviewFields,
    deepDropNulls(annotation ?? {})
  )

  const annotationErrors = getFormFieldErrors(
    reviewFields,
    visibleAnnotationFields
  )

  return [...declarationErrors, ...annotationErrors]
}

function validateActionAnnotation({
  eventConfig,
  actionType,
  annotation = {}
}: {
  eventConfig: EventConfig
  actionType: AnnotationActionType
  annotation?: ActionUpdate
}) {
  const pages = findRecordActionPages(eventConfig, actionType)

  const visibleVerificationPageIds = pages
    .filter((page) => isVerificationPage(page))
    .filter((page) => isPageVisible(page, annotation))
    .map((page) => page.id)

  const formFields = pages.flatMap(({ fields }) =>
    fields.flatMap((field) => field)
  )

  const errors = [
    ...getFormFieldErrors(formFields, annotation),
    ...getVerificationPageErrors(visibleVerificationPageIds, annotation)
  ]

  return errors
}

export function validateAction(actionType: ActionType) {
  return async ({ input, ctx, next }: ActionMiddlewareOptions) => {
    const event = await getEventById(input.eventId)

    const eventConfig = await getEventConfigurationById({
      token: ctx.token,
      eventType: event.type
    })

    const declarationUpdateAction =
      DeclarationUpdateActions.safeParse(actionType)

    if (declarationUpdateAction.success) {
      const errors = validateDeclarationUpdateAction({
        eventConfig,
        event,
        declarationUpdate: input.declaration,
        annotation: input.annotation,
        actionType: declarationUpdateAction.data
      })

      throwWhenNotEmpty(errors)
    }

    const annotationActionParse = annotationActions.safeParse(actionType)

    if (annotationActionParse.success) {
      const errors = validateActionAnnotation({
        eventConfig,
        annotation: input.annotation,
        actionType: annotationActionParse.data
      })

      throwWhenNotEmpty(errors)
    }

    return next()
  }
}
