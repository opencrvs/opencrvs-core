/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import {
  indexComposition,
  updateComposition
} from '@search/elasticsearch/dbhelper'
import {
  EVENT,
  ICompositionBody,
  IDeathCompositionBody,
  getCreatedBy,
  getStatus,
  IStatus,
  createStatusHistory
} from '@search/elasticsearch/utils'
import {
  findEntry,
  findEntryResourceByUrl,
  findName,
  findTask,
  findTaskExtension,
  findTaskIdentifier
} from '@search/features/fhir/fhir-utils'

const DECEASED_CODE = 'deceased-details'
const INFORMANT_CODE = 'informant-details'
const DEATH_ENCOUNTER_CODE = 'death-encounter'
const NAME_EN = 'en'
const NAME_BN = 'bn'

export async function upsertEvent(bundle: fhir.Bundle) {
  const bundleEntries = bundle.entry

  if (bundleEntries && bundleEntries.length === 1) {
    const resource = bundleEntries[0].resource
    if (resource && resource.resourceType === 'Task') {
      updateEvent(resource as fhir.Task)
      return
    }
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

  await indexDeclaration(compositionId, composition, bundleEntries)
}

async function updateEvent(task: fhir.Task) {
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

  const body: ICompositionBody = {
    status: (await getStatus(compositionId)) as IStatus[]
  }

  body.type =
    task &&
    task.businessStatus &&
    task.businessStatus.coding &&
    task.businessStatus.coding[0].code
  body.modifiedAt = Date.now().toString()
  const nodeText =
    task && task.note && task.note[0].text && task.note[0].text.split('&')
  body.rejectReason = nodeText && nodeText[0] && nodeText[0].split('=')[1]
  body.rejectComment = nodeText && nodeText[1] && nodeText[1].split('=')[1]
  body.updatedBy =
    regLastUserIdentifier &&
    regLastUserIdentifier.valueReference &&
    regLastUserIdentifier.valueReference.reference &&
    regLastUserIdentifier.valueReference.reference.split('/')[1]

  await createStatusHistory(body)
  await updateComposition(compositionId, body)
}

async function indexDeclaration(
  compositionId: string,
  composition: fhir.Composition,
  bundleEntries?: fhir.BundleEntry[]
) {
  const body: ICompositionBody = {
    event: EVENT.DEATH,
    createdAt: Date.now().toString(),
    status: (await getStatus(compositionId)) as IStatus[]
  }

  await createIndexBody(body, composition, bundleEntries)
  await indexComposition(compositionId, body)
}

async function createIndexBody(
  body: IDeathCompositionBody,
  composition: fhir.Composition,
  bundleEntries?: fhir.BundleEntry[]
) {
  createDeceasedIndex(body, composition, bundleEntries)
  await createApplicationIndex(body, composition, bundleEntries)
  await createStatusHistory(body)
}

function createDeceasedIndex(
  body: IDeathCompositionBody,
  composition: fhir.Composition,
  bundleEntries?: fhir.BundleEntry[]
) {
  const deceased = findEntry(
    DECEASED_CODE,
    composition,
    bundleEntries
  ) as fhir.Patient

  const deathEncounter = findEntry(
    DEATH_ENCOUNTER_CODE,
    composition,
    bundleEntries
  ) as fhir.Encounter

  const deceasedName = deceased && findName(NAME_EN, deceased)
  const deceasedNameLocal = deceased && findName(NAME_BN, deceased)

  body.deceasedFirstNames =
    deceasedName && deceasedName.given && deceasedName.given.join(' ')
  body.deceasedFamilyName =
    deceasedName && deceasedName.family && deceasedName.family[0]
  body.deceasedFirstNamesLocal =
    deceasedNameLocal &&
    deceasedNameLocal.given &&
    deceasedNameLocal.given.join(' ')
  body.deceasedFamilyNameLocal =
    deceasedNameLocal && deceasedNameLocal.family && deceasedNameLocal.family[0]
  body.deathDate = deceased.deceasedDateTime
  body.eventLocationId =
    deathEncounter &&
    deathEncounter.location &&
    deathEncounter.location[0].location.reference &&
    deathEncounter.location[0].location.reference.split('/')[1]
}

async function createApplicationIndex(
  body: IDeathCompositionBody,
  composition: fhir.Composition,
  bundleEntries?: fhir.BundleEntry[]
) {
  const relatedPerson = findEntry(
    INFORMANT_CODE,
    composition,
    bundleEntries
  ) as fhir.RelatedPerson
  const informant = findEntryResourceByUrl(
    relatedPerson && relatedPerson.patient && relatedPerson.patient.reference,
    bundleEntries
  ) as fhir.Patient
  const informantTelecom =
    informant &&
    informant.telecom &&
    informant.telecom.find(telecom => telecom.system === 'phone')
  const task = findTask(bundleEntries)
  const placeOfApplicationExtension = findTaskExtension(
    task,
    'http://opencrvs.org/specs/extension/regLastOffice'
  )

  const trackingIdIdentifier = findTaskIdentifier(
    task,
    'http://opencrvs.org/specs/id/death-tracking-id'
  )
  const registrationNumberIdentifier = findTaskIdentifier(
    task,
    'http://opencrvs.org/specs/id/death-registration-number'
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
      code => code.system === 'http://opencrvs.org/doc-types'
    )

  body.contactNumber = informantTelecom && informantTelecom.value
  body.type =
    task &&
    task.businessStatus &&
    task.businessStatus.coding &&
    task.businessStatus.coding[0].code
  body.dateOfApplication = task && task.lastModified
  body.trackingId = trackingIdIdentifier && trackingIdIdentifier.value
  body.registrationNumber =
    registrationNumberIdentifier && registrationNumberIdentifier.value
  body.applicationLocationId =
    placeOfApplicationExtension &&
    placeOfApplicationExtension.valueReference &&
    placeOfApplicationExtension.valueReference.reference &&
    placeOfApplicationExtension.valueReference.reference.split('/')[1]
  body.compositionType =
    (compositionTypeCode && compositionTypeCode.code) || 'death-application'

  const createdBy = await getCreatedBy(composition.id as string)

  if (createdBy) {
    body.createdBy = createdBy
    body.updatedBy = regLastUser
  } else {
    body.createdBy = regLastUser
  }
}
