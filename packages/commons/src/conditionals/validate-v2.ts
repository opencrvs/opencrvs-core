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

import { ActionUpdate } from '../events/ActionDocument'
import { EventConfig } from '../events/EventConfig'
import { EventDocument } from '../events/EventDocument'
import { EventIndex } from '../events/EventIndex'
import { getCurrentEventState } from '../events/state'
import { getEventWithCompleteAcceptedActions } from '../events/utils'
import { EncodedScope, TokenUserType } from '../users/authentication'
import { UUID } from '../uuid'
import { isOnline, todayISO } from './validate'

/** Declaration conditionals read only the declaration. */
export type DeclarationFormValues = {
  declaration: ActionUpdate
  annotation?: never
}

/** Annotation conditionals read the declaration and the annotation. */
export type AnnotationFormValues = {
  declaration: ActionUpdate
  annotation: ActionUpdate
}

/**
 * `$form` merges the declaration and the annotation.
 * When you edit a declaration, merge the changes into it first.
 */
export type FormValues = DeclarationFormValues | AnnotationFormValues

export type UserConditionalContext = {
  /** Internal service tokens have no UUID, so `sub` is a string. */
  sub: string
  scope: EncodedScope[]
  role?: string
  userType: TokenUserType
}

/**
 * The event, as a full document. The event state is calculated from it.
 */
export type EventDocumentConditionalContext = {
  eventDocument: EventDocument
  eventConfig: EventConfig
  eventIndex?: never
}

/**
 * The event, as an event index. Use this only when the document is not available, e.g. for search results.
 * The declaration of an event index can miss secured fields.
 */
export type EventIndexConditionalContext = {
  eventIndex: Pick<EventIndex, 'flags' | 'status' | 'declaration'>
  eventDocument?: never
  eventConfig?: never
}

/**
 * Use @see EventDocumentConditionalContext when you can.
 * The event summary and the action menu use the event index from `event.search`. That index has no secured fields.
 */
export type EventConditionalContext =
  | EventDocumentConditionalContext
  | EventIndexConditionalContext

/**
 * The event index for each event document and event configuration.
 * The keys are weak, so an entry goes away when the document or the configuration is garbage collected.
 *
 * Single form may have multiple conditionals, so we cannot afford to calculate it each time.
 */
const eventIndexCache = new WeakMap<
  EventDocument,
  WeakMap<EventConfig, EventIndex>
>()

function getCachedEventIndex(
  eventDocument: EventDocument,
  eventConfig: EventConfig
): EventIndex {
  let indexesByConfig = eventIndexCache.get(eventDocument)
  if (!indexesByConfig) {
    indexesByConfig = new WeakMap()
    eventIndexCache.set(eventDocument, indexesByConfig)
  }

  const cached = indexesByConfig.get(eventConfig)
  if (cached) {
    return cached
  }

  const eventIndex = getCurrentEventState(eventDocument, eventConfig)
  indexesByConfig.set(eventConfig, eventIndex)

  return eventIndex
}

/**
 * The flags, the status and the stored declaration of the event.
 * All cases read them through this function, so they always come from the same source.
 *
 * NOTE: For an event document, the function caches the result. The same document and configuration objects give the same object. Do not change it.
 */
export function resolveEventState(
  context: EventConditionalContext
): Pick<EventIndex, 'flags' | 'status' | 'declaration'> {
  if (context.eventIndex) {
    return context.eventIndex
  }

  return getCachedEventIndex(context.eventDocument, context.eventConfig)
}

/** The parameters that every builder gives. */
export type EventIndexConditionalParameters = {
  /** The declaration and the annotation, merged. The annotation values win. */
  $form: ActionUpdate
  $flags: EventIndex['flags']
  $status: EventIndex['status']
  $now: string
  $online: boolean
}

/**
 * The parameters that every builder gives: the form, the event state and the time.
 * Use this function when a conditional reads only these, e.g. to decide whether a field is secured.
 * The declaration of an event index from `event.search` has no secured fields, so these conditionals must not read them.
 * @see buildActionFormConditionalParameters for the form of an action.
 * @see buildActionConditionalParameters to decide whether an action is available.
 * @see buildCertificateTemplateConditionalParameters to decide which certificate templates are available.
 */
