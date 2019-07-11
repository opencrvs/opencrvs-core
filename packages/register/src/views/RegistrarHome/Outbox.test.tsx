import * as React from 'react'
import OutBox from '@register/views/RegistrarHome/Outbox'
import { IApplication, createApplication } from '@register/applications'
import { Event, IFormData } from '@register/forms'
import {
  createTestComponent,
  currentUserApplications
} from '@register/tests/util'
import { createStore } from '@register/store'

describe('OutBox test', () => {
  const birthApp = {
    id: '10b7ccca-e1b9-4d14-a735-4bb7964a3ed9',
    data: {
      registration: {
        presentAtBirthRegistration: 'BOTH_PARENTS',
        applicant: 'MOTHER_ONLY',
        registrationPhone: '01989898989',
        whoseContactDetails: 'FATHER'
      },
      child: {
        firstNames: 'অইন',
        familyName: 'মরগান',
        firstNamesEng: 'Eoin',
        familyNameEng: 'Morgan',
        gender: 'male',
        childBirthDate: '2011-11-11',
        multipleBirth: 1,
        country: 'BGD'
      },
      mother: {
        iDType: 'BIRTH_REGISTRATION_NUMBER',
        iD: '111111111111212121',
        nationality: 'BGD',
        familyName: 'মা',
        familyNameEng: 'Ma',
        motherBirthDate: '1991-11-11',
        maritalStatus: 'MARRIED',
        countryPermanent: 'BGD',
        statePermanent: '036de332-68be-4acd-bd51-d93c50cfeff3',
        districtPermanent: '23b3bb18-20e4-4b05-897d-3c14cb3d374e',
        addressLine4Permanent: 'e2fc9415-8492-4220-a1a2-c130630d2234',
        addressLine3Permanent: 'a26bd41e-0363-4cd1-b358-243f8c7a85da',
        currentAddressSameAsPermanent: true,
        country: 'BGD'
      },
      father: {
        fathersDetailsExist: false
      },
      documents: {}
    },
    event: Event.BIRTH,
    submissionStatus: 'READY_TO_SUBMIT',
    savedOn: 1562834811371,
    modifiedOn: 1562834888006,
    action: 'submit for review'
  }
  const deathApp = {
    id: '29d787ba-3676-4671-82ed-9da5de2ec714',
    data: {
      deceased: {
        iDType: 'NO_ID',
        firstNames: 'অ্যারন',
        familyName: 'ফিঞ্চ',
        firstNamesEng: 'Aaron',
        familyNameEng: 'Finch',
        nationality: 'BGD',
        gender: 'male',
        maritalStatus: 'MARRIED',
        birthDate: '2011-11-11',
        countryPermanent: 'BGD',
        statePermanent: '61f745b4-5e97-4b06-9560-429df5ca511b',
        districtPermanent: 'e4eab1dc-42dd-4b34-84e8-a81e08bc8966',
        addressLine4Permanent: '9d0ff3fa-d9b6-4cb6-92ba-72bbb157d430',
        currentAddressSameAsPermanent: true,
        country: 'BGD'
      },
      informant: {
        iDType: 'NO_ID',
        applicantFamilyName: 'চৌধুরী',
        applicantFamilyNameEng: 'Chowdhury',
        nationality: 'BGD',
        applicantsRelationToDeceased: 'EXTENDED_FAMILY',
        applicantPhone: '01987789987',
        country: 'BGD',
        state: 'e5320d3c-78b3-4122-9dfd-9324906ab7de',
        district: '9914f913-453c-413e-a6fd-553971769f2e',
        addressLine4: '2c390875-0a74-4fb6-93ec-fa33dbf50ab9',
        applicantPermanentAddressSameAsCurrent: true,
        countryPermanent: 'BGD'
      },
      deathEvent: {
        deathDate: '2018-11-11',
        deathPlaceAddress: 'PERMANENT',
        country: 'BGD'
      },
      causeOfDeath: {
        causeOfDeathEstablished: false
      },
      documents: {}
    },
    event: Event.DEATH,
    submissionStatus: 'READY_TO_SUBMIT',
    savedOn: 1562846186040,
    modifiedOn: 1562846292423,
    action: 'submit for review'
  }
  const applications: IApplication[] = []
  const statuses = [
    'READY_TO_SUBMIT',
    'SUBMITTING',
    'REGISTERING',
    'READY_TO_REJECT',
    'REJECTING',
    'FAILED_NETWORK'
  ]
  const messages = [
    'Waiting to submit',
    'Submitting...',
    'Registering...',
    'Waiting to reject',
    'Rejecting...',
    'Waiting to retry'
  ]

  statuses.map(status =>
    applications.push({
      ...birthApp,
      submissionStatus: status
    })
  )

  statuses.map(status =>
    applications.push({
      ...deathApp,
      submissionStatus: status
    })
  )

  const { store } = createStore()
  const comp = createTestComponent(<OutBox application={applications} />, store)
  const testComp = comp.component
  it('renders texts in data rows for birth applications', () => {
    const birthValues = ['Birth', 'Eoin Morgan']
    for (let i = 0; i < 6; i++) {
      testComp
        .find(`#row_${i}`)
        .find('span')
        .map((span, index) =>
          expect(span.text()).toBe([...birthValues, messages[i], ''][index])
        )
    }
  })
  it('renders texts in data rows for death applications', () => {
    const deathValues = ['Death', 'Aaron Finch']
    for (let i = 0; i < 6; i++) {
      testComp
        .find(`#row_${i + 6}`)
        .find('span')
        .map((span, index) =>
          expect(span.text()).toBe([...deathValues, messages[i], ''][index])
        )
    }
  })
})
