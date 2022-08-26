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
const { MongoClient } = require('mongodb')
const createCSV = require('csv-writer').createObjectCsvWriter

const HEARTH_MONGO_URL = process.env.HEARTH_MONGO_URL || 'mongodb://localhost'
const DB_NAME = 'hearth-dev'
const client = new MongoClient(HEARTH_MONGO_URL)
const officeLocationExtURL = 'http://opencrvs.org/specs/extension/regLastOffice'
const patientOccupationExtURL =
  'http://opencrvs.org/specs/extension/patient-occupation'
const patientEduAttainmentExtURL =
  'http://opencrvs.org/specs/extension/educational-attainment'

const COLLECTION_NAMES = {
  COMPOSITION: 'Composition',
  ENCOUNTER: 'Encounter',
  LOCATION: 'Location',
  OBSERVATION: 'Observation',
  PATIENT: 'Patient',
  RELATEDPERSON: 'RelatedPerson',
  TASK: 'Task'
}

const connect = async () => {
  try {
    await client.connect()
    console.log('Connected to mongoDB')
  } catch (err) {
    console.error('Error occured while connecting to mongoDB', err)
  }
}

async function getPastYearCompositionCursor() {
  const db = client.db(DB_NAME)
  const today = new Date()
  const yyyy = today.getFullYear()
  return db
    .collection(COLLECTION_NAMES.COMPOSITION)
    .find({
      date: { $gt: `${yyyy - 1}-12-31` }
    })
    .project({ id: 1, title: 1, section: 1, date: 1, _id: 0 })
}

async function getCollectionDocuments(collectionName, ids) {
  const db = client.db(DB_NAME)
  if (ids.length > 0) {
    return db
      .collection(collectionName)
      .find({
        id: { $in: ids }
      })
      .toArray()
  } else {
    return db.collection(collectionName).find().toArray()
  }
}

async function getObservationDocuments(encounterId) {
  const db = client.db(DB_NAME)
  return db
    .collection(COLLECTION_NAMES.OBSERVATION)
    .find({
      'context.reference': encounterId
    })
    .toArray()
}

async function getTaskDocuments(compositionId) {
  const db = client.db(DB_NAME)
  return db
    .collection(COLLECTION_NAMES.TASK)
    .find({
      'focus.reference': compositionId
    })
    .toArray()
}

function findCodeInObservation(observation, code) {
  return observation.code.coding[0].code === code ? observation : undefined
}

function getValueFromExt(doc, extURL) {
  if (!doc.extension) return ''
  const docExt = doc.extension.find((obj) => obj.url === extURL)
  return docExt ? docExt.valueString : ''
}

function makePatientsObject(patient) {
  return {
    gender: patient.gender ?? '',
    birthDate: patient.birthDate ?? '',
    deceasedDate: patient.deceasedDateTime ?? '',
    maritalStatus: patient.maritalStatus ? patient.maritalStatus.text : '',
    multipleBirth: patient.multipleBirthInteger ?? '',
    occupation: getValueFromExt(patient, patientOccupationExtURL),
    educational_attainment: getValueFromExt(
      patient,
      patientEduAttainmentExtURL
    ),
    city: patient.address ? patient.address[0].city : '',
    district: patient.address ? patient.address[0].district : '',
    state: patient.address ? patient.address[0].state : ''
  }
}

async function setPatientsAddress(patients, locations) {
  patients.forEach((patient) => {
    if (patient.address) {
      if (patient.address[0].district) {
        patient.address[0].district = locations.find(
          ({ id }) => id === patient.address[0].district
        ).name
      }
      if (patient.address[0].state) {
        patient.address[0].state = locations.find(
          ({ id }) => id === patient.address[0].state
        ).name
      }
    }
  })
}

