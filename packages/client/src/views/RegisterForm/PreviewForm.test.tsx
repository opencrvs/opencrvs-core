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
  createTestApp,
  getItem,
  mockDeclarationData,
  goToEndOfForm,
  waitForReady,
  validateScopeToken
} from '@client/tests/util'
import {
  DRAFT_BIRTH_PARENT_FORM,
  REVIEW_EVENT_PARENT_FORM_PAGE,
  HOME
} from '@client/navigation/routes'
import {
  storeDeclaration,
  IDeclaration,
  SUBMISSION_STATUS,
  createReviewDeclaration
} from '@client/declarations'
import { ReactWrapper } from 'enzyme'
import { History } from 'history'
import { Store } from 'redux'

import { Event } from '@client/forms'
import { v4 as uuid } from 'uuid'
// eslint-disable-next-line no-restricted-imports
import * as ReactApollo from 'react-apollo'
import { checkAuth } from '@opencrvs/client/src/profile/profileActions'

import { waitForElement, waitForSeconds } from '@client/tests/wait-for-element'

interface IPersonDetails {
  [key: string]: any
}

describe('when user is previewing the form data', () => {
  let app: ReactWrapper
  let history: History
  let store: Store

  beforeEach(async () => {
    const testApp = await createTestApp()
    app = testApp.app
    history = testApp.history
    store = testApp.store
    await waitForReady(app)
  })

  describe('when user is in the preview section', () => {
    let customDraft: IDeclaration

    const childDetails: IPersonDetails = {
      firstNamesEng: 'Harry',
      familyNameEng: 'Kane',
      gender: 'male',
      childBirthDate: '2020-02-02',
      attendantAtBirth: 'NURSE',
      birthType: 'SINGLE',
      multipleBirth: 1,
      weightAtBirth: 5,
      placeOfBirthTitle: '',
      placeOfBirth: 'HEALTH_FACILITY',
      birthLocation: 'ecc82ed2-960d-4a92-9c42-67cace118a02',
      country: 'FAR',
      state: 'bac22b09-1260-4a59-a5b9-c56c43ae889c',
      district: '852b103f-2fe0-4871-a323-51e51c6d9198',
      ruralOrUrban: 'URBAN',
      addressChief: '',
      addressLine4CityOption: '',
      addressLine3CityOption: '',
      addressLine2CityOption: '',
      numberOption: '',
      addressLine1: '',
      internationalState: '',
      internationalDistrict: '',
      internationalCity: '',
      internationalAddressLine1: '',
      internationalAddressLine2: '',
      internationalAddressLine3: '',
      internationalPostcode: ''
    }

    const fatherDetails: IPersonDetails = {
      fathersDetailsExist: true,
      iD: '654654654',
      socialSecurityNo: '65454984',
      nationality: 'FAR',
      firstNamesEng: 'Frank',
      familyNameEng: 'Kane',
      fatherBirthDate: '1990-12-23',
      seperator: '',
      maritalStatus: 'MARRIED',
      occupation: 'Teacher',
      educationalAttainment: 'FIRST_STAGE_TERTIARY_ISCED_5',
      permanentAddressSameAsMother: true,
      permanentAddress: '',
      countryPermanent: 'FAR',
      statePermanent: '',
      districtPermanent: '',
      ruralOrUrbanPermanent: 'URBAN',
      addressChiefPermanent: '',
      addressLine4CityOptionPermanent: '',
      addressLine3CityOptionPermanent: '',
      addressLine2CityOptionPermanent: '',
      numberOptionPermanent: '',
      addressLine1Permanent: '',
      internationalStatePermanent: '',
      internationalDistrictPermanent: '',
      internationalCityPermanent: '',
      internationalAddressLine1Permanent: '',
      internationalAddressLine2Permanent: '',
      internationalAddressLine3Permanent: '',
      internationalPostcodePermanent: ''
    }

    const motherDetails: IPersonDetails = {
      nationality: 'FAR',
      iD: '987987987',
      socialSecurityNo: 'aferf',
      firstNamesEng: 'Sally',
      familyNameEng: 'Kane',
      motherBirthDate: '1990-02-02',
      seperator: '',
      maritalStatus: 'MARRIED',
      occupation: 'Teacher',
      educationalAttainment: 'FIRST_STAGE_TERTIARY_ISCED_5',
      placeOfHeritage: '',
      countryPlaceOfHeritage: 'FAR',
      statePlaceOfHeritage: 'f050a94e-4e61-4cfb-a9ac-b3e96096e267',
      districtPlaceOfHeritage: 'dfe133d1-1aed-41b3-8a9d-c525f8bf19b9',
      addressChiefPlaceOfHeritage: 'My cheif',
      addressLine1PlaceOfHeritage: 'My village',
      internationalStatePlaceOfHeritage: '',
      internationalDistrictPlaceOfHeritage: '',
      internationalCityPlaceOfHeritage: '',
      internationalAddressLine1PlaceOfHeritage: '',
      internationalAddressLine2PlaceOfHeritage: '',
      internationalAddressLine3PlaceOfHeritage: '',
      internationalPostcodePlaceOfHeritage: '',
      permanentAddress: '',
      countryPermanent: 'FAR',
      statePermanent: '169981c1-89af-44f9-906a-bf783028ed14',
      districtPermanent: '3bde1e85-59fc-4b92-9477-95c9564b377d',
      ruralOrUrbanPermanent: 'URBAN',
      addressChiefPermanent: '',
      addressLine4CityOptionPermanent: 'My town',
      addressLine3CityOptionPermanent: 'My residential area',
      addressLine2CityOptionPermanent: 'My street',
      numberOptionPermanent: 19,
      addressLine1Permanent: '',
      internationalStatePermanent: '',
      internationalDistrictPermanent: '',
      internationalCityPermanent: '',
      internationalAddressLine1Permanent: '',
      internationalAddressLine2Permanent: '',
      internationalAddressLine3Permanent: '',
      internationalPostcodePermanent: '',
      currentAddressSameAsPermanent: true,
      currentAddress: '',
      country: 'FAR',
      state: '',
      district: '',
      ruralOrUrban: 'URBAN',
      addressChief: '',
      addressLine4CityOption: '',
      addressLine3CityOption: '',
      addressLine2CityOption: '',
      numberOption: '',
      addressLine1: '',
      internationalState: '',
      internationalDistrict: '',
      internationalCity: '',
      internationalAddressLine1: '',
      internationalAddressLine2: '',
      internationalAddressLine3: '',
      internationalPostcode: ''
    }

    const registrationDetails = {
      commentsOrNotes: 'comments',
      registrationCertificateLanguage: ['en'],
      informantType: {
        value: 'MOTHER',
        nestedFields: { otherInformantType: '' }
      },
      contactPoint: {
        value: 'OTHER',
        nestedFields: { registrationPhone: '0787878787' }
      }
    }

    beforeEach(async () => {
      const data = {
        child: childDetails,
        father: fatherDetails,
        mother: motherDetails,
        registration: registrationDetails,
        documents: { imageUploader: '' }
      }

      customDraft = {
        id: uuid(),
        data,
        event: Event.BIRTH,
        submissionStatus: SUBMISSION_STATUS[SUBMISSION_STATUS.DRAFT]
      }
      store.dispatch(storeDeclaration(customDraft))
      history.replace(
        DRAFT_BIRTH_PARENT_FORM.replace(
          ':declarationId',
          customDraft.id.toString()
        )
      )

      await waitForElement(app, '#readyDeclaration')
    })

    describe('when user clicks the "submit" button', () => {
      beforeEach(async () => {
        await goToEndOfForm(app)
      })

      it('check whether submit button is enabled or not', async () => {
        expect(app.find('#submit_form').hostNodes().prop('disabled')).toBe(
          false
        )
      })
      describe('All sections visited', () => {
        it('Should be able to click SEND FOR REVIEW Button', () => {
          expect(app.find('#submit_form').hostNodes().prop('disabled')).toBe(
            false
          )
        })
        describe('button clicked', () => {
          beforeEach(async () => {
            app.find('#submit_form').hostNodes().simulate('click')
          })

          it('confirmation screen should show up', () => {
            expect(app.find('#submit_confirm').hostNodes()).toHaveLength(1)
          })
          it('should redirect to home page', () => {
            app.find('#submit_confirm').hostNodes().simulate('click')
            expect(history.location.pathname).toBe(HOME)
          })
        })
      })
    })
  })
  describe('when user is in the birth review section', () => {
    let customDraft: IDeclaration

    const childDetails: IPersonDetails = {
      attendantAtBirth: 'NURSE',
      childBirthDate: '1999-10-10',
      familyName: 'ইসলাম',
      familyNameEng: 'Islam',
      firstNames: 'নাইম',
      firstNamesEng: 'Naim',
      gender: 'male',
      multipleBirth: '2',
      birthType: 'SINGLE',
      weightAtBirth: '6',
      _fhirID: '1'
    }

    const fatherDetails: IPersonDetails = {
      fathersDetailsExist: true,
      iD: '2342434534565',
      iDType: 'NATIONAL_ID',
      addressSameAsMother: true,
      permanentAddressSameAsMother: true,
      country: 'BGD',
      countryPermanent: 'BGD',
      currentAddress: '',
      fatherBirthDate: '1999-10-10',
      dateOfMarriage: '2010-10-10',
      educationalAttainment: 'PRIMARY_ISCED_1',
      familyName: 'ইসলাম',
      familyNameEng: 'Islam',
      firstNames: 'আনোয়ার',
      firstNamesEng: 'Anwar',
      maritalStatus: 'MARRIED',
      nationality: 'BGD',
      _fhirID: '2'
    }

    const motherDetails: IPersonDetails = {
      iD: '2342434534565',
      iDType: 'NATIONAL_ID',
      country: 'BGD',
      nationality: 'BGD',
      familyName: 'ইসলাম',
      familyNameEng: 'Islam',
      firstNames: 'রোকেয়া',
      firstNamesEng: 'Rokeya',
      maritalStatus: 'MARRIED',
      dateOfMarriage: '2010-10-10',
      motherBirthDate: '1999-10-10',
      educationalAttainment: 'PRIMARY_ISCED_1',
      addressLine1: 'Rd #10',
      addressLine1Permanent: 'Rd#10',
      addressLine2: 'Akua',
      addressLine2Permanent: 'Akua',
      addressLine3: 'union1',
      addressLine3Permanent: 'union1',
      addressLine4: 'upazila10',
      addressLine4Permanent: 'upazila10',
      countryPermanent: 'BGD',
      currentAddress: '',
      district: 'district2',
      districtPermanent: 'district2',
      permanentAddress: '',
      currentAddressSameAsPermanent: true,
      postCode: '1020',
      postCodePermanent: '1010',
      state: 'state4',
      statePermanent: 'state4',
      _fhirID: '3'
    }

    const registrationDetails = {
      commentsOrNotes: 'comments',
      paperFormNumber: '423424245455',
      informantType: 'MOTHER',
      registrationCertificateLanguage: ['en'],
      registrationEmail: 'arman@gmail.com',
      registrationPhone: '01736478884',
      whoseContactDetails: 'MOTHER',
      trackingId: 'B123456',
      registrationNumber: '2019121525B1234568',
      _fhirID: '4'
    }
    const registerScopeToken =
      'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJyZWdpc3RlciIsImNlcnRpZnkiLCJkZW1vIl0sImlhdCI6MTU0MjY4ODc3MCwiZXhwIjoxNTQzMjkzNTcwLCJhdWQiOlsib3BlbmNydnM6YXV0aC11c2VyIiwib3BlbmNydnM6dXNlci1tZ250LXVzZXIiLCJvcGVuY3J2czpoZWFydGgtdXNlciIsIm9wZW5jcnZzOmdhdGV3YXktdXNlciIsIm9wZW5jcnZzOm5vdGlmaWNhdGlvbi11c2VyIiwib3BlbmNydnM6d29ya2Zsb3ctdXNlciJdLCJpc3MiOiJvcGVuY3J2czphdXRoLXNlcnZpY2UiLCJzdWIiOiI1YmVhYWY2MDg0ZmRjNDc5MTA3ZjI5OGMifQ.ElQd99Lu7WFX3L_0RecU_Q7-WZClztdNpepo7deNHqzro-Cog4WLN7RW3ZS5PuQtMaiOq1tCb-Fm3h7t4l4KDJgvC11OyT7jD6R2s2OleoRVm3Mcw5LPYuUVHt64lR_moex0x_bCqS72iZmjrjS-fNlnWK5zHfYAjF2PWKceMTGk6wnI9N49f6VwwkinJcwJi6ylsjVkylNbutQZO0qTc7HRP-cBfAzNcKD37FqTRNpVSvHdzQSNcs7oiv3kInDN5aNa2536XSd3H-RiKR9hm9eID9bSIJgFIGzkWRd5jnoYxT70G0t03_mTVnDnqPXDtyI-lmerx24Ost0rQLUNIg'

    beforeEach(async () => {
      getItem.mockReturnValue(registerScopeToken)
      await store.dispatch(checkAuth({ '?token': registerScopeToken }))
      const data = {
        _fhirIDMap: {
          composition: '11'
        },
        child: childDetails,
        father: fatherDetails,
        mother: motherDetails,
        registration: registrationDetails,
        documents: {
          imageUploader: [
            {
              data: 'base64-data',
              type: 'image/jpeg',
              optionValues: ['Mother', 'National ID (front)'],
              title: 'Mother',
              description: 'National ID (front)'
            }
          ]
        }
      }

      customDraft = { id: uuid(), data, review: true, event: Event.BIRTH }
      store.dispatch(storeDeclaration(customDraft))
      history.replace(
        REVIEW_EVENT_PARENT_FORM_PAGE.replace(
          ':declarationId',
          customDraft.id.toString()
        )
          .replace(':event', 'birth')
          .replace(':pageId', 'review')
      )
      await waitForElement(app, '#readyDeclaration')
    })

    it('rejecting declaration redirects to home screen', async () => {
      jest.setMock('react-apollo', { default: ReactApollo })

      app.find('#rejectDeclarationBtn').hostNodes().simulate('click')

      app.find('#rejectionReasonmisspelling').hostNodes().simulate('change')

      app
        .find('#rejectionCommentForHealthWorker')
        .hostNodes()
        .simulate('change', {
          target: {
            id: 'rejectionCommentForHealthWorker',
            value: 'reject reason'
          }
        })

      app.find('#submit_reject_form').hostNodes().simulate('click')

      expect(history.location.pathname).toEqual('/')
    })
  })
  describe('when user is in the death review section', () => {
    let customDraft: IDeclaration

    const deceasedDetails = {
      iD: '987987987',
      socialSecurityNo: 'dstgsgs',
      nationality: 'FAR',
      firstNamesEng: 'Harry',
      familyNameEng: 'Kane',
      birthDate: '1990-02-02',
      gender: 'male',
      seperator: '',
      maritalStatus: 'MARRIED',
      occupation: 'Teacher',
      permanentAddress: '',
      countryPermanent: 'FAR',
      statePermanent: '169981c1-89af-44f9-906a-bf783028ed14',
      districtPermanent: '871f290e-8c7c-4643-b79b-2465af5f3303',
      ruralOrUrbanPermanent: 'URBAN',
      addressChiefPermanent: '',
      addressLine4CityOptionPermanent: 'My town',
      addressLine3CityOptionPermanent: 'My residential area',
      addressLine2CityOptionPermanent: 'My street',
      numberOptionPermanent: 19,
      addressLine1Permanent: '',
      internationalStatePermanent: '',
      internationalDistrictPermanent: '',
      internationalCityPermanent: '',
      internationalAddressLine1Permanent: '',
      internationalAddressLine2Permanent: '',
      internationalAddressLine3Permanent: '',
      internationalPostcodePermanent: '',
      _fhirID: '50fbd713-c86d-49fe-bc6a-52094b40d8dd'
    }

    const informantDetails = {
      nationality: 'FAR',
      informantID: '654654654',
      firstNamesEng: 'Sally',
      familyNameEng: 'Kane',
      relationship: '',
      permanentAddress: '',
      countryPermanent: 'FAR',
      statePermanent: 'ef97aebc-2461-473f-bf6e-456ed1e1a217',
      districtPermanent: '901a5fc1-456e-4f9c-9d3e-1859ad321837',
      ruralOrUrbanPermanent: 'URBAN',
      addressChiefPermanent: '',
      addressLine4CityOptionPermanent: 'My Town',
      addressLine3CityOptionPermanent: 'My area',
      addressLine2CityOptionPermanent: 'My street',
      numberOptionPermanent: 12,
      addressLine1Permanent: '',
      internationalState: '',
      internationalDistrict: '',
      internationalCity: '',
      internationalAddressLine1: '',
      internationalAddressLine2: '',
      internationalAddressLine3: '',
      internationalPostcode: '',
      _fhirIDMap: {
        relatedPerson: 'c9e3e5cb-d483-4db4-afaa-625161826f00',
        individual: 'cabeeea7-0f7d-41c3-84ed-8f88e4d617e1'
      }
    }

    const fatherDetails = {
      fatherFirstNamesEng: 'Bill',
      fatherFamilyNameEng: 'Kane'
    }

    const motherDetails = {
      motherFirstNamesEng: 'Francis',
      motherFamilyNameEng: 'Kane'
    }

    const spouseDetails = {
      hasDetails: {
        value: 'Yes',
        nestedFields: {
          spouseFirstNamesEng: 'Sally',
          spouseFamilyNameEng: 'Kane'
        }
      }
    }

    const deathEventDetails = {
      deathDate: '2022-04-10',
      manner: 'NATURAL_CAUSES',
      deathPlaceAddress: 'PERMANENT'
    }
    const causeOfDeathDetails = {
      causeOfDeathEstablished: true,
      paragraph: '',
      causeOfDeathCode: 'Natural causes'
    }

    const registrationDetails = {
      _fhirID: 'fccf6eac-4dae-43d3-af33-2c977d1daf08',
      trackingId: 'DS8QZ0Z',
      type: 'death',
      informantType: {
        value: 'SPOUSE',
        nestedFields: { otherInformantType: '' }
      },
      contactPoint: {
        value: 'SPOUSE',
        nestedFields: { registrationPhone: '0787877877' }
      }
    }

    const registerScopeToken =
      'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJyZWdpc3RlciIsImNlcnRpZnkiLCJkZW1vIl0sImlhdCI6MTU0MjY4ODc3MCwiZXhwIjoxNTQzMjkzNTcwLCJhdWQiOlsib3BlbmNydnM6YXV0aC11c2VyIiwib3BlbmNydnM6dXNlci1tZ250LXVzZXIiLCJvcGVuY3J2czpoZWFydGgtdXNlciIsIm9wZW5jcnZzOmdhdGV3YXktdXNlciIsIm9wZW5jcnZzOm5vdGlmaWNhdGlvbi11c2VyIiwib3BlbmNydnM6d29ya2Zsb3ctdXNlciJdLCJpc3MiOiJvcGVuY3J2czphdXRoLXNlcnZpY2UiLCJzdWIiOiI1YmVhYWY2MDg0ZmRjNDc5MTA3ZjI5OGMifQ.ElQd99Lu7WFX3L_0RecU_Q7-WZClztdNpepo7deNHqzro-Cog4WLN7RW3ZS5PuQtMaiOq1tCb-Fm3h7t4l4KDJgvC11OyT7jD6R2s2OleoRVm3Mcw5LPYuUVHt64lR_moex0x_bCqS72iZmjrjS-fNlnWK5zHfYAjF2PWKceMTGk6wnI9N49f6VwwkinJcwJi6ylsjVkylNbutQZO0qTc7HRP-cBfAzNcKD37FqTRNpVSvHdzQSNcs7oiv3kInDN5aNa2536XSd3H-RiKR9hm9eID9bSIJgFIGzkWRd5jnoYxT70G0t03_mTVnDnqPXDtyI-lmerx24Ost0rQLUNIg'

    beforeEach(async () => {
      getItem.mockReturnValue(registerScopeToken)
      await store.dispatch(checkAuth({ '?token': registerScopeToken }))
      const data = {
        _fhirIDMap: {
          composition: '11'
        },
        deceased: deceasedDetails,
        informant: informantDetails,
        father: fatherDetails,
        mother: motherDetails,
        spouse: spouseDetails,
        deathEvent: deathEventDetails,
        causeOfDeath: causeOfDeathDetails,
        registration: registrationDetails,
        documents: {
          imageUploader: [
            {
              data: 'base64-data',
              type: 'image/jpeg',
              optionValues: ['Mother', 'National ID (front)'],
              title: 'Mother',
              description: 'National ID (front)'
            }
          ]
        }
      }

      customDraft = { id: uuid(), data, review: true, event: Event.DEATH }
      store.dispatch(storeDeclaration(customDraft))
      history.replace(
        REVIEW_EVENT_PARENT_FORM_PAGE.replace(
          ':declarationId',
          customDraft.id.toString()
        )
          .replace(':event', 'death')
          .replace(':pageId', 'review')
      )
      await waitForElement(app, '#readyDeclaration')
    })

    it('successfully submits the review form', async () => {
      jest.setMock('react-apollo', { default: ReactApollo })
      app.update().find('#registerDeclarationBtn').hostNodes().simulate('click')
      app.update().find('#submit_confirm').hostNodes().simulate('click')
    })

    it('rejecting declaration redirects to reject confirmation screen', async () => {
      jest.setMock('react-apollo', { default: ReactApollo })

      app.find('#rejectDeclarationBtn').hostNodes().simulate('click')

      app.find('#rejectionReasonmisspelling').hostNodes().simulate('change')

      app
        .find('#rejectionCommentForHealthWorker')
        .hostNodes()
        .simulate('change', {
          target: {
            id: 'rejectionCommentForHealthWorker',
            value: 'reject reason'
          }
        })

      app.find('#submit_reject_form').hostNodes().simulate('click')

      expect(history.location.pathname).toEqual('/')
    })
  })

  describe('when user has validate scope', () => {
    beforeEach(async () => {
      getItem.mockReturnValue(validateScopeToken)
      await store.dispatch(checkAuth({ '?token': validateScopeToken }))
      const data = {
        _fhirIDMap: {
          composition: '16'
        },
        ...mockDeclarationData
      }

      const customDraft = createReviewDeclaration(uuid(), data, Event.BIRTH)
      customDraft.submissionStatus = SUBMISSION_STATUS[SUBMISSION_STATUS.DRAFT]

      store.dispatch(storeDeclaration(customDraft))
      history.replace(
        REVIEW_EVENT_PARENT_FORM_PAGE.replace(
          ':declarationId',
          customDraft.id.toString()
        )
          .replace(':event', 'birth')
          .replace(':pageId', 'review')
      )
      app.update()
    })

    it('shows send for review button', async () => {
      await waitForElement(app, '#readyDeclaration')

      expect(
        app.update().find('#validateDeclarationBtn').hostNodes().text()
      ).toBe('Send For Approval')
    })
  })
})
