import {
  createTestApp,
  mockOfflineData,
  assign,
  validToken,
  getItem,
  flushPromises,
  setItem
} from '@register/tests/util'
import {
  DRAFT_BIRTH_PARENT_FORM,
  REVIEW_EVENT_PARENT_FORM_PAGE,
  HOME
} from '@register/navigation/routes'
import {
  storeApplication,
  IApplication,
  SUBMISSION_STATUS
} from '@register/applications'
import { ReactWrapper } from 'enzyme'
import { History } from 'history'
import { Store } from 'redux'
import { getOfflineDataSuccess } from '@register/offline/actions'
import { storage } from '@register/storage'
import { Event } from '@register/forms'
import { v4 as uuid } from 'uuid'
import * as ReactApollo from 'react-apollo'
import { checkAuth } from '@opencrvs/register/src/profile/profileActions'
import * as CommonUtils from '@register/utils/commonUtils'

import * as fetchAny from 'jest-fetch-mock'

const fetch = fetchAny as any

interface IPersonDetails {
  [key: string]: any
}

storage.getItem = jest.fn()
storage.setItem = jest.fn()
jest.spyOn(CommonUtils, 'isMobileDevice').mockReturnValue(true)

beforeEach(() => {
  window.history.replaceState({}, '', '/')
  assign.mockClear()
})