async function setPatientsDetailsInComposition(composition, locations) {
  const patientList = composition.section.filter((section) =>
    section.entry[0].reference.startsWith('Patient/')
  )
  const patientIds = patientList.map((patient) =>
    patient.entry[0].reference.replace('Patient/', '')
  )
  const patients = await getCollectionDocuments('Patient', patientIds)
  await setPatientsAddress(patients, locations)

  composition.section.forEach((section) => {
    if (
      typeof section.entry[0].reference === 'string' &&
      section.entry[0].reference.startsWith('Patient/')
    ) {
      const patientId = section.entry[0].reference.replace('Patient/', '')
      const patient = patients.find(({ id }) => id === patientId)
      section.entry[0].reference = makePatientsObject(patient)
    }
  })
}

async function setObservationDetailsInComposition(composition) {
  const encounter = composition.section.find(
    (section) =>
      typeof section.entry[0].reference === 'string' &&
      section.entry[0].reference.startsWith('Encounter/')
  )
  const observations = await getObservationDocuments(
    encounter.entry[0].reference
  )
  const observationObj = {}
  observations.forEach((observation) => {
    const causeOfDeathMethod = findCodeInObservation(
      observation,
      'cause-of-death-method'
    )
    const birthPluralityOfPregnancy = findCodeInObservation(
      observation,
      '57722-1'
    )
    const bodyWeightMeasured = findCodeInObservation(observation, '3141-9')
    const birthAttendantTitle = findCodeInObservation(observation, '73764-3')
    const uncertifiedMannerOfDeath = findCodeInObservation(
      observation,
      'uncertified-manner-of-death'
    )
    const verbalAutopsyDescription = findCodeInObservation(
      observation,
      'lay-reported-or-verbal-autopsy-description'
    )
    const causeOfDeathEstablished = findCodeInObservation(
      observation,
      'cause-of-death-established'
    )
    const causeOfDeath = findCodeInObservation(observation, 'ICD10')
    const numMaleDependentsOnDeceased = findCodeInObservation(
      observation,
      'num-male-dependents-on-deceased'
    )
    const numFemaleDependentsOnDeceased = findCodeInObservation(
      observation,
      'num-female-dependents-on-deceased'
    )
    const presentAtBirthReg = findCodeInObservation(
      observation,
      'present-at-birth-reg'
    )

    if (causeOfDeathMethod) {
      observationObj['causeOfDeathMethod'] =
        causeOfDeathMethod.valueCodeableConcept.coding[0].code
    }
    if (birthPluralityOfPregnancy) {
      observationObj['birthPluralityOfPregnancy'] =
        birthPluralityOfPregnancy.valueQuantity.value
    }
    if (bodyWeightMeasured) {
      observationObj[
        'bodyWeightMeasured'
      ] = `${bodyWeightMeasured.valueQuantity.value} ${bodyWeightMeasured.valueQuantity.unit}`
    }
    if (birthAttendantTitle) {
      observationObj['birthAttendantTitle'] = birthAttendantTitle.valueString
    }
    if (uncertifiedMannerOfDeath) {
      observationObj['uncertifiedMannerOfDeath'] =
        uncertifiedMannerOfDeath.valueCodeableConcept.coding[0].code
    }
    if (verbalAutopsyDescription) {
      observationObj['verbalAutopsyDescription'] =
        verbalAutopsyDescription.valueString ?? ''
    }
    if (causeOfDeathEstablished) {
      observationObj['causeOfDeathEstablished'] =
        causeOfDeathEstablished.valueCodeableConcept.coding[0].code
    }
    if (causeOfDeath) {
      observationObj['causeOfDeath'] =
        causeOfDeath.valueCodeableConcept.coding[0].code
    }
    if (numMaleDependentsOnDeceased) {
      observationObj['numMaleDependentsOnDeceased'] =
        numMaleDependentsOnDeceased.valueString
    }
    if (numFemaleDependentsOnDeceased) {
      observationObj['numFemaleDependentsOnDeceased'] =
        numFemaleDependentsOnDeceased.valueString
    }
    if (presentAtBirthReg) {
      observationObj['presentAtBirthReg'] = presentAtBirthReg.valueString
    }
    observation.value = observationObj
  })
  composition.section.forEach((section) => {
    if (
      typeof section.entry[0].reference === 'string' &&
      section.entry[0].reference.startsWith('Encounter/')
    ) {
      const observation = observations.find(
        ({ context }) => context.reference === section.entry[0].reference
      )
      if (observation) {
        const { value } = observation
        section.entry[0].reference = value
      }
    }
  })
}

