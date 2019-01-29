import * as ReactApollo from 'react-apollo'
import {
  createTestApp,
  mockUserResponseWithName,
  mockOfflineData,
  userDetails
} from './tests/util'
import { config } from '../src/config'
import { v4 as uuid } from 'uuid'
import {
  HOME,
  SELECT_VITAL_EVENT,
  SELECT_INFORMANT,
  DRAFT_BIRTH_PARENT_FORM,
  REVIEW_BIRTH_PARENT_FORM_TAB
} from './navigation/routes'
import { ReactWrapper } from 'enzyme'
import { History } from 'history'
import { Store } from 'redux'
import { storeDraft, createDraft, IDraft } from './drafts'
import * as actions from 'src/notification/actions'
import * as i18nActions from 'src/i18n/actions'
import { storage } from 'src/storage'
import { queries } from 'src/profile/queries'
import { draftToMutationTransformer } from 'src/transformer'
import { getRegisterForm } from '@opencrvs/register/src/forms/register/application-selectors'
import {
  checkAuth,
  getStorageUserDetailsSuccess
} from '@opencrvs/register/src/profile/profileActions'
import { getOfflineDataSuccess } from 'src/offline/actions'
import { referenceApi } from 'src/utils/referenceApi'
import { createClient } from './utils/apolloClient'
import { Event, IForm } from '@opencrvs/register/src/forms'
import { clone } from 'lodash'

interface IPersonDetails {
  [key: string]: any
}

storage.getItem = jest.fn()
storage.setItem = jest.fn()
const assign = window.location.assign as jest.Mock
const getItem = window.localStorage.getItem as jest.Mock
const setItem = window.localStorage.setItem as jest.Mock
const mockFetchUserDetails = jest.fn()
mockFetchUserDetails.mockReturnValue(mockUserResponseWithName)
queries.fetchUserDetails = mockFetchUserDetails

const mockFetchLocations = jest.fn()
mockFetchLocations.mockReturnValue({
  data: [
    {
      id: 'ba819b89-57ec-4d8b-8b91-e8865579a40f',
      name: 'Barisal',
      nameBn: 'বরিশাল',
      physicalType: 'Jurisdiction',
      jurisdictionType: 'DIVISION',
      type: 'ADMIN_STRUCTURE',
      partOf: 'Location/0'
    }
  ]
})
referenceApi.loadLocations = mockFetchLocations

const mockFetchFacilities = jest.fn()
mockFetchLocations.mockReturnValue({
  data: [
    {
      id: '627fc0cc-e0e2-4c09-804d-38a9fa1807ee',
      name: 'Shaheed Taj Uddin Ahmad Medical College',
      nameBn: 'শহীদ তাজউদ্দিন আহমেদ মেডিকেল কলেজ হাসপাতাল',
      physicalType: 'Building',
      type: 'HEALTH_FACILITY',
      partOf: 'Location/3a5358d0-1bcd-4ea9-b0b7-7cfb7cbcbf0f'
    }
  ]
})
referenceApi.loadFacilities = mockFetchFacilities

function flushPromises() {
  return new Promise(resolve => setImmediate(resolve))
}

beforeEach(() => {
  history.replaceState({}, '', '/')
  assign.mockClear()
})

describe('when user does not have a token', () => {
  let store: Store
  beforeEach(() => {
    const testApp = createTestApp()
    store = testApp.store
    store.dispatch(getOfflineDataSuccess(JSON.stringify(mockOfflineData)))
  })

  it("redirects user to SSO if user doesn't have a token", async () => {
    await flushPromises()
    expect(assign.mock.calls[0][0]).toBe(config.LOGIN_URL)
  })
})

