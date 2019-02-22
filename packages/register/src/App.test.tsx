import * as ReactApollo from 'react-apollo'
import {
  createTestApp,
  mockOfflineData,
  userDetails,
  selectOption
} from './tests/util'
import { v4 as uuid } from 'uuid'
import {
  HOME,
  SELECT_VITAL_EVENT,
  SELECT_INFORMANT,
  DRAFT_BIRTH_PARENT_FORM,
  REVIEW_EVENT_PARENT_FORM_TAB
} from './navigation/routes'
import { ReactWrapper } from 'enzyme'
import { History } from 'history'
import { Store } from 'redux'
import { storeDraft, createDraft, IDraft } from './drafts'
import * as actions from 'src/notification/actions'
import * as i18nActions from 'src/i18n/actions'
import { storage } from 'src/storage'
import { draftToGqlTransformer } from 'src/transformer'
import { getRegisterForm } from '@opencrvs/register/src/forms/register/application-selectors'
import {
  getStorageUserDetailsSuccess,
  checkAuth
} from '@opencrvs/register/src/profile/profileActions'
import { getOfflineDataSuccess } from 'src/offline/actions'
import { createClient } from './utils/apolloClient'
import { Event, IForm } from '@opencrvs/register/src/forms'
import { clone } from 'lodash'
import {
  mockFetchLocations,
  mockFetchFacilities
} from 'src/utils/referenceApi.test'
import * as nock from 'nock'

interface IPersonDetails {
  [key: string]: any
}

storage.getItem = jest.fn()
storage.setItem = jest.fn()
const assign = window.location.assign as jest.Mock
const getItem = window.localStorage.getItem as jest.Mock
const setItem = window.localStorage.setItem as jest.Mock

function flushPromises() {
  return new Promise(resolve => setImmediate(resolve))
}

beforeEach(() => {
  history.replaceState({}, '', '/')
  assign.mockClear()
})

it('renders without crashing', async () => {
  createTestApp()
})

it("redirects user to SSO if user doesn't have a token", async () => {
  createTestApp()
  await flushPromises()

  expect(assign.mock.calls[0][0]).toBe(window.config.LOGIN_URL)
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

    describe('when user enters childBirthDate and clicks to documents tab', () => {
      beforeEach(async () => {
        Date.now = jest.fn(() => 1549607679507)
        app
          .find('#childBirthDate-dd')
          .hostNodes()
          .simulate('change', {
            target: { id: 'childBirthDate-dd', value: '19' }
          })
        app
          .find('#childBirthDate-mm')
          .hostNodes()
          .simulate('change', {
            target: { id: 'childBirthDate-mm', value: '11' }
          })
        app
          .find('#childBirthDate-yyyy')
          .hostNodes()
          .simulate('change', {
            target: { id: 'childBirthDate-yyyy', value: '2018' }
          })
        await flushPromises()
        app.update()
      })

      describe('when user goes to documents tab', () => {
        beforeEach(async () => {
          app
            .find('#tab_documents')
            .hostNodes()
            .simulate('click')
          await flushPromises()
          app.update()
        })

        it('renders list of document requirements', () => {
          expect(
            app
              .find('#list')
              .hostNodes()
              .children()
          ).toHaveLength(5)

          expect(
            app
              .find('#list')
              .hostNodes()
              .childAt(4)
              .text()
          ).toBe('EPI Card of Child')
        })
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
              selectOption(app, '#whatDocToUpload', 'National ID (front)')

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
                  nock(window.config.RESOURCES_URL)
                    .get('/locations')
                    .reply(200, mockFetchLocations)

                  nock(window.config.RESOURCES_URL)
                    .get('/facilities')
                    .reply(200, mockFetchFacilities)

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
    it('Check if new place of birth location address is parsed properly', () => {
      const clonedChild = clone(childDetails)
      clonedChild.placeOfBirth = 'PRIVATE_HOME'
      clonedChild.addressLine1 = 'Rd #10'
      clonedChild.addressLine2 = 'Akua'
      clonedChild.addressLine3 = 'union1'
      clonedChild.addressLine4 = 'upazila10'
      clonedChild.country = 'BGD'
      clonedChild.district = 'district2'
      clonedChild.postCode = '1020'
      clonedChild.state = 'state4'
      const data = {
        child: clonedChild,
        father: fatherDetails,
        mother: motherDetails,
        registration: registrationDetails,
        documents: { image_uploader: '' }
      }

      expect(draftToGqlTransformer(form, data).eventLocation.type).toBe(
        'PRIVATE_HOME'
      )
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

      expect(draftToGqlTransformer(form, data).father.telecom).toBeFalsy()
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

      expect(draftToGqlTransformer(form, data).father.telecom[0].value).toBe(
        '01736478884'
      )
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

      expect(draftToGqlTransformer(form, data).father).toBeUndefined()
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

            expect(app.find('#tracking_id_viewer').hostNodes()).toHaveLength(1)
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
    let customDraft: IDraft

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

    beforeEach(() => {
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
          image_uploader: [
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
      store.dispatch(storeDraft(customDraft))
      history.replace(
        REVIEW_EVENT_PARENT_FORM_TAB.replace(
          ':draftId',
          customDraft.id.toString()
        )
          .replace(':event', 'birth')
          .replace(':tabId', 'review')
      )
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
  describe('when user is in the death review section', () => {
    let customDraft: IDraft

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

    beforeEach(() => {
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
          image_uploader: [
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
      store.dispatch(storeDraft(customDraft))
      history.replace(
        REVIEW_EVENT_PARENT_FORM_TAB.replace(
          ':draftId',
          customDraft.id.toString()
        )
          .replace(':event', 'death')
          .replace(':tabId', 'review')
      )
      app.update()
    })

    it('review tab should show up', () => {
      expect(app.find('#tab_review').hostNodes()).toHaveLength(1)
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

      app
        .find('#submit_reject_form')
        .hostNodes()
        .simulate('click')

      await flushPromises()
      app.update()

      expect(
        app
          .find('#submission_text')
          .hostNodes()
          .text()
      ).toEqual('birth application has been rejected.')
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