async function setInformantDetailsInComposition(composition, locations) {
  const informant = composition.section.find(
    (section) =>
      typeof section.entry[0].reference === 'string' &&
      section.entry[0].reference.startsWith('RelatedPerson/')
  )
  const informantId = informant.entry[0].reference.replace('RelatedPerson/', '')
  const relatedPerson = await getCollectionDocuments(
    COLLECTION_NAMES.RELATEDPERSON,
    [informantId]
  )
  const patientId = relatedPerson[0].patient
    ? relatedPerson[0].patient.reference.replace('Patient/', '')
    : undefined
  const patient = await getCollectionDocuments(COLLECTION_NAMES.PATIENT, [
    patientId
  ])
  await setPatientsAddress(patient, locations)
  if (relatedPerson[0].patient) {
    relatedPerson[0].patient.reference = patient
  }
  composition.section.forEach((section) => {
    if (
      typeof section.entry[0].reference === 'string' &&
      section.entry[0].reference.startsWith('RelatedPerson/')
    ) {
      const {
        relationship: {
          coding: [{ code }]
        },
        patient
      } = relatedPerson[0]

      if (patient) {
        section.entry[0].reference = {
          ...makePatientsObject(patient.reference[0]),
          relationship: code
        }
      }
    }
  })
}

async function setLocationInComposition(composition, locations) {
  const encounter = composition.section.find(
    (section) =>
      typeof section.entry[0].reference === 'string' &&
      section.entry[0].reference.startsWith('Encounter/')
  )
  const encounterId = encounter.entry[0].reference.replace('Encounter/', '')
  const encounterDoc = await getCollectionDocuments(
    COLLECTION_NAMES.ENCOUNTER,
    [encounterId]
  )
  const locationId = encounterDoc[0].location[0].location.reference.replace(
    'Location/',
    ''
  )
  const location = locations.find(({ id }) => id === locationId)
  const districtLocation = locations.find(
    ({ id }) => id === location.address.district
  )
  const stateLocation = locations.find(
    ({ id }) => id === location.address.state
  )
  composition['healthCenter'] = location.name ?? ''
  composition['eventDistrict'] = districtLocation ? districtLocation.name : ''
  composition['eventState'] = stateLocation ? stateLocation.name : ''
  composition['eventCity'] = location.address.city ?? ''

  const [task] = await getTaskDocuments(`Composition/${composition.id}`)

  const officeLocationId = task.extension
    .find((obj) => obj.url === officeLocationExtURL)
    .valueReference.reference.replace('Location/', '')
  composition['officeLocation'] = locations.find(
    ({ id }) => id === officeLocationId
  ).name
}

