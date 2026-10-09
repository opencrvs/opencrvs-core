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

import * as z from 'zod/v4'
import { EventConfig, EventConfigInput } from './EventConfig'
import { ActionType } from './ActionType'
import { generateNotifyReview } from './notificationFormFallback'
import {
  validateDeclarationGivenExactlyOnce,
  validateExactlyOneDeclareAction
} from './eventConfigValidation'

/**
 * Moves a top-level `declaration` onto the DECLARE action, where `EventConfig` expects it.
 * Expects the input to have exactly one DECLARE action, and `declaration` in only one place.
 */
function moveDeclarationToDeclareAction({
  declaration,
  ...config
}: EventConfigInput) {
  if (declaration) {
    // eslint-disable-next-line no-console
    console.warn(
      `Event '${config.id}' defines \`declaration\` at the top level, which is deprecated and will be removed in a future release. Define it on the ${ActionType.DECLARE} action instead.`
    )
  }

  return {
    ...config,
    actions: config.actions.map((action) =>
      action.type === ActionType.DECLARE && declaration
        ? { ...action, declaration }
        : action
    )
  }
}

type ActionConfigInput = EventConfigInput['actions'][number]

type DeclareActionConfigInput = Extract<
  ActionConfigInput,
  { type: typeof ActionType.DECLARE }
>

type NotifyActionConfigInput = Extract<
  ActionConfigInput,
  { type: typeof ActionType.NOTIFY }
>

/**
 * Fallback for events without a configured notification form or NOTIFY review.
 *
 * - Without a NOTIFY action, one is created from the DECLARE action.
 * - Without `notificationForm`, it is generated from the declaration with every field optional, and a warning is logged.
 * - Without `review`, it is generated from the DECLARE review with every field optional.
 *
 * This keeps NOTIFY behaving as it did when it fell back to the DECLARE configuration at runtime.
 * Expects the `declaration` to already be on the DECLARE action.
 */
function generateNotificationFormFallback(
  config: Omit<EventConfigInput, 'declaration'>
) {
  const declareAction = config.actions.find(
    (action): action is DeclareActionConfigInput =>
      action.type === ActionType.DECLARE
  )
  const notifyAction = config.actions.find(
    (action): action is NotifyActionConfigInput =>
      action.type === ActionType.NOTIFY
  )

  if (
    !declareAction?.declaration ||
    (notifyAction?.notificationForm && notifyAction.review)
  ) {
    return config
  }

  if (!notifyAction?.notificationForm) {
    // eslint-disable-next-line no-console
    console.warn(
      `Event '${config.id}' has no ${ActionType.NOTIFY} form. Generated one from the ${ActionType.DECLARE} form with all fields optional. Configure \`actions[${ActionType.NOTIFY}].notificationForm\`. This fallback will be removed in a future release.`
    )
  }

  const generated = {
    // EXPERIMENT: generate an empty notification form, to check whether the size of the
    // generated form causes the e2e slowdown. Not to be merged.
    notificationForm: notifyAction?.notificationForm ?? {
      label: declareAction.declaration.label,
      pages: []
    },
    review: notifyAction?.review ?? generateNotifyReview(declareAction.review)
  }

  if (notifyAction) {
    return {
      ...config,
      actions: config.actions.map((action) =>
        action === notifyAction ? { ...notifyAction, ...generated } : action
      )
    }
  }

  const notifyFromDeclare: NotifyActionConfigInput = {
    type: ActionType.NOTIFY,
    label: declareAction.label,
    icon: declareAction.icon,
    conditionals: declareAction.conditionals,
    flags: declareAction.flags,
    supportingCopy: declareAction.dialogCopy?.notify,
    ...generated
  }

  return {
    ...config,
    actions: config.actions.flatMap((action) =>
      action === declareAction ? [notifyFromDeclare, action] : [action]
    )
  }
}

const EventConfigDefinition = z
  .custom<EventConfigInput>()
  .superRefine((config, ctx) => {
    if (validateExactlyOneDeclareAction(config, ctx)) {
      validateDeclarationGivenExactlyOnce(config, ctx)
    }
  })
  .transform(moveDeclarationToDeclareAction)
  .transform(generateNotificationFormFallback)
  .pipe(EventConfig)

export const defineConfig = (config: EventConfigInput) =>
  EventConfigDefinition.parse(config)
