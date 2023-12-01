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
  EVENT_TYPE,
  CHILD_SECTION_CODE,
  DECEASED_SECTION_CODE,
  GROOM_SECTION_CODE,
  BRIDE_SECTION_CODE,
  BIRTH_REG_NUMBER_SYSTEM,
  DEATH_REG_NUMBER_SYSTEM,
  MARRIAGE_REG_NUMBER_SYSTEM
} from '@workflow/features/registration/fhir/constants'

// TODO: Change these event names to be closer in definition to the comments
// https://jembiprojects.jira.com/browse/OCRVS-2767
export enum Events {
  // Correction events
  BIRTH_MAKE_CORRECTION = '/events/birth/make-correction',
  DEATH_MAKE_CORRECTION = '/events/death/make-correction',
  MARRIAGE_MAKE_CORRECTION = '/events/marriage/make-correction',

  BIRTH_IN_PROGRESS_DEC = '/events/birth/in-progress-declaration', // Field agent or DHIS2in progress declaration
  BIRTH_NEW_DEC = '/events/birth/new-declaration', // Field agent completed declaration
  BIRTH_REQUEST_FOR_REGISTRAR_VALIDATION = '/events/birth/request-for-registrar-validation', // Registration agent new declaration
  BIRTH_WAITING_EXTERNAL_RESOURCE_VALIDATION = '/events/birth/waiting-external-resource-validation',
  REGISTRAR_BIRTH_REGISTRATION_WAITING_EXTERNAL_RESOURCE_VALIDATION = '/events/birth/registrar-registration-waiting-external-resource-validation', // Registrar new registration declaration
  BIRTH_MARK_REG = '/events/birth/mark-registered',
  BIRTH_MARK_VALID = '/events/birth/mark-validated',
  BIRTH_MARK_CERT = '/events/birth/mark-certified',
  BIRTH_MARK_ISSUE = '/events/birth/mark-issued',
  BIRTH_MARK_VOID = '/events/birth/mark-voided',
  BIRTH_MARK_ARCHIVED = '/events/birth/mark-archived',
  BIRTH_MARK_REINSTATED = '/events/birth/mark-reinstated',
  DEATH_IN_PROGRESS_DEC = '/events/death/in-progress-declaration', /// Field agent or DHIS2in progress declaration
  DEATH_NEW_DEC = '/events/death/new-declaration', // Field agent completed declaration
  DEATH_REQUEST_FOR_REGISTRAR_VALIDATION = '/events/death/request-for-registrar-validation', // Registration agent new declaration
  DEATH_WAITING_EXTERNAL_RESOURCE_VALIDATION = '/events/death/waiting-external-resource-validation',
  REGISTRAR_DEATH_REGISTRATION_WAITING_EXTERNAL_RESOURCE_VALIDATION = '/events/death/registrar-registration-waiting-external-resource-validation', // Registrar new registration declaration
  DEATH_MARK_REG = '/events/death/mark-registered',
  DEATH_MARK_VALID = '/events/death/mark-validated',
  DEATH_MARK_CERT = '/events/death/mark-certified',
  DEATH_MARK_ISSUE = '/events/death/mark-issued',
  DEATH_MARK_VOID = '/events/death/mark-voided',
  DEATH_MARK_ARCHIVED = '/events/death/mark-archived',
  DEATH_MARK_REINSTATED = '/events/death/mark-reinstated',
  MARRIAGE_IN_PROGRESS_DEC = '/events/marriage/in-progress-declaration', /// Field agent or DHIS2in progress declaration
  MARRIAGE_NEW_DEC = '/events/marriage/new-declaration', // Field agent completed declaration
  MARRIAGE_REQUEST_FOR_REGISTRAR_VALIDATION = '/events/marriage/request-for-registrar-validation', // Registration agent new declaration
  MARRIAGE_WAITING_EXTERNAL_RESOURCE_VALIDATION = '/events/marriage/waiting-external-resource-validation',
  REGISTRAR_MARRIAGE_REGISTRATION_WAITING_EXTERNAL_RESOURCE_VALIDATION = '/events/marriage/registrar-registration-waiting-external-resource-validation', // Registrar new registration declaration
  MARRIAGE_MARK_REG = '/events/marriage/mark-registered',
  MARRIAGE_MARK_VALID = '/events/marriage/mark-validated',
  MARRIAGE_MARK_CERT = '/events/marriage/mark-certified',
  MARRIAGE_MARK_ISSUE = '/events/marriage/mark-issued',
  MARRIAGE_MARK_VOID = '/events/marriage/mark-voided',
  MARRIAGE_MARK_ARCHIVED = '/events/marriage/mark-archived',
  MARRIAGE_MARK_REINSTATED = '/events/marriage/mark-reinstated',
  DECLARATION_UPDATED = '/events/declaration-updated', // Registration agent or registrar updating declaration before validating/registering
  EVENT_NOT_DUPLICATE = '/events/not-duplicate',
  DOWNLOADED = '/events/downloaded',
  ASSIGNED_EVENT = '/events/assigned',
  UNASSIGNED_EVENT = '/events/unassigned',
  VERIFIED_EVENT = '/events/verified',
  UNKNOWN = 'unknown',
  VIEWED = '/events/viewed',
  MARKED_AS_DUPLICATE = '/events/marked-as-duplicate'
}

export const SECTION_CODE: Record<EVENT_TYPE, string[]> = {
  [EVENT_TYPE.BIRTH]: [CHILD_SECTION_CODE],
  [EVENT_TYPE.DEATH]: [DECEASED_SECTION_CODE],
  [EVENT_TYPE.MARRIAGE]: [GROOM_SECTION_CODE, BRIDE_SECTION_CODE]
}

export const REG_NUMBER_SYSTEM: Record<EVENT_TYPE, string> = {
  [EVENT_TYPE.BIRTH]: BIRTH_REG_NUMBER_SYSTEM,
  [EVENT_TYPE.DEATH]: DEATH_REG_NUMBER_SYSTEM,
  [EVENT_TYPE.MARRIAGE]: MARRIAGE_REG_NUMBER_SYSTEM
}

export const MARK_REG: Record<EVENT_TYPE, Events> = {
  [EVENT_TYPE.BIRTH]: Events.BIRTH_MARK_REG,
  [EVENT_TYPE.DEATH]: Events.DEATH_MARK_REG,
  [EVENT_TYPE.MARRIAGE]: Events.MARRIAGE_MARK_REG
}