async function createBirthDeclarationCSVWriter() {
  const birthCSV = createCSV({
    path: 'Birth_Report.csv',
    append: true,
    header: [
      { id: 'childGen' },
      { id: 'childDOB' },
      { id: 'childOrd' },
      { id: 'birthCity' },
      { id: 'birthState' },
      { id: 'birthDistrict' },
      { id: 'healthCenter' },
      { id: 'officeLocation' },
      { id: 'birthPluralityOfPregnancy' },
      { id: 'bodyWeightMeasured' },
      { id: 'birthAttendantTitle' },
      { id: 'presentAtBirthReg' },
      { id: 'motherDOB' },
      { id: 'motherMaritalStatus' },
      { id: 'motherOccupation' },
      { id: 'motherEducationalAttainment' },
      { id: 'motherCity' },
      { id: 'motherDistrict' },
      { id: 'motherState' },
      { id: 'fatherDOB' },
      { id: 'fatherMaritalStatus' },
      { id: 'fatherOccupation' },
      { id: 'fatherEducationalAttainment' },
      { id: 'fatherCity' },
      { id: 'fatherDistrict' },
      { id: 'fatherState' },
      { id: 'informantDOB' },
      { id: 'informantMaritalStatus' },
      { id: 'informantOccupation' },
      { id: 'informantEducationalAttainment' },
      { id: 'informantCity' },
      { id: 'informantDistrict' },
      { id: 'informantState' },
      { id: 'informantRelationship' }
    ]
  })
  let birthCSVHeader = [
    {
      childGen: 'CHILD GENDER',
      childDOB: 'CHILD DOB',
      childOrd: 'CHILD ORDER',
      birthCity: 'BIRTH CITY',
      birthState: 'BIRTH STATE',
      birthDistrict: 'BIRTH DISTRICT',
      healthCenter: 'HEALTH CENTER',
      officeLocation: 'OFFICE LOCATION',
      birthPluralityOfPregnancy: 'PLURALITY OF PREGNANCY',
      bodyWeightMeasured: 'BODY WEIGHT MEASURED',
      birthAttendantTitle: 'ATTENDANT TITLE',
      presentAtBirthReg: 'PRESENT AT REG',
      motherDOB: 'MOTHER DOB',
      motherMaritalStatus: 'MOTHER MARITAL STATUS',
      motherOccupation: 'MOTHER OCCUPATION',
      motherEducationalAttainment: 'MOTHER EDUCATION',
      motherCity: 'MOTHER CITY',
      motherDistrict: 'MOTHER DISTRICT',
      motherState: 'MOTHER STATE',
      fatherDOB: 'FATHER DOB',
      fatherMaritalStatus: 'FATHER MARITAL STATUS',
      fatherOccupation: 'FATHER OCCUPATION',
      fatherEducationalAttainment: 'FATHER EDUCATION',
      fatherCity: 'FATHER CITY',
      fatherDistrict: 'FATHER DISTRICT',
      fatherState: 'FATHER STATE',
      informantDOB: 'INFORMANT DOB',
      informantMaritalStatus: 'INFORMANT MARITAL STATUS',
      informantOccupation: 'INFORMANT OCCUPATION',
      informantEducationalAttainment: 'INFORMANT EDUCATION',
      informantCity: 'INFORMANT CITY',
      informantDistrict: 'INFORMANT DISTRICT',
      informantState: 'INFORMANT STATE',
      informantRelationship: 'INFORMANT RELATIONSHIP'
    }
  ]
  await birthCSV.writeRecords(birthCSVHeader)
  return birthCSV
}

