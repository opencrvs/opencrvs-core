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
  searchByCompositionId,
  updateComposition
} from '@search/elasticsearch/dbhelper'
import {
  ARCHIVED_STATUS,
  CERTIFIED_STATUS,
  createStatusHistory,
  EVENT,
  getCreatedBy,
  getStatus,
  ICompositionBody,
  IMarriageCompositionBody,
  IOperationHistory,
  NAME_EN,
  REGISTERED_STATUS,
  REJECTED_STATUS,
  VALIDATED_STATUS
} from '@search/elasticsearch/utils'
import {
  findEntry,
  findName,
  findNameLocale,
  findTask,
  findTaskExtension,
  findTaskIdentifier,
  findEntryResourceByUrl,
  getdeclarationJurisdictionIds,
  addEventLocation,
  findExtension
} from '@search/features/fhir/fhir-utils'
import * as Hapi from '@hapi/hapi'
import { OPENCRVS_SPECIFICATION_URL } from '@search/constants'
import { client } from '@search/elasticsearch/client'

const BRIDE_CODE = 'bride-details'
const GROOM_CODE = 'groom-details'
const WITNESS_ONE_CODE = 'witness-one-details'
const WITNESS_TWO_CODE = 'witness-two-details'
const MARRIAGE_ENCOUNTER_CODE = 'marriage-encounter'

export async function upsertEvent(requestBundle: Hapi.Request) {
  const bundle = requestBundle.payload as fhir.Bundle
  const bundleEntries = bundle.entry
  const authHeader = requestBundle.headers.authorization

  const isCompositionInBundle = bundleEntries?.some(
    ({ resource }) => resource?.resourceType === 'Composition'
  )

  if (!isCompositionInBundle) {
    await updateEvent(bundle, authHeader)
    return
  }

  const composition = (bundleEntries &&
    bundleEntries[0].resource) as fhir.Composition
  if (!composition) {
    throw new Error('Composition not found')
  }

  const compositionId = composition.id

  if (!compositionId) {
    throw new Error(`Composition ID not found`)
  }

  await indexDeclaration(compositionId, composition, authHeader, bundleEntries)
}

/**
 * Updates the search index with the latest information of the composition
 * Supports 1 task and 1 patient maximum
 */
async function updateEvent(bundle: fhir.Bundle, authHeader: string) {
  const task = findTask(bundle.entry)
  const compositionId =
    task &&
    task.focus &&
    task.focus.reference &&
    task.focus.reference.split('/')[1]

  if (!compositionId) {
    throw new Error('No Composition ID found')
  }

  const regLastUserIdentifier = findTaskExtension(
    task,
    'http://opencrvs.org/specs/extension/regLastUser'
  )
  const registrationNumberIdentifier = findTaskIdentifier(
    task,
    'http://opencrvs.org/specs/id/marriage-registration-number'
  )

  const body: ICompositionBody = {
    operationHistories: (await getStatus(compositionId)) as IOperationHistory[]
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
    body.rejectReason = (task && task.reason && task.reason.text) || ''
    body.rejectComment = nodeText
  }
  body.updatedBy =
    regLastUserIdentifier &&
    regLastUserIdentifier.valueReference &&
    regLastUserIdentifier.valueReference.reference &&
    regLastUserIdentifier.valueReference.reference.split('/')[1]

  body.registrationNumber =
    registrationNumberIdentifier && registrationNumberIdentifier.value
  if (
    [
      REJECTED_STATUS,
      VALIDATED_STATUS,
      REGISTERED_STATUS,
      CERTIFIED_STATUS,
      ARCHIVED_STATUS
    ].includes(body.type ?? '')
  ) {
    body.assignment = null
  }
  await createStatusHistory(body, task, authHeader)
  await updateComposition(compositionId, body, client)
}

async function indexDeclaration(
  compositionId: string,
  composition: fhir.Composition,
  authHeader: string,
  bundleEntries?: fhir.BundleEntry[]
) {
  const result = await searchByCompositionId(compositionId, client)
  const body: ICompositionBody = {
    event: EVENT.MARRIAGE,
    createdAt:
      (result &&
        result.body.hits.hits.length > 0 &&
        result.body.hits.hits[0]._source.createdAt) ||
      Date.now().toString(),
    operationHistories: (await getStatus(compositionId)) as IOperationHistory[]
  }

  await createIndexBody(body, composition, authHeader, bundleEntries)
  await indexComposition(compositionId, body, client)
}

async function createIndexBody(
  body: IMarriageCompositionBody,
  composition: fhir.Composition,
  authHeader: string,
  bundleEntries?: fhir.BundleEntry[]
) {
  await createBrideIndex(body, composition, bundleEntries)
  await createGroomIndex(body, composition, bundleEntries)
  createWitnessOneIndex(body, composition, bundleEntries)
  createWitnessTwoIndex(body, composition, bundleEntries)
  await createDeclarationIndex(body, composition, bundleEntries)
  const task = findTask(bundleEntries)
  await createStatusHistory(body, task, authHeader)
}

