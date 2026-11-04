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
  INITIAL_EVENT_CONFIG_VERSION_ID,
  EventConfig,
  EventConfigInput,
  VersionedEventConfig,
  VersionedEventConfigInput
} from './EventConfig'
import { ActionType } from './ActionType'
import { toPlainDateInTimeZone } from './PlainDate'
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
}: EventConfigInput): z.input<typeof EventConfig> {
  if (declaration) {
    // eslint-disable-next-line no-console
    console.warn(
      `Event '${config.id}' defines \`declaration\` at the top level, which is deprecated and will be removed in a future release. Define it on the ${ActionType.DECLARE} action instead.`
    )
  }

  return {
    ...config,
    actions: config.actions.map((action) => {
      if (action.type !== ActionType.DECLARE) {
        return action
      }
      const declarationOfAction = action.declaration ?? declaration
      // Unreachable: `declaration` is checked to be given exactly once before this transform
      if (!declarationOfAction) {
        throw new Error(`Event '${config.id}' does not define \`declaration\`.`)
      }
      return { ...action, declaration: declarationOfAction }
    })
  }
}

/** Fields an event with `versions` defines at the top level. Every other field belongs on each version. */
const VERSIONED_EVENT_FIELDS = [
  'id',
  'label',
  'advancedSearch',
  'versions'
] satisfies Array<keyof VersionedEventConfigInput>

/** Rejects fields given at the top level of an event with `versions`, which would otherwise be dropped. */
function validateNoVersionFieldsAtTopLevel(
  config: VersionedEventConfigInput,
  ctx: Pick<z.RefinementCtx<unknown>, 'addIssue'>
) {
  Object.keys(config)
    .filter((key) => !(VERSIONED_EVENT_FIELDS as string[]).includes(key))
    .forEach((key) => {
      ctx.addIssue({
        code: 'custom',
        message: `Event '${config.id}' defines \`versions\`, so \`${key}\` must be defined on each version, not at the top level.`,
        path: [key]
      })
    })
}

/** An event configured without `versions` is a single version, effective from the beginning of time. */
function toVersionedInput(
  config: EventConfigInput | VersionedEventConfigInput
): z.input<typeof VersionedEventConfig> {
  if ('versions' in config) {
    return config
  }

  const { id, label, advancedSearch, ...version } =
    moveDeclarationToDeclareAction(config)
  return {
    id,
    label,
    advancedSearch,
    versions: [{ ...version, id: INITIAL_EVENT_CONFIG_VERSION_ID }]
  }
}

/** The westernmost time zone, UTC−12: the last to begin each day. */
const WESTERNMOST_TIME_ZONE = 'Etc/GMT+12'

/**
 * An event must have a version in effect today, so that it can be declared once it
 * is configured, and core can rely on one being in effect. Versions take effect at
 * midnight in the country's time zone (`SYSTEM_IANA_TIMEZONE`), which is not at hand
 * here, so today is taken in UTC−12: a version in effect there is in effect in every
 * country. East of it, a version taking effect on the country's today is rejected
 * until UTC−12 catches up, up to 26 hours later in UTC+14. To stay clear of it,
 * schedule an event's only version a day ahead.
 */
function validateVersionInEffectToday(
  config: VersionedEventConfig,
  ctx: Pick<z.RefinementCtx<unknown>, 'addIssue'>
) {
  const today = toPlainDateInTimeZone(new Date(), WESTERNMOST_TIME_ZONE)
  const isAnyVersionInEffect = config.versions.some(
    ({ effectiveFrom }) => effectiveFrom <= today
  )

  if (!isAnyVersionInEffect) {
    ctx.addIssue({
      code: 'custom',
      message: `Event '${config.id}' has no version in effect today (${today}, UTC−12, the last time zone to begin the day). At least one version must omit \`effectiveFrom\` or take effect on or before that date.`,
      path: ['versions']
    })
  }
}

const EventConfigDefinition = z
  .custom<EventConfigInput | VersionedEventConfigInput>()
  .superRefine((config, ctx) => {
    // A version gives `declaration` only on the DECLARE action, which its schema checks
    if ('versions' in config) {
      validateNoVersionFieldsAtTopLevel(config, ctx)
      return
    }
    const eventCtx = { ...ctx, value: config }
    if (validateExactlyOneDeclareAction(config, eventCtx)) {
      validateDeclarationGivenExactlyOnce(config, eventCtx)
    }
  })
  .transform(toVersionedInput)
  .pipe(VersionedEventConfig)
  .superRefine(validateVersionInEffectToday)

/**
 * Validates an event configuration. Accepts an event with `versions`, or, as before
 * versioning, an event without them, which is taken as a single version with id
 * `initial`, effective from the beginning of time.
 */
export const defineConfig = (
  config: EventConfigInput | VersionedEventConfigInput
) => EventConfigDefinition.parse(config)
