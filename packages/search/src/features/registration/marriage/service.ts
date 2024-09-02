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
  indexComposition,
  searchByCompositionId
} from '@search/elasticsearch/dbhelper'
import {
  createStatusHistory,
  MarriageDocument,
  NAME_EN,
  composeOperationHistories,
  composeAssignment
} from '@search/elasticsearch/utils'
import {
  findEntry,
  findName,
  findNameLocale,
  findTaskExtension,
  findTaskIdentifier,
  addEventLocation,
  findExtension
} from '@search/features/fhir/fhir-utils'
import { OPENCRVS_SPECIFICATION_URL } from '@search/constants'
import { getOrCreateClient } from '@search/elasticsearch/client'
import {
  getComposition,
  SavedComposition,
  getFromBundleById,
  getTaskFromSavedBundle,
  Patient,
  SavedBundle,
  resourceIdentifierToUUID,
  SavedRelatedPerson,
  findFirstTaskHistory,
  getInformantType,
  ValidRecord,
  EVENT,
  SearchDocument,
  IOperationHistory,
  REJECTED_STATUS,
  getLastStatusChangedAt
} from '@opencrvs/commons/types'
import { findAssignment } from '@opencrvs/commons/assignment'
import { findPatientPrimaryIdentifier } from '@search/features/search/utils'

const BRIDE_CODE = 'bride-details'
const GROOM_CODE = 'groom-details'
const WITNESS_ONE_CODE = 'witness-one-details'
const WITNESS_TWO_CODE = 'witness-two-details'
const MARRIAGE_ENCOUNTER_CODE = 'marriage-encounter'

export const composeDocument = (
  bundle: SavedBundle,
  existingDocument?: Awaited<ReturnType<typeof searchByCompositionId>>
) => {
  const task = getTaskFromSavedBundle(bundle)
  const composition = getComposition(bundle)
  const body: SearchDocument = {
    compositionId: composition.id,
    event: EVENT.MARRIAGE,
    createdAt:
      existingDocument?.body?.hits?.hits?.[0]?._source?.createdAt ||
      Date.now().toString(),
    operationHistories: composeOperationHistories(bundle) as IOperationHistory[]
  }

  body.type =
    task &&
    task.businessStatus &&
    task.businessStatus.coding &&
    task.businessStatus.coding[0].code
  body.modifiedAt = Date.now().toString()

  if (body.type === REJECTED_STATUS) {
    const nodeText =
      (task && task.note && task.note[0].text && task.note[0].text) || ''
    body.rejectReason =
      (task && task.statusReason && task.statusReason.text) || ''
    body.rejectComment = nodeText
  }

  const regLastUserIdentifier = findTaskExtension(
    task,
    'http://opencrvs.org/specs/extension/regLastUser'
  )

  body.updatedBy =
    regLastUserIdentifier &&
    regLastUserIdentifier.valueReference &&
    regLastUserIdentifier.valueReference.reference &&
    regLastUserIdentifier.valueReference.reference.split('/')[1]

  createIndexBody(body, composition, bundle)
  return body
}

export async function indexRecord(bundle: SavedBundle) {
  const client = getOrCreateClient()

  const { id: compositionId } = getComposition(bundle)
  const existingDocument = await searchByCompositionId(compositionId, client)
  const document = composeDocument(bundle, existingDocument)
  await indexComposition(compositionId, document, client)
}

function createIndexBody(
  body: MarriageDocument,
  composition: SavedComposition,
  bundle: SavedBundle
) {
  createBrideIndex(body, composition, bundle)
  createGroomIndex(body, composition, bundle)
  createWitnessOneIndex(body, composition, bundle)
  createWitnessTwoIndex(body, composition, bundle)
  addEventLocation(bundle, body, MARRIAGE_ENCOUNTER_CODE)
  createDeclarationIndex(body, composition, bundle)
  const task = getTaskFromSavedBundle(bundle)
  createStatusHistory(body, task)

  const assignment = findAssignment(bundle)
  body.assignment =
    assignment && composeAssignment(assignment.office, assignment.practitioner)
}

