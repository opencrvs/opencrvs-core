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
  ActionFormConditionalContext,
  EventDocument,
  EventDocumentConditionalContext
} from '@opencrvs/commons/client'

/**
 * The context of a form that has no event, e.g. the user form or the advanced search form.
 * It is the context of an action form without the event.
 */
export type EventlessFormConditionalContext = Omit<
  ActionFormConditionalContext,
  keyof EventDocumentConditionalContext
>

/**
 * The context for conditionals in a form.
 * An action form uses `ActionFormConditionalContext` from commons. A form without an event uses `EventlessFormConditionalContext`.
 */
export type FormConditionalContext =
  | ActionFormConditionalContext
  | EventlessFormConditionalContext

function hasEvent(
  context: FormConditionalContext
): context is ActionFormConditionalContext {
  return 'eventDocument' in context && context.eventDocument !== undefined
}

export function findEventDocument(
  context: FormConditionalContext
): EventDocument | undefined {
  return hasEvent(context) ? context.eventDocument : undefined
}

/**
 * Returns the context that the commons functions for action forms take.
 *
 * TODO: A form without an event calls the commons functions for action forms. Remove the cast when it evaluates its conditionals in the client. https://github.com/opencrvs/opencrvs-core/issues/14485
 * The form gets an empty event state. Its conditionals do not read the event, so the result does not change.
 */
export function toActionFormConditionalContext(
  context: FormConditionalContext
): ActionFormConditionalContext {
  if (hasEvent(context)) {
    return context
  }

  return {
    ...context,
    eventIndex: { flags: [], status: undefined, declaration: {} }
  } as unknown as ActionFormConditionalContext
}