const validToken =
  'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJpYXQiOjE1MzMxOTUyMjgsImV4cCI6MTU0MzE5NTIyNywiYXVkIjpbImdhdGV3YXkiXSwic3ViIjoiMSJ9.G4KzkaIsW8fTkkF-O8DI0qESKeBI332UFlTXRis3vJ6daisu06W5cZsgYhmxhx_n0Q27cBYt2OSOnjgR72KGA5IAAfMbAJifCul8ib57R4VJN8I90RWqtvA0qGjV-sPndnQdmXzCJx-RTumzvr_vKPgNDmHzLFNYpQxcmQHA-N8li-QHMTzBHU4s9y8_5JOCkudeoTMOd_1021EDAQbrhonji5V1EOSY2woV5nMHhmq166I1L0K_29ngmCqQZYi1t6QBonsIowlXJvKmjOH5vXHdCCJIFnmwHmII4BK-ivcXeiVOEM_ibfxMWkAeTRHDshOiErBFeEvqd6VWzKvbKAH0UY-Rvnbh4FbprmO4u4_6Yd2y2HnbweSo-v76dVNcvUS0GFLFdVBt0xTay-mIeDy8CKyzNDOWhmNUvtVi9mhbXYfzzEkwvi9cWwT1M8ZrsWsvsqqQbkRCyBmey_ysvVb5akuabenpPsTAjiR8-XU2mdceTKqJTwbMU5gz-8fgulbTB_9TNJXqQlH7tyYXMWHUY3uiVHWg2xgjRiGaXGTiDgZd01smYsxhVnPAddQOhqZYCrAgVcT1GBFVvhO7CC-rhtNlLl21YThNNZNpJHsCgg31WA9gMQ_2qAJmw2135fAyylO8q7ozRUvx46EezZiPzhCkPMeELzLhQMEIqjo'

const expiredToken =
  'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiY2h3IiwiaWF0IjoxNTMwNzc2OTYxLCJleHAiOjE1MzA3Nzc1NjEsInN1YiI6IjViMzI1YTYyMGVmNDgxM2UzMDhhNDMxMyJ9.leJuSng-PmQvFCS-FrIl9-Z2iYitwuX274QHkDoVQGmHtfi9SsKIRmZ1OlNRS6g7eT4LvvUDjwBZvCO7Rvhf_vnrHmHE4JR_e9MWVoK_0vjxCkDmo-cZ6iM7aBzrB4-F1eaaZJwxrwPFY5o_rsxCAeHj-draVYQTEr388y-rffdaC7IHoHhTrGoj8n40d8RyvX7UVVG5w1zsxFhYlN44zvMDNy56zGpbJ7mNn3M6hJWGUjDaOhtsEpfyDeoeiuEkU4Rn_WxtbognqLt12P6TQWsQOy_eHqR2UfBdmPw_uSW28FFQh9ebOEjMSI0JnIFXagrWkkFVO2DcBh8YlGE5M_fZWrrkz9pTiVb1KQWTz_TPUf8VVlTRNBKCnumiQJRIkWNxIecYwKap_HpKd5SaD8sLgB3htmomfJE4h4nu-7Tjy_QYw_2Sm4upDCEcB-mjx_EeIVTQXk5Re3QMhY1hEh9tD0kDhJudPQWBG7g8GQy2ZBmy6CtP7FQ-tRdyOE_0TNazZSB4Ogz8im5c2ZSVRWalPZWp0TupiSWI5sY-k_Qab6hpbxAFxqsH-8eRelos4y9Ohh60mpNNIqZkizSLfoWKgR5tMBkyDbMPbfbDUEKYKSa5b29uCeAHeJXvW-A0Nk5YwiPNZIe2ycuVaWUaDnL3vvbb5yrTG1eDuhFm_xw'

describe('when user has a valid token in url but an expired one in localStorage', () => {
  beforeEach(() => {
    getItem.mockReturnValue(expiredToken)
    window.history.replaceState('', '', '?token=' + validToken)
    createTestApp()
  })

  it("doesn't redirect user to SSO", async () => {
    expect(assign.mock.calls).toHaveLength(0)
  })
})

