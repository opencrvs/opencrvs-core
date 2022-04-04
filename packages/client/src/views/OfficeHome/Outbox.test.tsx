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
import * as React from 'react'
import OutBox from '@client/views/OfficeHome/Outbox'
import { IDeclaration } from '@client/declarations'
import { Event } from '@client/forms'
import { createTestComponent } from '@client/tests/util'
import { createStore } from '@client/store'

describe('OutBox tests', () => {
  const birthApp = {
    id: '10b7ccca-e1b9-4d14-a735-4bb7964a3ed9',
    data: {
      registration: {
        informantType: 'BOTH_PARENTS',
        informant: 'MOTHER_ONLY',
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
        informantFamilyName: 'চৌধুরী',
        informantFamilyNameEng: 'Chowdhury',
        nationality: 'BGD',
        informantsRelationToDeceased: 'EXTENDED_FAMILY',
        informantPhone: '01987789987',
        country: 'BGD',
        state: 'e5320d3c-78b3-4122-9dfd-9324906ab7de',
        district: '9914f913-453c-413e-a6fd-553971769f2e',
        addressLine4: '2c390875-0a74-4fb6-93ec-fa33dbf50ab9',
        informantPermanentAddressSameAsCurrent: true,
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

  const statuses = [
    'READY_TO_SUBMIT',
    'SUBMITTING',
    'REGISTERING',
    'READY_TO_REJECT',
    'REJECTING',
    'READY_TO_APPROVE',
    'APPROVING',
    'READY_TO_ARCHIVE',
    'ARCHIVING',
    'READY_TO_REQUEST_CORRECTION',
    'REQUESTING_CORRECTION',
    'FAILED_NETWORK'
  ]
  const messages = [
    'Waiting to submit',
    'Submitting...',
    'Registering...',
    'Waiting to reject',
    'Rejecting...',
    'Sending for approval',
    'Submitting...',
    'Waiting to be archived',
    'Archiving...',
    'Waiting to request correction',
    'Requesting correction...',
    'Waiting to retry'
  ]
  const { store, history } = createStore()

  describe('When all the fields are fully provided', () => {
    it('renders texts in data rows for birth declarations', async () => {
      const declarations: IDeclaration[] = []
      statuses.map((status) =>
        declarations.push({
          ...birthApp,
          submissionStatus: status
        })
      )
      const comp = await createTestComponent(
        <OutBox declaration={declarations} />,
        { store, history }
      )
      const testComp = comp
      for (let i = 0; i < 6; i++) {
        testComp
          .find(`#row_${i}`)
          .find('span')
          .map((span, index) =>
            expect(span.text()).toBe(
              ['Birth', 'Eoin Morgan', messages[i], ''][index]
            )
          )
      }
    })

    it('renders texts in data rows for death declarations', async () => {
      const declarations: IDeclaration[] = []
      statuses.map((status) =>
        declarations.push({
          ...deathApp,
          submissionStatus: status
        })
      )
      const comp = await createTestComponent(
        <OutBox declaration={declarations} />,
        { store, history }
      )
      const testComp = comp
      for (let i = 0; i < 6; i++) {
        testComp
          .find(`#row_${i}`)
          .find('span')
          .map((span, index) =>
            expect(span.text()).toBe(
              ['Death', 'Aaron Finch', messages[i], ''][index]
            )
          )
      }
    })
    it('shows "Waiting to register" if no status is provided', async () => {
      const declarations: IDeclaration[] = []
      declarations.push({
        ...deathApp,
        submissionStatus: ''
      })

      const comp = await createTestComponent(
        <OutBox declaration={declarations} />,
        { store, history }
      )
      const testComp = comp
      testComp
        .find(`#row_0`)
        .find('span')
        .map((span, index) =>
          expect(span.text()).toBe(
            ['Death', 'Aaron Finch', 'Waiting to register', ''][index]
          )
        )
    })
  })

  describe('When a part of the name or the whole name is missing', () => {
    it('displays only the last name if there is no first name', async () => {
      const noFirstNameBirthApp = birthApp
      noFirstNameBirthApp.data.child.firstNamesEng = ''
      const comp = await createTestComponent(
        <OutBox declaration={[noFirstNameBirthApp]} />,
        { store, history }
      )
      const testComp = comp
      testComp
        .find('#row_0')
        .find('span')
        .map((span, index) =>
          expect(span.text()).toBe(
            ['Birth', 'Morgan', 'Waiting to submit', ''][index]
          )
        )
    })

    it('displays only the first name if there is no last name', async () => {
      const noLastNameDeathApp = deathApp
      noLastNameDeathApp.data.deceased.familyNameEng = ''
      const comp = await createTestComponent(
        <OutBox declaration={[noLastNameDeathApp]} />,
        { store, history }
      )
      const testComp = comp
      testComp
        .find('#row_1')
        .find('span')
        .map((span, index) =>
          expect(span.text()).toBe(
            ['Death', 'Finch', 'Waiting to submit', ''][index]
          )
        )
    })
    it('displays empty string if there is no name', async () => {
      const noNameBirthApp = birthApp
      noNameBirthApp.data.child.firstNamesEng = ''
      noNameBirthApp.data.child.familyNameEng = ''

      const comp = await createTestComponent(
        <OutBox declaration={[noNameBirthApp]} />,
        { store, history }
      )
      const testComp = comp
      testComp
        .find('#row_1')
        .find('span')
        .map((span, index) =>
          expect(span.text()).toBe(
            ['Birth', '', 'Waiting to submit', ''][index]
          )
        )
    })
    it('displays empty div if there is no declaration', async () => {
      const comp = await createTestComponent(<OutBox declaration={[]} />, {
        store,
        history
      })
      const testComp = comp
      expect(testComp.find('#row_0').exists()).toBeFalsy()
    })
  })

  describe('Pagination/loadmore test for more than 10 declarations', () => {
    const declarations: IDeclaration[] = []
    for (let i = 0; i < 16; i++) {
      declarations.push(birthApp)
    }
    it('shows pagination bar when pagination is used', async () => {
      const testComp = await createTestComponent(
        <OutBox declaration={declarations} showPaginated={true} />,
        { store, history }
      )
      expect(testComp.exists('#pagination')).toBeTruthy()
      testComp
        .find('#pagination')
        .children()
        .map((child) => child.simulate('click'))
    })
    it('shows loadmore button when loadmore is used', async () => {
      const testComp = await createTestComponent(
        <OutBox declaration={declarations} showPaginated={false} />,
        { store, history }
      )
      expect(testComp.exists('#load_more_button')).toBeTruthy()
      testComp
        .find('#load_more_button')
        .children()
        .map((child) => child.simulate('click'))
    })
  })
})
