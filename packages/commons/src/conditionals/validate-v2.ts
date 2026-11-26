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
}

/**
 * The event, as an event index. Use this only when the document is not available, e.g. for search results.
 * The declaration of an event index can miss secured fields.
 */
export type EventIndexConditionalContext = {
  eventIndex: Pick<EventIndex, 'flags' | 'status' | 'declaration'>
}

/**
 * Use @see EventDocumentConditionalContext when you can.
 * The event summary and the action menu use the event index from `event.search`. That index has no secured fields.
 */
export type EventConditionalContext =
  | EventDocumentConditionalContext
  | EventIndexConditionalContext

/**
 * The flags, the status and the stored declaration of the event.
 * All cases read them through this function, so they always come from the same source.
 *
 * TODO: Add a cache for `getCurrentEventState`, with the event document as the key. https://github.com/opencrvs/opencrvs-core/issues/14485
 * With an event document, each conditional call calculates the event state again.
 * The client form evaluates conditionals for each field on each render, so the time adds up.
 */
export function resolveEventState(
  context: EventConditionalContext
): Pick<EventIndex, 'flags' | 'status' | 'declaration'> {
  if ('eventIndex' in context) {
    return context.eventIndex
  }

  return getCurrentEventState(context.eventDocument, context.eventConfig)
}

/** Parameters that every context has. */
type CommonConditionalParameters = {
  /** The declaration and the annotation, merged. The annotation values win. */
  $form: ActionUpdate
  $flags: EventIndex['flags']
  $status: EventIndex['status']
  $now: string
  $online: boolean
}

/**
 * @private Use one of these functions:
 * @see buildActionFormConditionalParameters for the form of an action.
 * @see buildActionConditionalParameters to decide whether an action is available.
 * @see buildSecuredConditionalParameters to decide whether a field is secured.
 * @see buildCertificateTemplateConditionalParameters to decide which certificate templates are available.
 */
function buildCommonConditionalParameters(
  form: FormValues,
  context: EventConditionalContext
): CommonConditionalParameters {
  const { flags, status } = resolveEventState(context)

  return {
    $form: { ...form.declaration, ...form.annotation },
    $flags: flags,
    $status: status,
    $now: todayISO(),
    $online: isOnline()
  }
}

/**
 * The context for field visibility, field validation and page visibility in the form of an action.
 * Declaration actions and annotation actions use it.
 */
export type ActionFormConditionalContext = EventDocumentConditionalContext & {
  user: UserConditionalContext
  leafAdminStructureLocationIds: Array<{ id: UUID }>
}

export type ActionFormConditionalParameters = CommonConditionalParameters & {
  $event: EventDocument
  $user: UserConditionalContext
  $leafAdminStructureLocationIds: Array<{ id: UUID }>
}

export function buildActionFormConditionalParameters(
  form: FormValues,
  context: ActionFormConditionalContext
): ActionFormConditionalParameters {
  return {
    ...buildCommonConditionalParameters(form, context),
    $event: context.eventDocument,
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

export type ActionConditionalParameters = CommonConditionalParameters & {
  // @todo: should be stricter.
  $event?: EventDocument
  $user: UserConditionalContext
}

export function buildActionConditionalParameters(
  form: FormValues,
  context: ActionConditionalContext
): ActionConditionalParameters {
  return {
    ...buildCommonConditionalParameters(form, context),
    $event: 'eventDocument' in context ? context.eventDocument : undefined,
    $user: context.user
  }
}

/**
 * The context to decide which certificate templates are available for printing.
 */
export type CertificateTemplateConditionalContext =
  EventDocumentConditionalContext

export type CertificateTemplateConditionalParameters =
  CommonConditionalParameters & {
    $event: EventDocument
  }

export function buildCertificateTemplateConditionalParameters(
  form: FormValues,
  context: CertificateTemplateConditionalContext
): CertificateTemplateConditionalParameters {
  return {
    ...buildCommonConditionalParameters(form, context),
    $event: context.eventDocument
  }
}

/**
 * The context to decide whether a field is secured. The `event.search` payload does not include a secured field.
 * It takes an event index, because the search index never has the event document.
 */
export type SecuredConditionalContext = EventIndexConditionalContext

export type SecuredConditionalParameters = CommonConditionalParameters

export function buildSecuredConditionalParameters(
  form: FormValues,
  context: SecuredConditionalContext
): SecuredConditionalParameters {
  return buildCommonConditionalParameters(form, context)
}

/**
 * The context of a serialised client function, e.g. a validator, a default value or a synced value.
 * A client function can run without an event, e.g. in a user form. Then the context has only the user and the locations.
 */
export type ClientFunctionConditionalContext = {
  user: UserConditionalContext
  leafAdminStructureLocationIds: Array<{ id: UUID }>
} & (EventConditionalContext | {})

/** Returns `true` if the context of a client function has an event. */
export function hasClientFunctionEvent(
  context: ClientFunctionConditionalContext
): context is ClientFunctionConditionalContext & EventConditionalContext {
  return 'eventDocument' in context || 'eventIndex' in context
}