async function createDeathDeclarationCSVWriter() {
  const deathCSV = createCSV({
    path: 'Death_Report.csv',
    append: true,
    header: [
      { id: 'deceasedGen' },
      { id: 'deceasedDOB' },
      { id: 'deceasedMaritalStatus' },
      { id: 'deceasedDate' },
      { id: 'deathCity' },
      { id: 'deathState' },
      { id: 'deathDistrict' },
      { id: 'healthCenter' },
      { id: 'officeLocation' },
      { id: 'uncertifiedMannerOfDeath' },
      { id: 'verbalAutopsyDescription' },
      { id: 'causeOfDeathMethod' },
      { id: 'causeOfDeathEstablished' },
      { id: 'causeOfDeath' },
      { id: 'numMaleDependentsOnDeceased' },
      { id: 'numFemaleDependentsOnDeceased' },
      { id: 'informantDOB' },
      { id: 'informantMaritalStatus' },
      { id: 'informantOccupation' },
      { id: 'informantCity' },
      { id: 'informantDistrict' },
      { id: 'informantState' },
      { id: 'informantRelationship' }
    ]
  })
  let deathCSVHeader = [
    {
      deceasedGen: 'DECEASED GENDER',
      deceasedDOB: 'DECEASED DOB',
      deceasedMaritalStatus: 'DECEASED MARITAL STATUS',
      deceasedDate: 'DECEASED DATE',
      deathCity: 'DEATH CITY',
      deathState: 'DEATH STATE',
      deathDistrict: 'DEATH DISTRICT',
      healthCenter: 'HEALTH CENTER',
      officeLocation: 'OFFICE LOCATION',
      uncertifiedMannerOfDeath: 'UNCERTIFIED MANNER OF DEATH',
      verbalAutopsyDescription: 'VERBAL AUTOPSY DESCRIPTION',
      causeOfDeathMethod: 'CAUSE OF DEATH METHOD',
      causeOfDeathEstablished: 'CAUSE OF DEATH ESTABLISHED',
      causeOfDeath: 'CAUSE OF DEATH',
      numMaleDependentsOnDeceased: 'NUM MALE DEPENDENTS ON DECEASED',
      numFemaleDependentsOnDeceased: 'NUM FEMALE DEPENDENTS ON DECEASED',
      informantDOB: 'INFORMANT DOB',
      informantMaritalStatus: 'INFORMANT MARITAL STATUS',
      informantOccupation: 'INFORMANT OCCUPATION',
      informantCity: 'INFORMANT CITY',
      informantDistrict: 'INFORMANT DISTRICT',
      informantState: 'INFORMANT STATE',
      informantRelationship: 'INFORMANT RELATIONSHIP'
    }
  ]
  await deathCSV.writeRecords(deathCSVHeader)
  return deathCSV
}

