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

const EventConfigDefinition = z
  .custom<EventConfigInput>()
  .superRefine((config, ctx) => {
    if (validateExactlyOneDeclareAction(config, ctx)) {
      validateDeclarationGivenExactlyOnce(config, ctx)
    }
  })
  .transform(moveDeclarationToDeclareAction)
  .pipe(EventConfig)

export const defineConfig = (config: EventConfigInput) =>
  EventConfigDefinition.parse(config)
