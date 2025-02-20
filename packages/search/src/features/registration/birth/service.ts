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
  BirthDocument,
  NAME_EN,
  composeOperationHistories,
  createStatusHistory,
  composeAssignment
} from '@search/elasticsearch/utils'
import {
  findEntry,
  findName,
  findNameLocale,
  findTaskExtension,
  findTaskIdentifier,
  addEventLocation,
  updateCompositionBodyWithDuplicateIds
} from '@search/features/fhir/fhir-utils'
import { getOrCreateClient } from '@search/elasticsearch/client'
import {
  getComposition,
  SavedComposition,
  Patient,
  getFromBundleById,
  getTaskFromSavedBundle,
  resourceIdentifierToUUID,
  SavedRelatedPerson,
  findFirstTaskHistory,
  SavedBundle,
  getBusinessStatus,
  getInformantType,
  ValidRecord,
  EVENT,
  IOperationHistory,
  REJECTED_STATUS,
  getLastStatusChangedAt
} from '@opencrvs/commons/types'
import { findAssignment } from '@opencrvs/commons/assignment'
import { findPatientPrimaryIdentifier } from '@search/features/search/utils'

const MOTHER_CODE = 'mother-details'
const FATHER_CODE = 'father-details'
const INFORMANT_CODE = 'informant-details'
const CHILD_CODE = 'child-details'
const BIRTH_ENCOUNTER_CODE = 'birth-encounter'

export async function indexRecord(record: SavedBundle) {
  const client = getOrCreateClient()

  const { id: compositionId } = getComposition(record)
  const existingDocument = await searchByCompositionId(compositionId, client)
  const document = composeDocument(record, existingDocument)
  await indexComposition(compositionId, document, client)
}