async function makeComposotionAndExportCSVReport(
  compositionsCursor,
  locations
) {
  const birthCSVWriter = await createBirthDeclarationCSVWriter()
  const deathCSVWriter = await createDeathDeclarationCSVWriter()
  try {
    while (await compositionsCursor.hasNext()) {
      const composition = await compositionsCursor.next()
      const filterSection = composition.section.filter(
        (sec) => !['Certificates', 'Supporting Documents'].includes(sec.title)
      )
      composition.section = filterSection
      await setPatientsDetailsInComposition(composition, locations)
      await setLocationInComposition(composition, locations)
      await setObservationDetailsInComposition(composition)
      await setInformantDetailsInComposition(composition, locations)

      if (composition.title === 'Birth Declaration') {
        let row = {}
        row['birthDistrict'] = composition.eventDistrict
        row['birthState'] = composition.eventState
        row['birthCity'] = composition.eventCity
        row['healthCenter'] = composition.healthCenter
        row['officeLocation'] = composition.officeLocation
        composition.section.map(async (sec) => {
          if (sec.title === 'Child details') {
            row['childGen'] = sec.entry[0].reference.gender
            row['childDOB'] = sec.entry[0].reference.birthDate
            row['childOrd'] = sec.entry[0].reference.multipleBirth
          }
          if (sec.title === 'Birth encounter') {
            row['birthPluralityOfPregnancy'] =
              sec.entry[0].reference.birthPluralityOfPregnancy
            row['bodyWeightMeasured'] =
              sec.entry[0].reference.bodyWeightMeasured
            row['birthAttendantTitle'] =
              sec.entry[0].reference.birthAttendantTitle
            row['presentAtBirthReg'] = sec.entry[0].reference.presentAtBirthReg
          }
          if (sec.title === `Mother's details`) {
            row['motherDOB'] = sec.entry[0].reference.birthDate
            row['motherMaritalStatus'] = sec.entry[0].reference.maritalStatus
            row['motherOccupation'] = sec.entry[0].reference.occupation
            row['motherEducationalAttainment'] =
              sec.entry[0].reference.educational_attainment
            row['motherCity'] = sec.entry[0].reference.city
            row['motherDistrict'] = sec.entry[0].reference.district
            row['motherState'] = sec.entry[0].reference.state
          }
          if (sec.title === `Father's details`) {
            row['fatherDOB'] = sec.entry[0].reference.birthDate
            row['fatherMaritalStatus'] = sec.entry[0].reference.maritalStatus
            row['fatherOccupation'] = sec.entry[0].reference.occupation
            row['fatherEducationalAttainment'] =
              sec.entry[0].reference.educational_attainment
            row['fatherCity'] = sec.entry[0].reference.city
            row['fatherDistrict'] = sec.entry[0].reference.district
            row['fatherState'] = sec.entry[0].reference.state
          }
          if (sec.title === `Informant's details`) {
            row['informantDOB'] = sec.entry[0].reference.birthDate
            row['informantMaritalStatus'] = sec.entry[0].reference.maritalStatus
            row['informantOccupation'] = sec.entry[0].reference.occupation
            row['informantEducationalAttainment'] =
              sec.entry[0].reference.educational_attainment
            row['informantCity'] = sec.entry[0].reference.city
            row['informantDistrict'] = sec.entry[0].reference.district
            row['informantState'] = sec.entry[0].reference.state
            row['informantRelationship'] = sec.entry[0].reference.relationship
          }
        })
        console.log('Writing CSV row for birth declaration...')
        await birthCSVWriter.writeRecords([row])
      } else if (composition.title === 'Death Declaration') {
        let row = {}
        row['healthCenter'] = composition.healthCenter
        row['officeLocation'] = composition.officeLocation
        composition.section.map(async (sec) => {
          if (sec.title === 'Deceased details') {
            row['deathDistrict'] = sec.entry[0].reference.district
            row['deathState'] = sec.entry[0].reference.state
            row['deathCity'] = sec.entry[0].reference.city
            row['deceasedGen'] = sec.entry[0].reference.gender
            row['deceasedDOB'] = sec.entry[0].reference.birthDate
            row['deceasedMaritalStatus'] = sec.entry[0].reference.maritalStatus
            row['deceasedDate'] = sec.entry[0].reference.deceasedDate
          }
          if (sec.title === 'Death encounter') {
            row['uncertifiedMannerOfDeath'] =
              sec.entry[0].reference.uncertifiedMannerOfDeath
            row['verbalAutopsyDescription'] =
              sec.entry[0].reference.verbalAutopsyDescription
            row['causeOfDeathMethod'] =
              sec.entry[0].reference.causeOfDeathMethod
            row['causeOfDeathEstablished'] = sec.entry[0].reference
              .causeOfDeathEstablished
              ? 'yes'
              : 'no'
            row['causeOfDeath'] = sec.entry[0].reference.causeOfDeath
            row['numMaleDependentsOnDeceased'] =
              sec.entry[0].reference.numMaleDependentsOnDeceased
            row['numFemaleDependentsOnDeceased'] =
              sec.entry[0].reference.numFemaleDependentsOnDeceased
          }
          if (sec.title === `Informant's details`) {
            row['informantDOB'] = sec.entry[0].reference.birthDate
            row['informantMaritalStatus'] = sec.entry[0].reference.maritalStatus
            row['informantOccupation'] = sec.entry[0].reference.occupation
            row['informantCity'] = sec.entry[0].reference.city
            row['informantDistrict'] = sec.entry[0].reference.district
            row['informantState'] = sec.entry[0].reference.state
            row['informantRelationship'] = sec.entry[0].reference.relationship
          }
        })
        console.log('Writing CSV row for death declaration...')
        await deathCSVWriter.writeRecords([row])
      }
    }
    console.log(
      'Successfully generated CSV report for birth and death declarations.'
    )
  } catch (error) {
    console.log('Sorry. Something went wrong!')
  }
}

const startScript = async () => {
  connect()
  const compositionsCursor = await getPastYearCompositionCursor()
  const locations = await getCollectionDocuments(COLLECTION_NAMES.LOCATION, [])
  await makeComposotionAndExportCSVReport(compositionsCursor, locations)
  process.exit()
}

startScript()
