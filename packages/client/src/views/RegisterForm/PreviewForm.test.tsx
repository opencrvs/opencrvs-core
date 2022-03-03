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

import { waitForElement } from '@client/tests/wait-for-element'

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
      attendantAtBirth: 'NURSE',
      childBirthDate: '1999-10-10',
      familyName: 'ইসলাম',
      familyNameEng: 'Islam',
      firstNames: 'নাইম',
      firstNamesEng: 'Naim',
      gender: 'male',
      placeOfBirth: 'HOSPITAL',
      birthLocation: '90d39759-7f02-4646-aca3-9272b4b5ce5a',
      multipleBirth: '2',
      birthType: 'SINGLE',
      weightAtBirth: '5'
    }

    const fatherDetails: IPersonDetails = {
      fathersDetailsExist: true,
      iD: '23423442342423424',
      iDType: 'OTHER',
      iDTypeOther: 'Taxpayer Identification Number',
      addressSameAsMother: true,
      permanentAddressSameAsMother: true,
      country: 'BGD',
      countryPermanent: 'BGD',
      currentAddress: '',
      motherBirthDate: '1999-10-10',
      dateOfMarriage: '2010-10-10',
      educationalAttainment: 'PRIMARY_ISCED_1',
      familyName: 'ইসলাম',
      familyNameEng: 'Islam',
      firstNames: 'আনোয়ার',
      firstNamesEng: 'Anwar',
      maritalStatus: 'MARRIED',
      nationality: 'BGD'
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
      fatherBirthDate: '1999-10-10',
      educationalAttainment: 'PRIMARY_ISCED_1',
      currentAddressSameAsPermanent: true,
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
      postCode: '1020',
      postCodePermanent: '1010',
      state: 'state4',
      statePermanent: 'state4'
    }

    const registrationDetails = {
      commentsOrNotes: 'comments',
      presentAtBirthRegistration: 'MOTHER',
      registrationCertificateLanguage: ['en'],
      whoseContactDetails: 'MOTHER',
      informant: {
        value: 'OTHER',
        nestedFields: {
          otherRelationShip: 'Friend'
        }
      },
      contactPoint: {
        value: 'OTHER',
        nestedFields: {
          registrationPhone: '01717000000',
          contactRelationshipOther: 'grandma'
        }
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
      beforeEach(async () => goToEndOfForm(app))

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
      presentAtBirthRegistration: 'MOTHER_ONLY',
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
      iDType: 'PASSPORT',
      iD: '123456789',
      firstNames: 'অনিক',
      familyName: 'অনিক',
      firstNamesEng: 'Anik',
      familyNameEng: 'anik',
      nationality: 'BGD',
      gender: 'male',
      maritalStatus: 'MARRIED',
      birthDate: '1983-01-01',
      countryPermanent: 'BGD',
      statePermanent: 'ae181035-fbb4-472a-9222-ecd35b8bae31',
      districtPermanent: '0d6af8ef-2d24-4e7d-93a7-6c0085df2760',
      addressLine4Permanent: '34c377a0-2223-4361-851c-5e230a96d957',
      addressLine3Permanent: '1f06d980-e254-4e6b-b049-a9b4e7155180',
      addressLine3CityOptionPermanent: '',
      addressLine2Permanent: '12',
      addressLine1CityOptionPermanent: '',
      postCodeCityOptionPermanent: '12',
      addressLine1Permanent: '121',
      postCodePermanent: '12',
      currentAddressSameAsPermanent: true,
      country: 'BGD',
      state: 'ae181035-fbb4-472a-9222-ecd35b8bae31',
      internationalStatePermanent: 'ae181035-fbb4-472a-9222-ecd35b8bae31',
      district: '0d6af8ef-2d24-4e7d-93a7-6c0085df2760',
      internationalDistrictPermanent: '0d6af8ef-2d24-4e7d-93a7-6c0085df2760',
      addressLine4: '34c377a0-2223-4361-851c-5e230a96d957',
      addressLine3: '1f06d980-e254-4e6b-b049-a9b4e7155180',
      addressLine3CityOption: '',
      addressLine2: '12',
      addressLine1CityOption: '',
      postCodeCityOption: '12',
      addressLine1: '121',
      postCode: '12',
      _fhirID: '50fbd713-c86d-49fe-bc6a-52094b40d8dd'
    }

    const informantDetails = {
      iDType: 'PASSPORT',
      informantID: '123456789',
      informantFirstNames: 'অনিক',
      informantFamilyName: 'অনিক',
      informantFirstNamesEng: 'Anik',
      informantFamilyNameEng: 'Anik',
      nationality: 'BGD',
      informantBirthDate: '1996-01-01',
      informantPhone: '01622688231',
      relationship: 'OTHER',
      country: 'BGD',
      state: 'ae181035-fbb4-472a-9222-ecd35b8bae31',
      internationalState: 'ae181035-fbb4-472a-9222-ecd35b8bae31',
      district: '0d6af8ef-2d24-4e7d-93a7-6c0085df2760',
      internationalDistrict: '0d6af8ef-2d24-4e7d-93a7-6c0085df2760',
      addressLine4: '34c377a0-2223-4361-851c-5e230a96d957',
      addressLine3: '1f06d980-e254-4e6b-b049-a9b4e7155180',
      addressLine3CityOption: '',
      addressLine2: '12',
      addressLine1CityOption: '',
      postCodeCityOption: '12',
      addressLine1: '12',
      postCode: '12',
      informantPermanentAddressSameAsCurrent: true,
      countryPermanent: 'BGD',
      statePermanent: 'ae181035-fbb4-472a-9222-ecd35b8bae31',
      districtPermanent: '0d6af8ef-2d24-4e7d-93a7-6c0085df2760',
      addressLine4Permanent: '34c377a0-2223-4361-851c-5e230a96d957',
      addressLine3Permanent: '1f06d980-e254-4e6b-b049-a9b4e7155180',
      addressLine3CityOptionPermanent: '',
      addressLine2Permanent: '12',
      addressLine1CityOptionPermanent: '',
      postCodeCityOptionPermanent: '12',
      addressLine1Permanent: '12',
      postCodePermanent: '12',
      _fhirIDMap: {
        relatedPerson: 'c9e3e5cb-d483-4db4-afaa-625161826f00',
        individual: 'cabeeea7-0f7d-41c3-84ed-8f88e4d617e1'
      }
    }

    const fatherDetails = {
      fatherFirstNames: 'মোক্তার',
      fatherFamilyName: 'আলী',
      fatherFirstNamesEng: 'Moktar',
      fatherFamilyNameEng: 'Ali'
    }

    const motherDetails = {
      motherFirstNames: 'মরিউম',
      motherFamilyName: 'আলী',
      motherFirstNamesEng: 'Morium',
      motherFamilyNameEng: 'Ali'
    }

    const spouseDetails = {
      hasDetails: {
        value: 'Yes',
        nestedFields: {
          spouseFirstNames: 'রেহানা',
          spouseFamilyName: 'আলী',
          spouseFirstNamesEng: 'Rehana',
          spouseFamilyNameEng: 'Ali'
        }
      }
    }

    const deathEventDetails = {
      deathDate: '2017-01-01',
      manner: 'ACCIDENT',
      deathPlaceAddress: 'PERMANENT',
      country: 'BGD',
      state: 'ae181035-fbb4-472a-9222-ecd35b8bae31',
      district: '0d6af8ef-2d24-4e7d-93a7-6c0085df2760',
      addressLine4: '34c377a0-2223-4361-851c-5e230a96d957',
      addressLine3: '1f06d980-e254-4e6b-b049-a9b4e7155180',
      addressLine3CityOption: '',
      addressLine2: '12',
      addressLine1CityOption: '',
      postCodeCityOption: '12',
      addressLine1: '121',
      postCode: '12'
    }
    const causeOfDeathDetails = { causeOfDeathEstablished: false }

    const registrationDetails = {
      _fhirID: 'fccf6eac-4dae-43d3-af33-2c977d1daf08',
      trackingId: 'DS8QZ0Z',
      type: 'death',
      contactPoint: {
        value: 'OTHER',
        nestedFields: {
          registrationPhone: '0799999999',
          contactRelationshipOther: 'grandma'
        }
      },
      relationship: {
        value: 'OTHER',
        nestedFields: {
          otherRelationship: 'House owner'
        }
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
