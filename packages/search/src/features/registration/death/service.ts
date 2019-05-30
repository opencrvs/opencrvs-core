import { indexComposition, updateComposition } from '@search/elasticsearch/dbhelper'
import {
  EVENT,
  ICompositionBody,
  IDeathCompositionBody
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

  indexDeclaration(compositionId, composition, bundleEntries)
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

  const body: ICompositionBody = {}

  body.type =
    task &&
    task.businessStatus &&
    task.businessStatus.coding &&
    task.businessStatus.coding[0].code
  const nodeText =
    task && task.note && task.note[0].text && task.note[0].text.split('&')
  body.rejectReason = nodeText && nodeText[0] && nodeText[0].split('=')[1]
  body.rejectComment = nodeText && nodeText[1] && nodeText[1].split('=')[1]

  await updateComposition(compositionId, body)
}

async function indexDeclaration(
  compositionId: string,
  composition: fhir.Composition,
  bundleEntries?: fhir.BundleEntry[]
) {
  const body: ICompositionBody = { event: EVENT.DEATH }

  createIndexBody(body, composition, bundleEntries)
  await indexComposition(compositionId, body)
}

function createIndexBody(
  body: IDeathCompositionBody,
  composition: fhir.Composition,
  bundleEntries?: fhir.BundleEntry[]
) {
  createDeceasedIndex(body, composition, bundleEntries)
  createApplicationIndex(body, composition, bundleEntries)
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
}

function createApplicationIndex(
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
    'http://opencrvs.org/specs/extension/regLastLocation'
  )

  const trackingIdIdentifier = findTaskIdentifier(
    task,
    'http://opencrvs.org/specs/id/death-tracking-id'
  )
  const registrationNumberIdentifier = findTaskIdentifier(
    task,
    'http://opencrvs.org/specs/id/death-registration-number'
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
}