async function createBrideIndex(
  body: IMarriageCompositionBody,
  composition: fhir.Composition,
  bundleEntries?: fhir.BundleEntry[]
) {
  const bride = findEntry(
    BRIDE_CODE,
    composition,
    bundleEntries
  ) as fhir.Patient

  await addEventLocation(body, MARRIAGE_ENCOUNTER_CODE, composition)

  const marriageExtension = findExtension(
    `${OPENCRVS_SPECIFICATION_URL}extension/date-of-marriage`,
    bride?.extension as fhir.Extension[]
  )

  const brideName = bride && findName(NAME_EN, bride.name)
  const brideNameLocal = bride && findNameLocale(bride.name)

  body.brideFirstNames =
    brideName && brideName.given && brideName.given.join(' ')
  body.brideFamilyName = brideName && brideName.family && brideName.family[0]
  body.brideFirstNamesLocal =
    brideNameLocal && brideNameLocal.given && brideNameLocal.given.join(' ')
  body.brideFamilyNameLocal =
    brideNameLocal && brideNameLocal.family && brideNameLocal.family[0]
  if (marriageExtension) {
    body.marriageDate = marriageExtension.valueDateTime
  }

  body.brideIdentifier =
    bride &&
    bride.identifier &&
    bride.identifier.find(
      (identifier) => identifier.type?.coding?.[0].code === 'NATIONAL_ID'
    )?.value
  body.brideDoB = bride && bride.birthDate
}

async function createGroomIndex(
  body: IMarriageCompositionBody,
  composition: fhir.Composition,
  bundleEntries?: fhir.BundleEntry[]
) {
  const groom = findEntry(
    GROOM_CODE,
    composition,
    bundleEntries
  ) as fhir.Patient

  await addEventLocation(body, MARRIAGE_ENCOUNTER_CODE, composition)

  const marriageExtension = findExtension(
    `${OPENCRVS_SPECIFICATION_URL}extension/date-of-marriage`,
    groom?.extension as fhir.Extension[]
  )

  const groomName = groom && findName(NAME_EN, groom.name)
  const groomNameLocal = groom && findNameLocale(groom.name)

  body.groomFirstNames =
    groomName && groomName.given && groomName.given.join(' ')
  body.groomFamilyName = groomName && groomName.family && groomName.family[0]
  body.groomFirstNamesLocal =
    groomNameLocal && groomNameLocal.given && groomNameLocal.given.join(' ')
  body.groomFamilyNameLocal =
    groomNameLocal && groomNameLocal.family && groomNameLocal.family[0]

  if (marriageExtension) {
    body.marriageDate = marriageExtension.valueDateTime
  }

  body.groomIdentifier =
    groom &&
    groom.identifier &&
    groom.identifier.find(
      (identifier) => identifier.type?.coding?.[0].code === 'NATIONAL_ID'
    )?.value
  body.groomDoB = groom && groom.birthDate
}

function createWitnessOneIndex(
  body: IMarriageCompositionBody,
  composition: fhir.Composition,
  bundleEntries?: fhir.BundleEntry[]
) {
  const witnessRef = findEntry(
    WITNESS_ONE_CODE,
    composition,
    bundleEntries
  ) as fhir.RelatedPerson

  if (!witnessRef || !witnessRef.patient) {
    return
  }

  const witness = findEntryResourceByUrl(
    witnessRef.patient.reference,
    bundleEntries
  ) as fhir.Patient

  if (!witness) {
    return
  }

  const witnessName = findName(NAME_EN, witness.name)
  const witnessNameLocal = findNameLocale(witness.name)

  body.witnessOneFirstNames =
    witnessName && witnessName.given && witnessName.given.join(' ')
  body.witnessOneFamilyName =
    witnessName && witnessName.family && witnessName.family[0]
  body.witnessOneFirstNamesLocal =
    witnessNameLocal &&
    witnessNameLocal.given &&
    witnessNameLocal.given.join(' ')
  body.witnessOneFamilyNameLocal =
    witnessNameLocal && witnessNameLocal.family && witnessNameLocal.family[0]
}

function createWitnessTwoIndex(
  body: IMarriageCompositionBody,
  composition: fhir.Composition,
  bundleEntries?: fhir.BundleEntry[]
) {
  const witnessRef = findEntry(
    WITNESS_TWO_CODE,
    composition,
    bundleEntries
  ) as fhir.RelatedPerson

  if (!witnessRef || !witnessRef.patient) {
    return
  }

  const witness = findEntryResourceByUrl(
    witnessRef.patient.reference,
    bundleEntries
  ) as fhir.Patient

  if (!witness) {
    return
  }

  const witnessName = findName(NAME_EN, witness.name)
  const witnessNameLocal = findNameLocale(witness.name)
  body.witnessTwoFirstNames =
    witnessName && witnessName.given && witnessName.given.join(' ')
  body.witnessTwoFamilyName =
    witnessName && witnessName.family && witnessName.family[0]
  body.witnessTwoFirstNamesLocal =
    witnessNameLocal &&
    witnessNameLocal.given &&
    witnessNameLocal.given.join(' ')
  body.witnessTwoFamilyNameLocal =
    witnessNameLocal && witnessNameLocal.family && witnessNameLocal.family[0]
}

async function createDeclarationIndex(
  body: IMarriageCompositionBody,
  composition: fhir.Composition,
  bundleEntries?: fhir.BundleEntry[]
) {
  const task = findTask(bundleEntries)
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

  body.contactRelationship =
    (contactPersonRelationshipExtention &&
      contactPersonRelationshipExtention.valueString) ||
    (contactPersonExtention && contactPersonExtention.valueString)
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

  body.declarationJurisdictionIds = await getdeclarationJurisdictionIds(
    body.declarationLocationId
  )

  body.compositionType =
    (compositionTypeCode && compositionTypeCode.code) || 'marriage-declaration'

  const createdBy = await getCreatedBy(composition.id as string)

  body.createdBy = createdBy || regLastUser
  body.updatedBy = regLastUser
}
