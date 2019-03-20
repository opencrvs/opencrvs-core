import { indexComposition } from 'src/elasticsearch/dbhelper'
import {
  IBirthCompositionBody,
  ICompositionBody,
  IDeathCompositionBody
} from 'src/elasticsearch/utils'
import {
  findEntry,
  findEntryResourceByUrl,
  findName,
  findTask,
  findTaskExtension
} from 'src/features/fhir/fhir-utils'

const DECEASED_CODE = 'deceased-details'
const INFORMANT_CODE = 'informant-details'
const NAME_EN = 'en'
const NAME_BN = 'bn'

export async function insertNewDeclaration(bundle: fhir.Bundle) {
  const bundleEntries = bundle.entry
  const composition = (bundleEntries &&
    bundleEntries[0].resource) as fhir.Composition
  const compositionIdentifier =
    composition.identifier && composition.identifier.value

  if (!compositionIdentifier) {
    throw new Error(`Composition Identifier not found`)
  }

  indexDeclaration(compositionIdentifier, composition, bundleEntries)
}

async function indexDeclaration(
  compositionIdentifier: string,
  composition: fhir.Composition,
  bundleEntries?: fhir.BundleEntry[]
) {
  const body: ICompositionBody = {}
  createIndexBody(body, composition, bundleEntries)
  await indexComposition(compositionIdentifier, body)
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
  body: IBirthCompositionBody,
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

  body.contactNumber = informantTelecom && informantTelecom.value
  body.dateOfApplication = task && task.lastModified
  body.trackingId = task && task.identifier && task.identifier[0].value
  body.placeOfApplication = {
    placeOfDeclaration:
      placeOfApplicationExtension &&
      placeOfApplicationExtension.valueReference &&
      placeOfApplicationExtension.valueReference.reference
  }
}