function createBrideIndex(
  body: MarriageDocument,
  composition: SavedComposition,
  bundle: SavedBundle
) {
  const bride = findEntry<Patient>(BRIDE_CODE, composition, bundle)

  const marriageExtension = findExtension(
    `${OPENCRVS_SPECIFICATION_URL}extension/date-of-marriage`,
    bride?.extension
  )

  const brideName = bride && findName(NAME_EN, bride.name)
  const brideNameLocal = bride && findNameLocale(bride.name)

  body.brideFirstNames = brideName?.given?.at(0)
  body.brideMiddleName = brideName?.given?.at(1)
  body.brideFamilyName = brideName?.family
  body.brideFirstNamesLocal = brideNameLocal?.given?.at(0)
  body.brideMiddleNameLocal = brideNameLocal?.given?.at(1)
  body.brideFamilyNameLocal = brideNameLocal?.family
  if (marriageExtension) {
    body.marriageDate = marriageExtension.valueDateTime
  }

  body.brideIdentifier = bride && findPatientPrimaryIdentifier(bride)?.value
  body.brideDoB = bride && bride.birthDate
}

function createGroomIndex(
  body: MarriageDocument,
  composition: SavedComposition,
  bundle: SavedBundle
) {
  const groom = findEntry<Patient>(GROOM_CODE, composition, bundle)

  const marriageExtension = findExtension(
    `${OPENCRVS_SPECIFICATION_URL}extension/date-of-marriage`,
    groom?.extension
  )

  const groomName = groom && findName(NAME_EN, groom.name)
  const groomNameLocal = groom && findNameLocale(groom.name)

  body.groomFirstNames = groomName?.given?.at(0)
  body.groomMiddleName = groomName?.given?.at(1)
  body.groomFamilyName = groomName?.family
  body.groomFirstNamesLocal = groomNameLocal?.given?.at(0)
  body.groomMiddleNameLocal = groomNameLocal?.given?.at(1)
  body.groomFamilyNameLocal = groomNameLocal?.family

  if (marriageExtension) {
    body.marriageDate = marriageExtension.valueDateTime
  }

  body.groomIdentifier = groom && findPatientPrimaryIdentifier(groom)?.value
  body.groomDoB = groom && groom.birthDate
}

function createWitnessOneIndex(
  body: MarriageDocument,
  composition: SavedComposition,
  bundle: SavedBundle
) {
  const witnessRef = findEntry<SavedRelatedPerson>(
    WITNESS_ONE_CODE,
    composition,
    bundle
  )

  if (!witnessRef || !witnessRef.patient) {
    return
  }

  const witness = getFromBundleById<Patient>(
    bundle,
    resourceIdentifierToUUID(witnessRef.patient.reference)
  ).resource

  if (!witness) {
    return
  }

  const witnessName = findName(NAME_EN, witness.name)
  const witnessNameLocal = findNameLocale(witness.name)

  body.witnessOneFirstNames = witnessName?.given?.at(0)
  body.witnessOneMiddleName = witnessName?.given?.at(1)
  body.witnessOneFamilyName = witnessName?.family
  body.witnessOneFirstNamesLocal = witnessNameLocal?.given?.at(0)
  body.witnessOneMiddleNameLocal = witnessNameLocal?.given?.at(1)
  body.witnessOneFamilyNameLocal = witnessNameLocal?.family
}

function createWitnessTwoIndex(
  body: MarriageDocument,
  composition: SavedComposition,
  bundle: SavedBundle
) {
  const witnessRef = findEntry<SavedRelatedPerson>(
    WITNESS_TWO_CODE,
    composition,
    bundle
  )

  if (!witnessRef || !witnessRef.patient) {
    return
  }

  const witness = getFromBundleById<Patient>(
    bundle,
    resourceIdentifierToUUID(witnessRef.patient.reference)
  ).resource

  if (!witness) {
    return
  }

  const witnessName = findName(NAME_EN, witness.name)
  const witnessNameLocal = findNameLocale(witness.name)
  body.witnessTwoFirstNames = witnessName?.given?.at(0)
  body.witnessTwoMiddleName = witnessName?.given?.at(1)
  body.witnessTwoFamilyName = witnessName?.family
  body.witnessTwoFirstNamesLocal = witnessNameLocal?.given?.at(0)
  body.witnessTwoMiddleNameLocal = witnessNameLocal?.given?.at(1)
  body.witnessTwoFamilyNameLocal = witnessNameLocal?.family
}

