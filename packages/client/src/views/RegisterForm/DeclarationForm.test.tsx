/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import {
  createDeclaration,
  IDeclaration,
  IUserData,
  storeDeclaration
} from '@client/declarations'
import { formatUrl } from '@client/navigation'
import { DRAFT_BIRTH_PARENT_FORM } from '@client/navigation/routes'
import { storage } from '@client/storage'
import {
  createTestApp,
  flushPromises,
  getFileFromBase64String,
  goToChildSection,
  goToDocumentsSection,
  goToFatherSection,
  goToMotherSection,
  goToSection,
  selectOption,
  setScopes,
  REGISTRATION_AGENT_DEFAULT_SCOPES,
  waitForReady,
  setPageVisibility,
  userDetails,
  validImageB64String
} from '@client/tests/util'
import { ReactWrapper } from 'enzyme'
import { Store } from 'redux'
import { SCOPES } from '@opencrvs/commons/client'
import { EventType } from '@client/utils/gateway'
import { waitForElement } from '@client/tests/wait-for-element'
import { createMemoryRouter } from 'react-router-dom'
import { Mock, vi } from 'vitest'

describe('when user starts a new declaration', () => {
  describe('In case of insecured page show unlock screen', () => {
    let draft: IDeclaration
    let app: ReactWrapper
    let store: Store

    beforeEach(async () => {
      await flushPromises()
      const userData: IUserData[] = [
        {
          userID: userDetails.userMgntUserID,
          userPIN:
            '$2a$10$xQBLcbPgGQNu9p6zVchWuu6pmCrQIjcb6k2W1PIVUxVTE/PumWM82',
          declarations: []
        }
      ]

      const indexedDB = {
        USER_DETAILS: JSON.stringify(userDetails),
        USER_DATA: JSON.stringify(userData),
        screenLock: 'true'
      }
      ;(storage.getItem as Mock).mockImplementation(
        (param: keyof typeof indexedDB) => Promise.resolve(indexedDB[param])
      )

      draft = createDeclaration(EventType.Birth)

      const testApp = await createTestApp(
        { waitUntilOfflineCountryConfigLoaded: true },
        [
          formatUrl(DRAFT_BIRTH_PARENT_FORM, {
            declarationId: draft.id.toString()
          })
        ]
      )
      app = testApp.app
      store = testApp.store
      store.dispatch(storeDeclaration(draft))

      setScopes([SCOPES.RECORD_DECLARE_BIRTH], store)

      await store.dispatch(storeDeclaration(draft))
    })

    it('renders unlock screen', async () => {
      await waitForElement(app, '#unlockPage')
    })
  })

  describe('when secured', () => {
    let app: ReactWrapper

    let store: Store
    let router: ReturnType<typeof createMemoryRouter>

    beforeEach(async () => {
      await flushPromises()
      const testApp = await createTestApp()
      app = testApp.app
      store = testApp.store
      router = testApp.router

      setScopes(REGISTRATION_AGENT_DEFAULT_SCOPES, store)
      await waitForReady(app)
    })

    describe('when user is in birth registration by parent informant view', () => {
      let draft: IDeclaration
      beforeEach(async () => {
        await flushPromises()
        const data = {
          registration: {
            informantType: {
              value: '',
              nestedFields: { otherInformantType: '' }
            },
            contactPoint: {
              value: '',
              nestedFields: { registrationPhone: '' }
            }
          }
        }
        draft = createDeclaration(EventType.Birth, data)

        /*
         * Needs to be done before storeDeclaration(draft)
         * so offline declarations wouldn't override the dispatched ones
         */
        store.dispatch(storeDeclaration(draft))

        await router.navigate(
          formatUrl(DRAFT_BIRTH_PARENT_FORM, {
            declarationId: draft.id.toString()
          })
        )

        app.update()
        await flushPromises()

        await goToChildSection(app)
      })

      describe('when user types in something and press continue', () => {
        beforeEach(async () => {
          await flushPromises()

          app
            .find('#firstNamesEng')
            .hostNodes()
            .simulate('change', {
              target: { id: 'firstNamesEng', value: 'hello' }
            })

          app.update()
          await flushPromises()

          app.find('#next_section').hostNodes().simulate('click')
          app.update()

          await flushPromises()
        })
        it('redirect to home when pressed save and exit button', async () => {
          app.find('#save-exit-btn').hostNodes().simulate('click')
          await flushPromises()
          app.update()
          expect(window.location.href).toContain('/')
        })
        it('check toggle menu toggle button handler', async () => {
          app
            .find('#eventToggleMenu-Dropdown-Content')
            .hostNodes()
            .simulate('click')
          await flushPromises()
          app.update()
          expect(
            app.find('#eventToggleMenu-Dropdown-Content').hostNodes().length
          ).toEqual(1)
        })
        it('check toggle menu item handler', async () => {
          const menuLink = await waitForElement(
            app,
            '#eventToggleMenu-Dropdown-Content'
          )
          menuLink.hostNodes().simulate('click')
          await flushPromises()
          app.update()

          await waitForElement(app, '#eventToggleMenu-Dropdown-Content')
          app
            .find('#eventToggleMenu-Dropdown-Content')
            .hostNodes()
            .simulate('click')
          await flushPromises()
          app.update()

          expect(window.location.href).toContain('/')
        })
      })

      describe('when user enters childBirthDate and clicks to documents page', () => {
        beforeEach(async () => {
          await flushPromises()

          Date.now = vi.fn(() => 1549607679507) // 08-02-2019
          await waitForElement(app, '#childBirthDate-dd')
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

          app.update()
        })

        describe('when user goes to documents page', () => {
          beforeEach(async () => {
            await flushPromises()
            await goToDocumentsSection(app)
          })

          it('renders list of document upload field', async () => {
            await flushPromises()
            await waitForElement(app, '#form_section_id_documents-view-group')
            const fileInputs = app
              .find('#form_section_id_documents-view-group')
              .find('section')
              .children().length

            expect(fileInputs).toEqual(5)
          })
          it('still renders list of document upload field even when page is hidden - allows use of camera', async () => {
            setPageVisibility(false)
            await flushPromises()
            app.update()
            await flushPromises()

            const fileInputs = app
              .find('#form_section_id_documents-view-group')
              .find('section')
              .children().length

            expect(fileInputs).toEqual(5)
          })
          it('No error while uploading valid file', async () => {
            await flushPromises()
            app.update()
            await flushPromises()
            selectOption(app, '#uploadDocForMother', 'Birth certificate')
            app.update()
            app
              .find('input[name="uploadDocForMother"][type="file"]')
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

            expect(app.find('#upload-error').exists()).toBe(false)
          })
          it('Error while uploading invalid file', async () => {
            await flushPromises()
            app.update()

            selectOption(app, '#uploadDocForMother', 'Birth certificate')
            app.update()
            app
              .find('input[name="uploadDocForMother"][type="file"]')
              .simulate('change', {
                target: {
                  files: [
                    getFileFromBase64String(
                      validImageB64String,
                      'index.bmp',
                      'image/bmp'
                    )
                  ]
                }
              })
            await flushPromises()
            app.update()
            expect(app.find('#upload-error').hostNodes().first().text()).toBe(
              'File format not supported. Please attach a png, jpf or pdf (max 5mb)'
            )
          })
        })
      })

      describe('when user goes to preview page', () => {
        beforeEach(async () => {
          await flushPromises()
          await goToSection(app, 5)
          app
            .find('#btn_change_child_familyNameEng')
            .hostNodes()
            .first()
            .simulate('click')
        })

        it('renders preview page', async () => {
          await flushPromises()
          const button = await waitForElement(app, '#back-to-review-button')

          button.hostNodes().simulate('click')

          const changeNameButton = await waitForElement(
            app,
            '#btn_change_child_familyNameEng'
          )
          expect(changeNameButton.hostNodes()).toHaveLength(1)
        })

        it('should go to input field when user press change button to edit information', async () => {
          await flushPromises()
          const backToReviewButton = await waitForElement(
            app,
            '#back-to-review-button'
          )

          backToReviewButton.hostNodes().simulate('click')

          const changeNameButton = await waitForElement(
            app,
            '#btn_change_child_familyNameEng'
          )

          changeNameButton.hostNodes().first().simulate('click')

          const familyNameEngInputField = await waitForElement(
            app,
            '#familyNameEng'
          )

          expect(familyNameEngInputField.hostNodes()).toHaveLength(1)
        })
      })
      describe('when user clicks the "mother" page', () => {
        beforeEach(async () => {
          await flushPromises()
          await goToMotherSection(app)
        })

        it('changes to the mother details section', async () => {
          await flushPromises()
          app.update()
          expect(router.state.location.pathname).toContain('mother')
        })

        it('hides everything with pinpad if page loses focus', async () => {
          await flushPromises()
          app.update()

          setPageVisibility(false)
          await waitForElement(app, '#unlockPage')
        })
      })
      describe('when user clicks the "father" page', () => {
        beforeEach(async () => {
          await flushPromises()
          await goToFatherSection(app)
        })

        it('changes to the father details section', () => {
          expect(router.state.location.pathname).toContain('father')
        })
      })
      describe('when user is in document page', () => {
        beforeEach(async () => {
          await flushPromises()
          await goToDocumentsSection(app)
        })
        it('image upload field is rendered', async () => {
          await flushPromises()
          app.update()
          expect(app.find('#upload_document').hostNodes()).toHaveLength(5)
        })
      })
    })
  })
})