export const composeDocument = (
  record: SavedBundle,
  existingDocument?: Awaited<ReturnType<typeof searchByCompositionId>>
) => {
  const task = getTaskFromSavedBundle(record)
  const composition = getComposition(record)

  const body: BirthDocument = {
    compositionId: composition.id,
    event: EVENT.BIRTH,
    createdAt:
      existingDocument?.body?.hits?.hits?.[0]?._source?.createdAt ||
      Date.now().toString(),
    modifiedAt: Date.now().toString(),
    operationHistories: composeOperationHistories(record) as IOperationHistory[]
  }

  body.type = getBusinessStatus(task)
  body.modifiedAt = Date.now().toString()

  if (body.type === REJECTED_STATUS) {
    const rejectAnnotation: fhir.Annotation = (task &&
      task.note &&
      Array.isArray(task.note) &&
      task.note.length > 0 &&
      task.note[task.note.length - 1]) || { text: '' }
    const nodeText = rejectAnnotation.text
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
    resourceIdentifierToUUID(regLastUserIdentifier.valueReference.reference)

  createIndexBody(body, composition, record)
  updateCompositionBodyWithDuplicateIds(composition, body)
  return body
}

function createIndexBody(
  body: BirthDocument,
  composition: SavedComposition,
  bundle: SavedBundle
) {
  createChildIndex(body, composition, bundle)
  addEventLocation(bundle, body, BIRTH_ENCOUNTER_CODE)
  createMotherIndex(body, composition, bundle)
  createFatherIndex(body, composition, bundle)
  createInformantIndex(body, composition, bundle)
  createDeclarationIndex(body, composition, bundle)
  const task = getTaskFromSavedBundle(bundle)
  createStatusHistory(body, task)

  const assignment = findAssignment(bundle)
  body.assignment =
    assignment &&
    composeAssignment(
      assignment.office,
      assignment.practitioner,
      assignment.createdAt
    )
}

function createChildIndex(
  body: BirthDocument,
  composition: SavedComposition,
  bundle: SavedBundle
) {
  const child = findEntry<Patient>(CHILD_CODE, composition, bundle)

  if (!child) {
    return
  }

  const childName = findName(NAME_EN, child.name)
  const childNameLocal = findNameLocale(child.name)

  body.childIdentifier = findPatientPrimaryIdentifier(child)?.value
  body.childFirstNames = childName?.given?.at(0)
  body.childMiddleName = childName?.given?.at(1)
  body.childFamilyName = childName?.family
  body.childFirstNamesLocal = childNameLocal?.given?.at(0)
  body.childMiddleNameLocal = childNameLocal?.given?.at(1)
  // what happens if country demands name like : familyName firstName
  body.name =
    (body.childFirstNames || '') +
    ' ' +
    (body.childMiddleName || '') +
    ' ' +
    (body.childFamilyName || '')

  body.childFamilyNameLocal = childNameLocal?.family
  body.childDoB = child.birthDate
  body.gender = child.gender
}

function createMotherIndex(
  body: BirthDocument,
  composition: SavedComposition,
  bundle: SavedBundle
) {
  const mother = findEntry<Patient>(MOTHER_CODE, composition, bundle)

  if (!mother) {
    return
  }

  const motherName = findName(NAME_EN, mother.name)
  const motherNameLocal = findNameLocale(mother.name)

  body.motherFirstNames = motherName?.given?.at(0)
  body.motherMiddleName = motherName?.given?.at(1)
  body.motherFamilyName = motherName?.family
  body.motherFirstNamesLocal = motherNameLocal?.given?.at(0)
  body.motherMiddleNameLocal = motherNameLocal?.given?.at(1)
  body.motherFamilyNameLocal = motherNameLocal?.family
  body.motherDoB = mother.birthDate
  body.motherIdentifier = findPatientPrimaryIdentifier(mother)?.value
}

function createFatherIndex(
  body: BirthDocument,
  composition: SavedComposition,
  bundle: SavedBundle
) {
  const father = findEntry<Patient>(FATHER_CODE, composition, bundle)

  if (!father) {
    return
  }

  const fatherName = findName(NAME_EN, father.name)
  const fatherNameLocal = findNameLocale(father.name)

  body.fatherFirstNames = fatherName?.given?.at(0)
  body.fatherMiddleName = fatherName?.given?.at(1)
  body.fatherFamilyName = fatherName?.family
  body.fatherFirstNamesLocal = fatherNameLocal?.given?.at(0)
  body.fatherMiddleNameLocal = fatherNameLocal?.given?.at(1)
  body.fatherFamilyNameLocal = fatherNameLocal?.family
  body.fatherDoB = father.birthDate
  body.fatherIdentifier = findPatientPrimaryIdentifier(father)?.value
}

function createInformantIndex(
  body: BirthDocument,
  composition: SavedComposition,
  bundle: SavedBundle
) {
  const informantRef = findEntry<SavedRelatedPerson>(
    INFORMANT_CODE,
    composition,
    bundle
  )

  if (!informantRef || !informantRef.patient) {
    return
  }

  const informant = getFromBundleById<Patient>(
    bundle,
    resourceIdentifierToUUID(informantRef.patient.reference)
  )?.resource

  if (!informant) {
    return
  }

  const informantName = findName(NAME_EN, informant.name)
  const informantNameLocal = findNameLocale(informant.name)

  body.informantFirstNames = informantName?.given?.at(0)
  body.informantMiddleName = informantName?.given?.at(1)
  body.informantFamilyName = informantName?.family
  body.informantFirstNamesLocal = informantNameLocal?.given?.at(0)
  body.informantMiddleNameLocal = informantNameLocal?.given?.at(1)
  body.informantFamilyNameLocal = informantNameLocal?.family
  body.informantDoB = informant.birthDate
  body.informantIdentifier = findPatientPrimaryIdentifier(informant)?.value
}

function createDeclarationIndex(
  body: BirthDocument,
  composition: SavedComposition,
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
    'http://opencrvs.org/specs/id/birth-tracking-id'
  )

  const registrationNumberIdentifier = findTaskIdentifier(
    task,
    'http://opencrvs.org/specs/id/birth-registration-number'
  )

  const regLastUserIdentifier = findTaskExtension(
    task,
    'http://opencrvs.org/specs/extension/regLastUser'
  )

  const regLastUser =
    regLastUserIdentifier &&
    resourceIdentifierToUUID(regLastUserIdentifier.valueReference.reference)

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
  body.type = task && getBusinessStatus(task)
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
    (compositionTypeCode && compositionTypeCode.code) || 'birth-declaration'

  const firstTaskHistory = findFirstTaskHistory(bundle)

  body.lastStatusChangedAt = getLastStatusChangedAt(bundle, task)

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
}