function createDeclarationIndex(
  body: MarriageDocument,
  composition: fhir.Composition,
  bundle: SavedBundle
) {
  const task = getTaskFromSavedBundle(bundle)
  const contactPersonExtention = findTaskExtension(
    task,
    'http://opencrvs.org/specs/extension/contact-person'
  )
  const contactPersonRelationshipExtention = findTaskExtension(
    task,
    'http://opencrvs.org/specs/extension/contact-relationship'
  )
  const contactNumberExtension = findTaskExtension(
    task,
    'http://opencrvs.org/specs/extension/contact-person-phone-number'
  )
  const emailExtension = findTaskExtension(
    task,
    'http://opencrvs.org/specs/extension/contact-person-email'
  )
  const placeOfDeclarationExtension = findTaskExtension(
    task,
    'http://opencrvs.org/specs/extension/regLastOffice'
  )

  const trackingIdIdentifier = findTaskIdentifier(
    task,
    'http://opencrvs.org/specs/id/marriage-tracking-id'
  )
  const registrationNumberIdentifier = findTaskIdentifier(
    task,
    'http://opencrvs.org/specs/id/marriage-registration-number'
  )

  const regLastUserIdentifier = findTaskExtension(
    task,
    'http://opencrvs.org/specs/extension/regLastUser'
  )

  const regLastUser =
    regLastUserIdentifier &&
    regLastUserIdentifier.valueReference &&
    regLastUserIdentifier.valueReference.reference &&
    regLastUserIdentifier.valueReference.reference.split('/')[1]

  const compositionTypeCode =
    composition.type.coding &&
    composition.type.coding.find(
      (code) => code.system === 'http://opencrvs.org/doc-types'
    )

  const otherInformantType =
    (contactPersonRelationshipExtention &&
      contactPersonRelationshipExtention.valueString) ||
    (contactPersonExtention && contactPersonExtention.valueString)

  const informantType = getInformantType(bundle as ValidRecord)

  body.informantType = informantType || otherInformantType
  body.contactNumber =
    contactNumberExtension && contactNumberExtension.valueString
  body.contactEmail = emailExtension && emailExtension.valueString
  body.type =
    task &&
    task.businessStatus &&
    task.businessStatus.coding &&
    task.businessStatus.coding[0].code
  body.dateOfDeclaration = task && task.lastModified
  body.trackingId = trackingIdIdentifier && trackingIdIdentifier.value
  body.registrationNumber =
    registrationNumberIdentifier && registrationNumberIdentifier.value
  body.declarationLocationId =
    placeOfDeclarationExtension &&
    placeOfDeclarationExtension.valueReference &&
    placeOfDeclarationExtension.valueReference.reference &&
    placeOfDeclarationExtension.valueReference.reference.split('/')[1]
  body.declarationJurisdictionIds = body.declarationLocationId
    ? [body.declarationLocationId]
    : []

  body.compositionType =
    (compositionTypeCode && compositionTypeCode.code) || 'marriage-declaration'

  const firstTaskHistory = findFirstTaskHistory(bundle)
  const firstRegLastUserExtension =
    firstTaskHistory &&
    findTaskExtension(
      firstTaskHistory,
      'http://opencrvs.org/specs/extension/regLastUser'
    )
  const firstRegLastUser =
    firstRegLastUserExtension &&
    resourceIdentifierToUUID(firstRegLastUserExtension.valueReference.reference)

  body.createdBy = firstRegLastUser || regLastUser
  body.updatedBy = regLastUser

  body.lastStatusChangedAt = getLastStatusChangedAt(bundle, task)
}
