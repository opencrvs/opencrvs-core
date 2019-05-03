import {
  createTestApp,
  mockOfflineData,
  assign,
  validToken,
  getItem,
  flushPromises,
  setItem,
  getFileFromBase64String,
  validImageB64String,
  inValidImageB64String
} from 'src/tests/util'
import { DRAFT_BIRTH_PARENT_FORM } from 'src/navigation/routes'
import {
  storeDraft,
  createDraft,
  IDraft,
  getDraftsOfCurrentUser
  // getDraftsOfCurrentUser
} from 'src/drafts'
import { ReactWrapper } from 'enzyme'
import { History } from 'history'
import { Store } from 'redux'
import { getOfflineDataSuccess } from 'src/offline/actions'
import * as fetch from 'jest-fetch-mock'
import { storage } from 'src/storage'
import { Event } from 'src/forms'
import * as CommonUtils from 'src/utils/commonUtils'

storage.getItem = jest.fn()
storage.setItem = jest.fn()
jest.spyOn(CommonUtils, 'isMobileDevice').mockReturnValue(true)

beforeEach(() => {
  history.replaceState({}, '', '/')
  assign.mockClear()
})

describe('when user has starts a new application', () => {
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
  describe('In case of insecured page show unlock screen', () => {
    let draft: IDraft
    beforeEach(async () => {
      draft = createDraft(Event.BIRTH)
      store.dispatch(storeDraft(draft))
      history.replace(
        DRAFT_BIRTH_PARENT_FORM.replace(':draftId', draft.id.toString())
      )
      await flushPromises()
      app.update()
    })
    describe('when user is in birth registration by parent informant view', () => {
      beforeEach(async () => {
        storage.getItem = jest.fn()
        storage.setItem = jest.fn()
        draft = createDraft(Event.BIRTH)
        store.dispatch(storeDraft(draft))
        history.replace(
          DRAFT_BIRTH_PARENT_FORM.replace(':draftId', draft.id.toString())
        )
        await flushPromises()
        app.update()
        app
          .find('#createPinBtn')
          .hostNodes()
          .simulate('click')
        await flushPromises()
        app.update()
        Array.apply(null, { length: 8 }).map(() => {
          app
            .find('#keypad-1')
            .hostNodes()
            .simulate('click')
        })
        await flushPromises()
        app.update()
      })

      describe('when user types in something', () => {
        beforeEach(async () => {
          // mock indexeddb
          const indexedDB = {
            USER_DETAILS: JSON.stringify({ userMgntUserID: 'shakib75' }),
            USER_DATA: JSON.stringify([
              {
                userID: 'shakib75',
                userPIN:
                  '$2a$10$nD0E23/QJK0tjbPN23zg1u7rYnhsm8Y5/08.H20SSdqLVyuwFtVsG',
                drafts: []
              }
            ]),
            screenLock: undefined,
            USER_ID: 'shakib75'
          }

          storage.getItem = jest.fn(async (key: string) =>
            Promise.resolve(indexedDB[key])
          )
          storage.setItem = jest.fn(
            async (key: string, value: string) => (indexedDB[key] = value)
          )
          app
            .find('#firstNames')
            .hostNodes()
            .simulate('change', {
              target: { id: 'firstNames', value: 'hello' }
            })
          await flushPromises()
          app.update()
        })
        it('stores the value to a new draft', async () => {
          const userData = await getDraftsOfCurrentUser()
          const storedDrafts = JSON.parse(userData).drafts
          expect(
            storedDrafts[storedDrafts.length - 1].data.child.firstNames
          ).toEqual('hello')
        })
      })

      describe('when user enters childBirthDate and clicks to documents tab', () => {
        beforeEach(async () => {
          Date.now = jest.fn(() => 1549607679507) // 08-02-2019
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
          expect(
            app.find('#form_section_title_mother').hostNodes()
          ).toHaveLength(1)
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
          expect(
            app.find('#form_section_title_child').hostNodes()
          ).toHaveLength(1)
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
          expect(
            app.find('#form_section_title_mother').hostNodes()
          ).toHaveLength(1)
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
          expect(
            app.find('#form_section_title_mother').hostNodes()
          ).toHaveLength(1)
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
          expect(
            app.find('#form_section_title_father').hostNodes()
          ).toHaveLength(1)
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
              await new Promise((resolve, reject) => {
                setTimeout(resolve, 1000)
              })
              app.update()
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
<<<<<<< 0c107ba8108594d3164cc1153f9ade850e8f5327
                  .simulate('change', {
                    target: {
                      files: [
                        getFileFromBase64String(
                          validImageB64String,
                          'index.png',
                          'image/png'
                        )
                      ]
                    }
                  })
                await flushPromises()

                app.update()

                app
                  .find('#action_page_back_button')
                  .hostNodes()
                  .simulate('click')
                await new Promise(resolve => {
                  setTimeout(() => {
                    resolve()
                  }, 100)
                })
=======
                  .text()
              ).toEqual('Which document type are you uploading?')
            })
            describe('when user selects the type of document', () => {
              beforeEach(async () => {
                selectOption(app, '#whatDocToUpload', 'National ID (front)')
>>>>>>> Fix ApplicationForm tests

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
                  expect(
                    app.find('#file_list_viewer').hostNodes()
                  ).toHaveLength(1)
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
                  it('preview image is loaded', async () => {
                    const imgField = app.find('#preview_image_field')
                    await flushPromises()
                    expect(imgField.hostNodes()).toHaveLength(1)
                  })
                })
                describe('when delete link is clicked for an uploaded image', () => {
                  beforeEach(async () => {
                    const link = app.find('#file_item_0_delete_link')
                    await flushPromises()
                    app.update()
                    link.hostNodes().simulate('click')
                    await flushPromises()
                    app.update()
                  })
                  it('uploaded image should not be available anymore', async () => {
                    expect(app.find('#file_item_0').hostNodes()).toHaveLength(0)
                  })
                })
              })
            })

            describe('when invalid image is uploaded/captured', () => {
              beforeEach(async () => {
                app
                  .find('#image_file_uploader_field')
                  .hostNodes()
                  .simulate('change', {
                    target: {
                      files: [
                        getFileFromBase64String(
                          inValidImageB64String,
                          'index.png',
                          'image/png'
                        )
                      ]
                    }
                  })
                await flushPromises()

                app.update()

                app
                  .find('#action_page_back_button')
                  .hostNodes()
                  .simulate('click')
                await new Promise(resolve => {
                  setTimeout(() => {
                    resolve()
                  }, 100)
                })

                app.update()
              })
              it('uploaded section should not appear now', () => {
                expect(app.find('#file_list_viewer').hostNodes()).toHaveLength(
                  0
                )
              })
            })
          })
        })
      })
    })
  })
})