describe('when user is previewing the form data', () => {
  let app: ReactWrapper
  let history: History
  let store: Store

  beforeEach(async () => {
    getItem.mockReturnValue(validToken)
    setItem.mockClear()
    fetch.resetMocks()
    fetch.mockResponses(
      [JSON.stringify({ data: mockOfflineData.locations }), { status: 200 }],
      [JSON.stringify({ data: mockOfflineData.facilities }), { status: 200 }]
    )
    const testApp = createTestApp()
    app = testApp.app
    await flushPromises()
    app.update()
    history = testApp.history
    store = testApp.store
    store.dispatch(getOfflineDataSuccess(JSON.stringify(mockOfflineData)))
  })

  describe('when user is in the preview section', () => {
    let customDraft: IApplication

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
      presentAtBirthRegistration: 'MOTHER_ONLY',
      registrationCertificateLanguage: ['en'],
      registrationPhone: '01736478884',
      whoseContactDetails: 'MOTHER'
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
      store.dispatch(storeApplication(customDraft))
      history.replace(
        DRAFT_BIRTH_PARENT_FORM.replace(
          ':applicationId',
          customDraft.id.toString()
        )
      )

      app.update()
      app
        .find('#createPinBtn')
        .hostNodes()
        .simulate('click')
      await flushPromises()
      app.update()
      for (let i = 1; i <= 8; i++) {
        app
          .find(`#keypad-${i % 2}`)
          .hostNodes()
          .simulate('click')
      }
      await flushPromises()
      app.update()
    })

    describe('when user clicks the "submit" button', () => {
      beforeEach(async () => {
        app
          .find('#next_section')
          .hostNodes()
          .simulate('click')
        await flushPromises()
        app.update()
        app
          .find('#next_section')
          .hostNodes()
          .simulate('click')
        await flushPromises()
        app.update()
        app
          .find('#next_section')
          .hostNodes()
          .simulate('click')
        await flushPromises()
        app.update()
        app
          .find('#next_section')
          .hostNodes()
          .simulate('click')
        await flushPromises()
        app.update()
        app
          .find('#next_section')
          .hostNodes()
          .simulate('click')
        await flushPromises()
        app.update()
      })

      it('check whether submit button is enabled or not', () => {
        expect(
          app
            .find('#submit_form')
            .hostNodes()
            .prop('disabled')
        ).toBe(true)
      })
      describe('All sections visited', () => {
        beforeEach(async () => {
          app
            .find('#next_button_child')
            .hostNodes()
            .simulate('click')
          app
            .find('#next_button_mother')
            .hostNodes()
            .simulate('click')
          app
            .find('#next_button_father')
            .hostNodes()
            .simulate('click')
          await flushPromises()
          app.update()
        })

        it('Should be able to click SEND FOR REVIEW Button', () => {
          // console.log(app.debug())
          expect(
            app
              .find('#submit_form')
              .hostNodes()
              .prop('disabled')
          ).toBe(false)
        })
        describe('button clicked', () => {
          beforeEach(async () => {
            app
              .find('#submit_form')
              .hostNodes()
              .simulate('click')

            await flushPromises()
            app.update()
          })

          it('confirmation screen should show up', () => {
            expect(app.find('#submit_confirm').hostNodes()).toHaveLength(1)
          })
          it('should redirect to home page', () => {
            app
              .find('#submit_confirm')
              .hostNodes()
              .simulate('click')
            app.update()
            expect(history.location.pathname).toBe(HOME)
          })
        })
      })
    })

    describe('when user clicks save as draft button', () => {
      beforeEach(async () => {
        app
          .find('#save_as_draft')
          .hostNodes()
          .simulate('click')

        await flushPromises()
        app.update()
      })
      it('should display draft saved notification', () => {
        expect(app.find('#draftsSavedNotification').hostNodes()).toHaveLength(1)
      })
      it('should hide draft saved notification when clicked', async () => {
        app
          .find('#draftsSavedNotification')
          .hostNodes()
          .simulate('click')

        await flushPromises()
        app.update()
        expect(app.find('#draftsSavedNotification').hostNodes()).toHaveLength(0)
      })
    })
  })
  describe('when user is in the birth review section', () => {
    let customDraft: IApplication

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
      store.dispatch(checkAuth({ '?token': registerScopeToken }))
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
      store.dispatch(storeApplication(customDraft))
      history.replace(
        REVIEW_EVENT_PARENT_FORM_PAGE.replace(
          ':applicationId',
          customDraft.id.toString()
        )
          .replace(':event', 'birth')
          .replace(':pageId', 'review')
      )
      app.update()
      app
        .find('#createPinBtn')
        .hostNodes()
        .simulate('click')
      await flushPromises()
      app.update()
      for (let i = 1; i <= 8; i++) {
        app
          .find(`#keypad-${i % 2}`)
          .hostNodes()
          .simulate('click')
      }
      await flushPromises()
      app.update()
    })

    it('review page should show up', () => {
      const reviewTitle = app
        .find('#view_title')
        .hostNodes()
        .text()
      expect(reviewTitle).toEqual('Birth Registration Review')
    })
    it('successfully submits the review form', async () => {
      jest.setMock('react-apollo', { default: ReactApollo })
      app
        .find('#next_button_child')
        .hostNodes()
        .simulate('click')

      app
        .find('#next_button_mother')
        .hostNodes()
        .simulate('click')

      app
        .find('#next_button_father')
        .hostNodes()
        .simulate('click')

      app
        .find('#registerApplicationBtn')
        .hostNodes()
        .simulate('click')

      app
        .find('#register_confirm')
        .hostNodes()
        .simulate('click')

      await flushPromises()
      app.update()
    })

    it('preview link will close the modal', async () => {
      jest.setMock('react-apollo', { default: ReactApollo })
      app
        .find('#next_button_child')
        .hostNodes()
        .simulate('click')

      app
        .find('#next_button_mother')
        .hostNodes()
        .simulate('click')

      app
        .find('#next_button_father')
        .hostNodes()
        .simulate('click')

      app
        .find('#registerApplicationBtn')
        .hostNodes()
        .simulate('click')

      app
        .find('#register_cancel')
        .hostNodes()
        .simulate('click')

      await flushPromises()
      app.update()

      expect(app.find('#register_cancel').hostNodes()).toHaveLength(0)
    })
    it('rejecting application redirects to home screen', async () => {
      jest.setMock('react-apollo', { default: ReactApollo })
      app
        .find('#next_button_child')
        .hostNodes()
        .simulate('click')

      app
        .find('#next_button_mother')
        .hostNodes()
        .simulate('click')

      app
        .find('#next_button_father')
        .hostNodes()
        .simulate('click')

      app
        .find('#rejectApplicationBtn')
        .hostNodes()
        .simulate('click')

      app
        .find('#rejectionReasonMisspelling')
        .hostNodes()
        .simulate('change')

      app
        .find('#rejectionCommentForHealthWorker')
        .hostNodes()
        .simulate('change', {
          target: {
            id: 'rejectionCommentForHealthWorker',
            value: 'reject reason'
          }
        })

      store.dispatch = jest.fn()
      app
        .find('#submit_reject_form')
        .hostNodes()
        .simulate('click')

      await flushPromises()
      app.update()

      expect(store.dispatch).toBeCalled()
      // expect(
      //   app
      //     .find('#submission_text')
      //     .hostNodes()
      //     .text()
      // ).toEqual('birth application has been rejected.')
    })
  })
  describe('when user is in the death review section', () => {
    let customDraft: IApplication

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
      district: '0d6af8ef-2d24-4e7d-93a7-6c0085df2760',
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
      applicantID: '123456789',
      applicantFirstNames: 'অনিক',
      applicantFamilyName: 'অনিক',
      applicantFirstNamesEng: 'Anik',
      applicantFamilyNameEng: 'Anik',
      nationality: 'BGD',
      applicantBirthDate: '1996-01-01',
      applicantsRelationToDeceased: 'EXTENDED_FAMILY',
      applicantPhone: '01622688231',
      country: 'BGD',
      state: 'ae181035-fbb4-472a-9222-ecd35b8bae31',
      district: '0d6af8ef-2d24-4e7d-93a7-6c0085df2760',
      addressLine4: '34c377a0-2223-4361-851c-5e230a96d957',
      addressLine3: '1f06d980-e254-4e6b-b049-a9b4e7155180',
      addressLine3CityOption: '',
      addressLine2: '12',
      addressLine1CityOption: '',
      postCodeCityOption: '12',
      addressLine1: '12',
      postCode: '12',
      applicantPermanentAddressSameAsCurrent: true,
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

    const deathEventDetails = {
      deathDate: '2019-01-01',
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
      type: 'death'
    }

    const registerScopeToken =
      'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJyZWdpc3RlciIsImNlcnRpZnkiLCJkZW1vIl0sImlhdCI6MTU0MjY4ODc3MCwiZXhwIjoxNTQzMjkzNTcwLCJhdWQiOlsib3BlbmNydnM6YXV0aC11c2VyIiwib3BlbmNydnM6dXNlci1tZ250LXVzZXIiLCJvcGVuY3J2czpoZWFydGgtdXNlciIsIm9wZW5jcnZzOmdhdGV3YXktdXNlciIsIm9wZW5jcnZzOm5vdGlmaWNhdGlvbi11c2VyIiwib3BlbmNydnM6d29ya2Zsb3ctdXNlciJdLCJpc3MiOiJvcGVuY3J2czphdXRoLXNlcnZpY2UiLCJzdWIiOiI1YmVhYWY2MDg0ZmRjNDc5MTA3ZjI5OGMifQ.ElQd99Lu7WFX3L_0RecU_Q7-WZClztdNpepo7deNHqzro-Cog4WLN7RW3ZS5PuQtMaiOq1tCb-Fm3h7t4l4KDJgvC11OyT7jD6R2s2OleoRVm3Mcw5LPYuUVHt64lR_moex0x_bCqS72iZmjrjS-fNlnWK5zHfYAjF2PWKceMTGk6wnI9N49f6VwwkinJcwJi6ylsjVkylNbutQZO0qTc7HRP-cBfAzNcKD37FqTRNpVSvHdzQSNcs7oiv3kInDN5aNa2536XSd3H-RiKR9hm9eID9bSIJgFIGzkWRd5jnoYxT70G0t03_mTVnDnqPXDtyI-lmerx24Ost0rQLUNIg'

    beforeEach(async () => {
      getItem.mockReturnValue(registerScopeToken)
      store.dispatch(checkAuth({ '?token': registerScopeToken }))
      const data = {
        _fhirIDMap: {
          composition: '11'
        },
        deceased: deceasedDetails,
        informant: informantDetails,
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
      // @ts-ignore
      customDraft = { id: uuid(), data, review: true, event: Event.DEATH }
      store.dispatch(storeApplication(customDraft))
      history.replace(
        REVIEW_EVENT_PARENT_FORM_PAGE.replace(
          ':applicationId',
          customDraft.id.toString()
        )
          .replace(':event', 'death')
          .replace(':pageId', 'review')
      )
      app.update()
      app
        .find('#createPinBtn')
        .hostNodes()
        .simulate('click')
      await flushPromises()
      app.update()
      for (let i = 1; i <= 8; i++) {
        app
          .find(`#keypad-${i % 2}`)
          .hostNodes()
          .simulate('click')
      }
      await flushPromises()
      app.update()
    })

    it('review page should show up', () => {
      const reviewTitle = app
        .find('#view_title')
        .hostNodes()
        .text()
      expect(reviewTitle).toEqual('Death Registration Review')
    })
    it('successfully submits the review form', async () => {
      jest.setMock('react-apollo', { default: ReactApollo })
      app
        .find('#next_button_deceased')
        .hostNodes()
        .simulate('click')

      app
        .find('#next_button_informant')
        .hostNodes()
        .simulate('click')

      app
        .find('#next_button_deathEvent')
        .hostNodes()
        .simulate('click')

      app
        .find('#registerApplicationBtn')
        .hostNodes()
        .simulate('click')

      app
        .find('#register_confirm')
        .hostNodes()
        .simulate('click')

      await flushPromises()
      app.update()
    })
    it('rejecting application redirects to reject confirmation screen', async () => {
      jest.setMock('react-apollo', { default: ReactApollo })
      app
        .find('#next_button_deceased')
        .hostNodes()
        .simulate('click')

      app
        .find('#next_button_informant')
        .hostNodes()
        .simulate('click')

      app
        .find('#next_button_deathEvent')
        .hostNodes()
        .simulate('click')

      app
        .find('#rejectApplicationBtn')
        .hostNodes()
        .simulate('click')

      app
        .find('#rejectionReasonMisspelling')
        .hostNodes()
        .simulate('change')

      app
        .find('#rejectionCommentForHealthWorker')
        .hostNodes()
        .simulate('change', {
          target: {
            id: 'rejectionCommentForHealthWorker',
            value: 'reject reason'
          }
        })

      store.dispatch = jest.fn()
      app
        .find('#submit_reject_form')
        .hostNodes()
        .simulate('click')

      await new Promise(resolve => {
        setTimeout(resolve, 500)
      })
      await flushPromises()
      app.update()
      expect(store.dispatch).toBeCalled()
    })
  })
})