describe('when session expired', () => {
  let app: ReactWrapper
  let store: Store

  beforeEach(() => {
    const testApp = createTestApp()
    app = testApp.app
    store = testApp.store
  })

  it('when apolloClient is created', () => {
    const client = createClient(store)
    expect(client.link).toBeDefined()
  })

  it('displays session expired confirmation dialog', () => {
    // @ts-ignore
    const action = actions.showSessionExpireConfirmation()
    store.dispatch(action)
    app.update()

    expect(app.find('#login').hostNodes()).toHaveLength(1)
  })
})

describe('when user has a valid token in local storage', () => {
  let app: ReactWrapper
  let history: History
  let store: Store

  beforeEach(() => {
    getItem.mockReturnValue(validToken)
    setItem.mockClear()

    const testApp = createTestApp()
    app = testApp.app
    history = testApp.history
    store = testApp.store
    store.dispatch(getOfflineDataSuccess(JSON.stringify(mockOfflineData)))
  })

  it("doesn't redirect user to SSO", async () => {
    expect(assign.mock.calls).toHaveLength(0)
  })

  it('should retrive saved drafts from storage', () => {
    expect(storage.getItem).toBeCalled()
  })

  describe('when user is in home view', () => {
    const registerUserDetails = Object.assign({}, userDetails)
    registerUserDetails.role = 'LOCAL_REGISTRAR'
    beforeEach(() => {
      store.dispatch(getStorageUserDetailsSuccess(JSON.stringify(userDetails)))
      history.replace(HOME)
      app.update()
    })
    it('lists the actions', () => {
      expect(app.find('#home_action_list').hostNodes()).toHaveLength(1)
    })
    describe('when user clicks the "Declare a new vital event" button', () => {
      beforeEach(() => {
        app
          .find('#new_event_declaration')
          .hostNodes()
          .simulate('click')
      })
      it('changes to new vital event screen', () => {
        expect(app.find('#select_birth_event').hostNodes()).toHaveLength(1)
      })
    })
    describe('when user has a register scope they are redirected to the work-queue', () => {
      beforeEach(() => {
        store.dispatch(
          getStorageUserDetailsSuccess(JSON.stringify(registerUserDetails))
        )
        app.update()
      })

      it('work queue view renders to load list', () => {
        expect(app.find('#work-queue-spinner').hostNodes()).toHaveLength(1)
      })
    })
  })

  describe('when appliation has new update', () => {
    beforeEach(() => {
      // @ts-ignore
      const action = actions.showNewContentAvailableNotification()
      store.dispatch(action)
      app.update()
    })

    it('displays update available notification', () => {
      app.debug()
      expect(
        app.find('#newContentAvailableNotification').hostNodes()
      ).toHaveLength(1)
    })

    it('internationalizes update available notification texts', async () => {
      const action = i18nActions.changeLanguage({ language: 'bn' })
      store.dispatch(action)

      const label = app
        .find('#newContentAvailableNotification')
        .hostNodes()
        .text()
      expect(label).toBe(
        'আমরা কিছু আপডেট করেছি, রিফ্রেশ করতে এখানে ক্লিক করুন।'
      )
    })

    describe('when user clicks the update notification"', () => {
      beforeEach(() => {
        app
          .find('#newContentAvailableNotification')
          .hostNodes()
          .simulate('click')
        app.update()
      })
      it('hides the update notification', () => {
        expect(store.getState().notification.newContentAvailable).toEqual(false)
      })

      it('reloads the app', () => {
        expect(window.location.reload).toHaveBeenCalled()
      })
    })
  })

  describe('When background Sync is triggered', () => {
    beforeEach(() => {
      const action = actions.showBackgroundSyncedNotification(7)
      store.dispatch(action)
      app.update()
    })

    it('Should display the background synced notification', () => {
      expect(
        app.find('#backgroundSyncShowNotification').hostNodes()
      ).toHaveLength(1)
    })

    it('Should internationalizes background sync notification texts', async () => {
      const action = i18nActions.changeLanguage({ language: 'bn' })
      store.dispatch(action)

      const label = app
        .find('#backgroundSyncShowNotification')
        .hostNodes()
        .text()
      expect(label).toBe(
        'ইন্টারনেট সংযোগ ফিরে আসায় আমরা 7 টি নতুন জন্ম ঘোষণা সিঙ্ক করেছি'
      )
    })

    describe('When user clicks the background sync notification', () => {
      beforeEach(() => {
        app
          .find('#backgroundSyncShowNotification')
          .hostNodes()
          .simulate('click')
        app.update()
      })

      it('Should hide the notification', () => {
        expect(
          store.getState().notification.backgroundSyncMessageVisible
        ).toEqual(false)
      })
    })
  })

  describe('when user is in vital event selection view', () => {
    beforeEach(() => {
      history.replace(SELECT_VITAL_EVENT)
      app.update()
    })
    it('lists the options', () => {
      expect(app.find('button#select_birth_event')).toHaveLength(1)
    })
    describe('when selects "Birth"', () => {
      beforeEach(() => {
        app
          .find('#select_birth_event')
          .hostNodes()
          .simulate('click')
      })
      it('takes user to the informant selection view', () => {
        expect(app.find('#select_informant_view').hostNodes()).toHaveLength(1)
      })
    })

    describe('when selects "Death"', () => {
      beforeEach(() => {
        app
          .find('#select_death_event')
          .hostNodes()
          .simulate('click')
      })
      it('takses user to the death registration form', () => {
        expect(history.location.pathname).toContain('events/death')
      })
    })
  })

  describe('when user is in informant selection view', () => {
    beforeEach(() => {
      history.replace(SELECT_INFORMANT)
      app.update()
    })
    describe('when selects "Parent"', () => {
      beforeEach(() => {
        app
          .find('#select_parent_informant')
          .hostNodes()
          .simulate('click')
      })
      it('takes user to the birth registration by parent informant view', () => {
        expect(app.find('#informant_parent_view').hostNodes()).toHaveLength(1)
      })
    })
  })
  describe('when user is in birth registration by parent informant view', () => {
    let draft: IDraft
    beforeEach(() => {
      draft = createDraft(Event.BIRTH)
      store.dispatch(storeDraft(draft))
      history.replace(
        DRAFT_BIRTH_PARENT_FORM.replace(':draftId', draft.id.toString())
      )
      app.update()
    })

    describe('when user types in something', () => {
      beforeEach(() => {
        app
          .find('#firstNames')
          .hostNodes()
          .simulate('change', {
            target: { id: 'firstNames', value: 'hello' }
          })
      })
      it('stores the value to a new draft', () => {
        const [, data] = (storage.setItem as jest.Mock).mock.calls[
          (storage.setItem as jest.Mock).mock.calls.length - 1
        ]
        const storedDrafts = JSON.parse(data)
        expect(storedDrafts[0].data.child.firstNames).toEqual('hello')
      })
    })

    describe('when user swipes left from the "child" section', () => {
      beforeEach(async () => {
        app
          .find('#swipeable_block')
          .hostNodes()
          .simulate('touchStart', {
            touches: [
              {
                clientX: 150,
                clientY: 20
              }
            ]
          })
          .simulate('touchMove', {
            changedTouches: [
              {
                clientX: 100,
                clientY: 20
              }
            ]
          })
          .simulate('touchEnd', {
            changedTouches: [
              {
                clientX: 50,
                clientY: 20
              }
            ]
          })
        await flushPromises()
        app.update()
      })
      it('changes to the mother details section', () => {
        expect(app.find('#form_section_title_mother').hostNodes()).toHaveLength(
          1
        )
      })
    })

    describe('when user swipes right from the "child" section', () => {
      beforeEach(async () => {
        app
          .find('#swipeable_block')
          .hostNodes()
          .simulate('touchStart', {
            touches: [
              {
                clientX: 50,
                clientY: 20
              }
            ]
          })
          .simulate('touchMove', {
            changedTouches: [
              {
                clientX: 100,
                clientY: 20
              }
            ]
          })
          .simulate('touchEnd', {
            changedTouches: [
              {
                clientX: 150,
                clientY: 20
              }
            ]
          })
        await flushPromises()
        app.update()
      })
      it('user still stays in the child details section', () => {
        expect(app.find('#form_section_title_child').hostNodes()).toHaveLength(
          1
        )
      })
    })
    describe('when user clicks the "mother" tab', () => {
      beforeEach(async () => {
        app
          .find('#tab_mother')
          .hostNodes()
          .simulate('click')

        await flushPromises()
        app.update()
      })
      it('changes to the mother details section', () => {
        expect(app.find('#form_section_title_mother').hostNodes()).toHaveLength(
          1
        )
      })
      describe('when user swipes right from the "mother" section', () => {
        beforeEach(async () => {
          app
            .find('#swipeable_block')
            .hostNodes()
            .simulate('touchStart', {
              touches: [
                {
                  clientX: 50,
                  clientY: 20
                }
              ]
            })
            .simulate('touchMove', {
              changedTouches: [
                {
                  clientX: 100,
                  clientY: 20
                }
              ]
            })
            .simulate('touchEnd', {
              changedTouches: [
                {
                  clientX: 150,
                  clientY: 20
                }
              ]
            })
          await flushPromises()
          app.update()
        })
        it('changes to the child details section', () => {
          expect(
            app.find('#form_section_title_child').hostNodes()
          ).toHaveLength(1)
        })
      })
    })
    describe('when user clicks "next" button', () => {
      beforeEach(async () => {
        app
          .find('#next_section')
          .hostNodes()
          .simulate('click')
        await flushPromises()
        app.update()
      })
      it('changes to the mother details section', () => {
        expect(app.find('#form_section_title_mother').hostNodes()).toHaveLength(
          1
        )
      })
    })
    describe('when user clicks the "father" tab', () => {
      beforeEach(async () => {
        app
          .find('#tab_father')
          .hostNodes()
          .simulate('click')

        await flushPromises()
        app.update()
      })
      it('changes to the father details section', () => {
        expect(app.find('#form_section_title_father').hostNodes()).toHaveLength(
          1
        )
      })
    })
    describe('when user is in document tab', () => {
      beforeEach(async () => {
        app
          .find('#tab_documents')
          .hostNodes()
          .simulate('click')

        await flushPromises()
        app.update()
      })
      it('image upload field is rendered', () => {
        expect(app.find('#image_uploader').hostNodes()).toHaveLength(1)
      })
      describe('when user clicks image upload field', () => {
        beforeEach(async () => {
          app
            .find('#image_uploader')
            .hostNodes()
            .simulate('click')

          await flushPromises()
          app.update()
        })
        it('user should be asked, for whom they are uploading documents', () => {
          expect(
            app
              .find('#uploadDocForWhom_label')
              .hostNodes()
              .text()
          ).toEqual('Whose suppoting document are you uploading?')
        })
        describe('when user selects for whom they want to upload document', () => {
          beforeEach(async () => {
            app
              .find('#uploadDocForWhom_Mother')
              .hostNodes()
              .simulate('change')

            await flushPromises()
            app.update()
          })
          it('user should be asked about the type of documents', () => {
            expect(
              app
                .find('#whatDocToUpload_label')
                .hostNodes()
                .text()
            ).toEqual('Which document type are you uploading?')
          })
          describe('when user selects the type of document', () => {
            beforeEach(async () => {
              app
                .find('#whatDocToUpload_NID')
                .hostNodes()
                .simulate('change')

              await flushPromises()
              app.update()
            })
            it('upload button should appear now', () => {
              expect(app.find('#upload_document').hostNodes()).toHaveLength(1)
            })
            describe('when image is uploaded/captured', () => {
              beforeEach(async () => {
                app
                  .find('#image_file_uploader_field')
                  .hostNodes()
                  .simulate('change', {
                    target: {
                      files: [new Blob(['junkvalues'], { type: 'image/png' })]
                    }
                  })
                await flushPromises()
                app.update()

                app
                  .find('#action_page_back_button')
                  .hostNodes()
                  .simulate('click')

                await flushPromises()
                app.update()
              })
              it('uploaded section should appear now', () => {
                expect(app.find('#file_list_viewer').hostNodes()).toHaveLength(
                  1
                )
              })
              describe('when preview link is clicked for an uploaded image', () => {
                beforeEach(async () => {
                  app
                    .find('#file_item_0_preview_link')
                    .hostNodes()
                    .simulate('click')

                  await flushPromises()
                  app.update()
                })
                it('preview image is loaded', () => {
                  expect(
                    app.find('#preview_image_field').hostNodes()
                  ).toHaveLength(1)
                })
              })
              describe('when delete link is clicked for an uploaded image', () => {
                beforeEach(async () => {
                  app
                    .find('#file_item_0_delete_link')
                    .hostNodes()
                    .simulate('click')

                  await flushPromises()
                  app.update()
                })
                it('uploaded image should not be available anymore', () => {
                  expect(app.find('#file_item_0').hostNodes()).toHaveLength(0)
                })
              })
            })
          })
        })
      })
    })
  })

  describe('when user is in the preview section', () => {
    let customDraft: IDraft
    let form: IForm

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
      weightAtBirth: '5'
    }

    const fatherDetails: IPersonDetails = {
      fathersDetailsExist: true,
      iD: '234234423424234244',
      iDType: 'NATIONAL_ID',
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
      iD: '234243453455',
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

    beforeEach(() => {
      const data = {
        child: childDetails,
        father: fatherDetails,
        mother: motherDetails,
        registration: registrationDetails,
        documents: { image_uploader: '' }
      }

      customDraft = { id: uuid(), data, event: Event.BIRTH }
      store.dispatch(storeDraft(customDraft))
      form = getRegisterForm(store.getState())[Event.BIRTH]
      history.replace(
        DRAFT_BIRTH_PARENT_FORM.replace(':draftId', customDraft.id.toString())
      )

      app.update()
    })

    it('Throws error for invalid formDefinition', () => {
      const emptyObj = {}
      expect(() =>
        draftToMutationTransformer({} as IForm, emptyObj)
      ).toThrowError('Sections are missing in form definition')
    })

    it('Check if father addresses are parsed properly', () => {
      const clonedFather = clone(fatherDetails)
      clonedFather.addressSameAsMother = false
      clonedFather.permanentAddressSameAsMother = false
      clonedFather.addressLine1 = 'Rd #10'
      clonedFather.addressLine1Permanent = 'Rd#10'
      clonedFather.addressLine2 = 'Akua'
      clonedFather.addressLine2Permanent = 'Akua'
      clonedFather.addressLine3 = 'union1'
      clonedFather.addressLine3Permanent = 'union1'
      clonedFather.addressLine4 = 'upazila10'
      clonedFather.addressLine4Permanent = 'upazila10'
      clonedFather.countryPermanent = 'BGD'
      clonedFather.currentAddress = ''
      clonedFather.district = 'district2'
      clonedFather.districtPermanent = 'district2'
      clonedFather.permanentAddress = ''
      clonedFather.postCode = '1020'
      clonedFather.postCodePermanent = '1010'
      clonedFather.state = 'state4'
      clonedFather.statePermanent = 'state4'

      const data = {
        child: childDetails,
        father: clonedFather,
        mother: motherDetails,
        registration: registrationDetails,
        documents: { image_uploader: '' }
      }

      expect(
        draftToMutationTransformer(form, data).father.address[1].line[0]
      ).toBe('Rd#10')
    })
    it('Pass BOTH_PARENTS as whoseContactDetails value', () => {
      const registration = clone(registrationDetails)
      registration.whoseContactDetails = 'BOTH_PARENTS'

      const data = {
        child: childDetails,
        father: fatherDetails,
        mother: motherDetails,
        registration,
        documents: { image_uploader: '' }
      }

      expect(draftToMutationTransformer(form, data).father.telecom).toBeFalsy()
    })

    it('Pass FATHER as whoseContactDetails value', () => {
      const registration = clone(registrationDetails)
      registration.whoseContactDetails = 'FATHER'

      const data = {
        child: childDetails,
        father: fatherDetails,
        mother: motherDetails,
        registration,
        documents: { image_uploader: '' }
      }

      expect(
        draftToMutationTransformer(form, data).father.telecom[0].value
      ).toBe('01736478884')
    })

    it('Pass false as fathersDetailsExist on father section', () => {
      const clonedFather = clone(fatherDetails)
      clonedFather.fathersDetailsExist = false

      const data = {
        child: childDetails,
        father: clonedFather,
        mother: motherDetails,
        registration: registrationDetails,
        documents: { image_uploader: '' }
      }

      expect(draftToMutationTransformer(form, data).father).toBeUndefined()
    })

    describe('when user clicks the "submit" button', () => {
      beforeEach(async () => {
        app
          .find('#tab_preview')
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

          it('On successful submission tracking id should be visible', async () => {
            jest.setMock('react-apollo', { default: ReactApollo })

            app
              .find('#submit_confirm')
              .hostNodes()
              .simulate('click')

            await flushPromises()
            app.update()

            expect(app.find('#trackingIdViewer').hostNodes()).toHaveLength(1)
          })
        })
      })
    })
  })
  describe('when user is in the review section', () => {
    let customDraft: IDraft

    const childDetails: IPersonDetails = {
      attendantAtBirth: 'NURSE',
      birthDate: '1999-10-10',
      familyName: 'ইসলাম',
      familyNameEng: 'Islam',
      firstNames: 'নাইম',
      firstNamesEng: 'Naim',
      gender: 'male',
      multipleBirth: '2',
      placeOfBirth: 'HOSPITAL',
      birthType: 'SINGLE',
      weightAtBirth: '6',
      _fhirID: '1'
    }

    const fatherDetails: IPersonDetails = {
      fathersDetailsExist: true,
      iD: '234234423424234244',
      iDType: 'NATIONAL_ID',
      addressSameAsMother: true,
      permanentAddressSameAsMother: true,
      country: 'BGD',
      countryPermanent: 'BGD',
      currentAddress: '',
      birthDate: '1999-10-10',
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
      iD: '234243453455',
      iDType: 'NATIONAL_ID',
      country: 'BGD',
      nationality: 'BGD',
      familyName: 'ইসলাম',
      familyNameEng: 'Islam',
      firstNames: 'রোকেয়া',
      firstNamesEng: 'Rokeya',
      maritalStatus: 'MARRIED',
      dateOfMarriage: '2010-10-10',
      birthDate: '1999-10-10',
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

    beforeEach(() => {
      getItem.mockReturnValue(registerScopeToken)
      store.dispatch(checkAuth({ '?token': registerScopeToken }))
      const data = {
        child: childDetails,
        father: fatherDetails,
        mother: motherDetails,
        registration: registrationDetails,
        documents: {
          image_uploader: [
            {
              data: 'base64-data',
              type: 'image/jpeg',
              optionValues: ['Mother', 'NID'],
              title: 'Mother',
              description: 'NID'
            }
          ]
        }
      }

      customDraft = { id: uuid(), data, review: true, event: Event.BIRTH }
      store.dispatch(storeDraft(customDraft))
      history.replace(
        REVIEW_BIRTH_PARENT_FORM_TAB.replace(
          ':draftId',
          customDraft.id.toString()
        ).replace(':tabId', 'review')
      )
      app.update()
      app
        .find('#tab_child')
        .hostNodes()
        .simulate('click')
      app.update()
      app
        .find('#tab_review')
        .hostNodes()
        .simulate('click')
      app.update()
    })

    it('review tab should show up', () => {
      expect(app.find('#tab_review').hostNodes()).toHaveLength(1)
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
    it('successfully submits review form after application modification', async () => {
      jest.setMock('react-apollo', { default: ReactApollo })
      app
        .find('#Childsdetails_link')
        .hostNodes()
        .simulate('click')

      app
        .find('#edit_confirm')
        .hostNodes()
        .simulate('click')

      await flushPromises()
      app.update()

      app
        .find('#weightAtBirth')
        .hostNodes()
        .simulate('change', {
          target: {
            id: 'weightAtBirth',
            value: '5'
          }
        })

      app
        .find('#tab_review')
        .hostNodes()
        .simulate('click')
      await flushPromises()
      app.update()

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
        .find('#register_review')
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
        .find('#register_review')
        .hostNodes()
        .simulate('click')

      await flushPromises()
      app.update()

      expect(app.find('#register_review').hostNodes()).toHaveLength(0)
    })
    it('rejecting application redirects to reject confirmation screen', async () => {
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

      app
        .find('#submit_reject_form')
        .hostNodes()
        .simulate('click')

      await flushPromises()
      app.update()

      expect(
        app
          .find('#view_title')
          .hostNodes()
          .text()
      ).toEqual('Application rejected')
    })
  })
})
it("doesn't redirect user to SSO if user has a token in their URL", async () => {
  const token =
    'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJpYXQiOjE1MzMxOTUyMjgsImV4cCI6MTU0MzE5NTIyNywiYXVkIjpbImdhdGV3YXkiXSwic3ViIjoiMSJ9.G4KzkaIsW8fTkkF-O8DI0qESKeBI332UFlTXRis3vJ6daisu06W5cZsgYhmxhx_n0Q27cBYt2OSOnjgR72KGA5IAAfMbAJifCul8ib57R4VJN8I90RWqtvA0qGjV-sPndnQdmXzCJx-RTumzvr_vKPgNDmHzLFNYpQxcmQHA-N8li-QHMTzBHU4s9y8_5JOCkudeoTMOd_1021EDAQbrhonji5V1EOSY2woV5nMHhmq166I1L0K_29ngmCqQZYi1t6QBonsIowlXJvKmjOH5vXHdCCJIFnmwHmII4BK-ivcXeiVOEM_ibfxMWkAeTRHDshOiErBFeEvqd6VWzKvbKAH0UY-Rvnbh4FbprmO4u4_6Yd2y2HnbweSo-v76dVNcvUS0GFLFdVBt0xTay-mIeDy8CKyzNDOWhmNUvtVi9mhbXYfzzEkwvi9cWwT1M8ZrsWsvsqqQbkRCyBmey_ysvVb5akuabenpPsTAjiR8-XU2mdceTKqJTwbMU5gz-8fgulbTB_9TNJXqQlH7tyYXMWHUY3uiVHWg2xgjRiGaXGTiDgZd01smYsxhVnPAddQOhqZYCrAgVcT1GBFVvhO7CC-rhtNlLl21YThNNZNpJHsCgg31WA9gMQ_2qAJmw2135fAyylO8q7ozRUvx46EezZiPzhCkPMeELzLhQMEIqjo'

  history.replaceState({}, '', '?token=' + token)

  createTestApp()
  expect(assign.mock.calls).toHaveLength(0)
})
