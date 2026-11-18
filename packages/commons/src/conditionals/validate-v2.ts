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

/**
 * Conditional parameter $form is a combination of declaration and annotation.
 * If you are editing existing event declaration, include a version where current changes are merged in.
 */
export type FormValues = {
  declaration: ActionUpdate
  annotation: ActionUpdate
}

/**
 * The user who performs the action.
 */
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
 *  event.search might not have all the properties available, if field has secured: true. When
 */
export type EventConditionalContext =
  | EventDocumentConditionalContext
  | EventIndexConditionalContext

/**
 * The flags, the status and the stored declaration of the event.
 * All cases read them through this function, so they always come from the same source.
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
 * @see buildActionConditionalContext when deciding if action is available
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
 * ActionForm: field visibility, field validation and page visibility in the form of one action.
 * `eventDocument` contains the actions before the current action.
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
 * ActionConditional: whether an action is shown (SHOW) or enabled (ENABLE).
 * `eventDocument` contains the actions before the current action.
 */
export type ActionConditionalContext = EventDocumentConditionalContext

export type ActionConditionalParameters = CommonConditionalParameters & {
  $event: EventDocument
}

export function buildActionConditionalParameters(
  form: FormValues,
  context: ActionConditionalContext
): ActionConditionalParameters {
  return {
    ...buildCommonConditionalParameters(form, context),
    $event: context.eventDocument
  }
}

/**
 * CertificateTemplate: which certificate templates are available.
 * Templates are chosen in the PRINT_CERTIFICATE action. `eventDocument` contains the actions before that action.
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
 * Secured: whether a field is secured and removed from event.search payload.
 * Accepts EventIndex over EventDocument since it is never available to it.
 */
export type SecuredConditionalContext = EventConditionalContext

export type SecuredConditionalParameters = CommonConditionalParameters

export function buildSecuredConditionalParameters(
  form: FormValues,
  context: SecuredConditionalContext
): SecuredConditionalParameters {
  return buildCommonConditionalParameters(form, context)
}
