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
 * Conditional parameter $form is a combination of declaration and annotation.
 * If you are editing existing event declaration, include a version where current changes are merged in.
 */
export type FormValues = DeclarationFormValues | AnnotationFormValues

export type UserConditionalContext = {
  /** In system-wide context internal service tokens do not have UUID. */
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
 *  NOTE: Always prefer @see EventDocumentConditionalContext over @see EventIndexConditionalContext.
 *  Some functionality like Event summary and action menu depend on declaration coming from event.search endpoint.
 *  event.search might not have all the properties available when field has secured: true.
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
  if ('eventIndex' in context) {
    return context.eventIndex
  }

  return getCachedEventIndex(context.eventDocument, context.eventConfig)
}

/** Parameters that every context has. */
type CommonConditionalParameters = {
  /** Combination of previous declaration (if available), current declaration and annotation (if available) */
  $form: ActionUpdate
  $flags: EventIndex['flags']
  $status: EventIndex['status']
  $now: string
  $online: boolean
}

/**
 * @private - Build Conditional parameters based on your need.
 * @see buildActionFormConditionalParameters when user is performing actions
 * @see buildActionConditionalParameters when deciding if action is available
 * @see buildSecuredConditionalParameters when evaluating if field is secured
 * @see buildCertificateTemplateConditionalParameters when evaluating which templates are available.
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

/*
 * ActionForm: field visibility, field validation and page visibility in the form of one action. Used by declaration and annotation actions.
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
    // TODO: this should not affect all $events. https://github.com/opencrvs/opencrvs-core/issues/14485
    $event: context.eventDocument
      ? getEventWithCompleteAcceptedActions(context.eventDocument)
      : context.eventDocument,
    $user: context.user,
    $leafAdminStructureLocationIds: context.leafAdminStructureLocationIds
  }
}

/**
 * ActionConditional: whether an action is visible or enabled. field('..') targets current state declaration.
 */
export type ActionConditionalContext = EventDocumentConditionalContext & {
  user: UserConditionalContext
}

export type ActionConditionalParameters = CommonConditionalParameters & {
  $event: EventDocument
  $user: UserConditionalContext
}

export function buildActionConditionalParameters(
  form: FormValues,
  context: ActionConditionalContext
): ActionConditionalParameters {
  return {
    ...buildCommonConditionalParameters(form, context),
    // TODO: this should not affect all $events. https://github.com/opencrvs/opencrvs-core/issues/14485
    $event: context.eventDocument
      ? getEventWithCompleteAcceptedActions(context.eventDocument)
      : context.eventDocument,
    $user: context.user
  }
}

/**
 * CertificateTemplate: which certificate templates are available for printing.
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
    // TODO: this should not affect all $events. https://github.com/opencrvs/opencrvs-core/issues/14485
    $event: context.eventDocument
      ? getEventWithCompleteAcceptedActions(context.eventDocument)
      : context.eventDocument
  }
}

/**
 * Secured: whether a field is secured and removed from event.search payload.
 * Accepts EventIndex over EventDocument since it is never available to it.
 */
export type SecuredConditionalContext = EventIndexConditionalContext

export type SecuredConditionalParameters = CommonConditionalParameters

export function buildSecuredConditionalParameters(
  form: FormValues,
  context: SecuredConditionalContext
): SecuredConditionalParameters {
  return buildCommonConditionalParameters(form, context)
}
