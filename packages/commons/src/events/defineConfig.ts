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
import {
  EventConfigInput,
  EventConfigVersionInput,
  validateEachVersion,
  VersionedEventConfig,
  VersionedEventConfigInput
} from './EventConfig'
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
 * - Without `review`, it is generated from the DECLARE review with every field optional.
 * - Without `notificationForm`, a warning is logged. The form is not generated here, to keep the
 *   served configuration small: `getNotificationForm` derives it from the declaration when read.
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

  if (!notifyAction?.notificationForm) {
    // eslint-disable-next-line no-console
    console.warn(
      `Event '${config.id}' has no ${ActionType.NOTIFY} form. Using the ${ActionType.DECLARE} form with all fields optional. Configure \`actions[${ActionType.NOTIFY}].notificationForm\`. This fallback will be removed in a future release.`
    )
  }

  if (notifyAction?.review) {
    return config
  }

  if (!declareAction?.declaration) {
    throw new Error(
      `Event '${config.id}' has no ${ActionType.DECLARE} form. Configure \`actions[${ActionType.DECLARE}].declaration\`.`
    )
  }

  const review = generateNotifyReview(declareAction.review)

  if (notifyAction) {
    return {
      ...config,
      actions: config.actions.map((action) =>
        action === notifyAction ? { ...notifyAction, review } : action
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
    review
  }

  return {
    ...config,
    actions: config.actions.flatMap((action) =>
      action === declareAction ? [notifyFromDeclare, action] : [action]
    )
  }
}

/** Id of the version of an event configured without `versions`. */
export const DEFAULT_EVENT_CONFIG_VERSION_ID = 'default'

/** An event configured without `versions` is a single version, effective from the beginning of time. */
function toVersionedInput(
  config: EventConfigInput | VersionedEventConfigInput
): VersionedEventConfigInput {
  if ('versions' in config) {
    return config
  }

  const { id, label, advancedSearch, ...version } = config
  return {
    id,
    label,
    advancedSearch,
    versions: [{ ...version, id: DEFAULT_EVENT_CONFIG_VERSION_ID }]
  }
}

/** The input of one version, together with the fields shared by every version. */
function getVersionInput(
  config: VersionedEventConfigInput,
  {
    id: _id,
    effectiveFrom: _effectiveFrom,
    ...version
  }: EventConfigVersionInput
): EventConfigInput {
  return {
    ...version,
    id: config.id,
    label: config.label,
    advancedSearch: config.advancedSearch
  }
}

/**
 * Moves `declaration` onto the DECLARE action and generates the NOTIFY fallback, for each
 * version. The NOTIFY fallback always sets `review`, which the input type cannot tell.
 */
function prepareVersions(
  config: VersionedEventConfigInput
): z.input<typeof VersionedEventConfig> {
  return {
    id: config.id,
    label: config.label,
    advancedSearch: config.advancedSearch,
    versions: config.versions.map((version) => {
      const {
        id: _id,
        label: _label,
        advancedSearch: _advancedSearch,
        ...prepared
      } = generateNotificationFormFallback(
        moveDeclarationToDeclareAction(getVersionInput(config, version))
      )

      return {
        ...prepared,
        id: version.id,
        ...(version.effectiveFrom !== undefined && {
          effectiveFrom: version.effectiveFrom
        })
      } as z.input<typeof VersionedEventConfig>['versions'][number]
    })
  }
}

const EventConfigDefinition = z
  .custom<EventConfigInput | VersionedEventConfigInput>()
  .transform(toVersionedInput)
  .superRefine((config, ctx) =>
    validateEachVersion(
      ctx,
      config.versions.map((version) => getVersionInput(config, version)),
      (event, versionCtx) => {
        if (validateExactlyOneDeclareAction(event, versionCtx)) {
          validateDeclarationGivenExactlyOnce(event, versionCtx)
        }
      }
    )
  )
  .transform(prepareVersions)
  .pipe(VersionedEventConfig)

/**
 * Validates an event configuration. Accepts an event with `versions`, or, as before
 * versioning, an event without them, which is taken as a single version with id
 * `default`, effective from the beginning of time.
 */
export const defineConfig = (
  config: EventConfigInput | VersionedEventConfigInput
) => EventConfigDefinition.parse(config)