export function buildEventIndexConditionalParameters(
  form: FormValues,
  context: EventConditionalContext
): EventIndexConditionalParameters {
  const { flags, status } = resolveEventState(context)

  return {
    $form: { ...form.declaration, ...form.annotation },
    $flags: flags,
    $status: status,
    $now: todayISO(),
    $online: isOnline()
  }
}

/** The user, and the ids of the leaf administrative areas that location conditionals read. */
export type UserAndLocationsConditionalContext = {
  user: UserConditionalContext
  leafAdminStructureLocationIds: Array<{ id: UUID }>
}

/**
 * The context for field visibility, field validation and page visibility in the form of an action.
 * Declaration actions and annotation actions use it.
 */
export type ActionFormConditionalContext = EventDocumentConditionalContext &
  UserAndLocationsConditionalContext

export type ActionFormConditionalParameters =
  EventIndexConditionalParameters & {
    $event: EventDocument
    $user: UserConditionalContext
    $leafAdminStructureLocationIds: Array<{ id: UUID }>
  }

export function buildActionFormConditionalParameters(
  form: FormValues,
  context: ActionFormConditionalContext
): ActionFormConditionalParameters {
  return {
    ...buildEventIndexConditionalParameters(form, context),
    // TODO: this should not affect all $events. https://github.com/opencrvs/opencrvs-core/issues/14485
    // A client form without an event reaches this through a cast, so the document can be missing.
    $event: context.eventDocument
      ? getEventWithCompleteAcceptedActions(context.eventDocument)
      : context.eventDocument,
    $user: context.user,
    $leafAdminStructureLocationIds: context.leafAdminStructureLocationIds
  }
}

/**
 * The context to decide whether an action is visible or enabled. `field()` reads the declaration of the current event state.
 *
 * The event can be an event index, e.g. in a workqueue where the event is not downloaded.
 * Then `$event` is not available. Pass a real event index, and put any changed values in the form, not in the index.
 */
export type ActionConditionalContext = EventConditionalContext & {
  user: UserConditionalContext
}

export type ActionConditionalParameters = EventIndexConditionalParameters & {
  /** The event document, or `undefined` when the context has only an event index. The key is required, so a builder cannot leave it out. */
  $event: EventDocument | undefined
  $user: UserConditionalContext
}

export function buildActionConditionalParameters(
  form: FormValues,
  context: ActionConditionalContext
): ActionConditionalParameters {
  return {
    ...buildEventIndexConditionalParameters(form, context),
    // TODO: this should not affect all $events. https://github.com/opencrvs/opencrvs-core/issues/14485
    $event: context.eventDocument
      ? getEventWithCompleteAcceptedActions(context.eventDocument)
      : undefined,
    $user: context.user
  }
}

/**
 * The context to decide which certificate templates are available for printing.
 */
export type CertificateTemplateConditionalContext =
  EventDocumentConditionalContext

export type CertificateTemplateConditionalParameters =
  EventIndexConditionalParameters & {
    $event: EventDocument
  }

export function buildCertificateTemplateConditionalParameters(
  form: FormValues,
  context: CertificateTemplateConditionalContext
): CertificateTemplateConditionalParameters {
  return {
    ...buildEventIndexConditionalParameters(form, context),
    // TODO: this should not affect all $events. https://github.com/opencrvs/opencrvs-core/issues/14485
    $event: getEventWithCompleteAcceptedActions(context.eventDocument)
  }
}

/**
 * The context of a serialised client function, e.g. a validator, a default value or a synced value.
 * A client function can run without an event, e.g. in a user form. Then the context has only the user and the locations.
 */
export type ClientFunctionConditionalContext =
  UserAndLocationsConditionalContext & (EventConditionalContext | {})

/** Returns `true` if the context of a client function has an event. */
export function hasClientFunctionEvent(
  context: ClientFunctionConditionalContext
): context is ClientFunctionConditionalContext & EventConditionalContext {
  return 'eventDocument' in context || 'eventIndex' in context
}
