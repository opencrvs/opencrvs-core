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
  createTestApp,
  flushPromises,
  userDetails,
  goToDocumentsSection,
  goToFatherSection,
  goToMotherSection,
  setPageVisibility,
  getFileFromBase64String,
  validImageB64String,
  selectOption,
  goToSection
} from '@client/tests/util'
import {
  storeDeclaration,
  createDeclaration,
  IDeclaration,
  IUserData
} from '@client/declarations'
import { ReactWrapper } from 'enzyme'
import { History } from 'history'
import { Store } from 'redux'
import { storage } from '@client/storage'
import { Event } from '@client/utils/gateway'
import { waitForElement } from '@client/tests/wait-for-element'
import { vi, Mock } from 'vitest'
import { DRAFT_BIRTH_PARENT_FORM } from '@client/navigation/routes'

describe('when user has starts a new declaration', () => {
  describe('In case of insecured page show unlock screen', () => {
    let draft: IDeclaration
    let app: ReactWrapper
    let history: History
    let store: Store

    beforeEach(async () => {
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
      const testApp = await createTestApp()
      app = testApp.app
      history = testApp.history
      store = testApp.store

      draft = createDeclaration(Event.Birth)
      await store.dispatch(storeDeclaration(draft))
    })

    it('renders unlock screen', async () => {
      history.replace(
        DRAFT_BIRTH_PARENT_FORM.replace(':declarationId', draft.id.toString())
      )
      await waitForElement(app, '#unlockPage')
    })
  })

  describe('when secured', () => {
    let app: ReactWrapper
    let history: History
    let store: Store

    beforeEach(async () => {
      const testApp = await createTestApp()
      app = testApp.app
      history = testApp.history
      store = testApp.store
    })

    describe('when user is in birth registration by parent informant view', () => {
      let draft: IDeclaration
      beforeEach(async () => {
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
        draft = createDeclaration(Event.Birth, data)

        /*
         * Needs to be done before storeDeclaration(draft)
         * so offline declarations wouldn't override the dispatched ones
         */
        store.dispatch(storeDeclaration(draft))
        // TODO: SELECT_BIRTH_INFORMANT has been removed
        history.replace(
          DRAFT_BIRTH_PARENT_FORM.replace(':declarationId', draft.id.toString())
        )
        await waitForElement(app, '#content-name')

        app.find('#next_section').hostNodes().simulate('click')
        app.find('#next_section').hostNodes().simulate('click')
        await waitForElement(app, '#form_section_id_child-view-group')
      })

      describe('when user types in something and press continue', () => {
        beforeEach(async () => {
          // await waitForElement(app, '#informant_parent_view')
          app
            .find('#firstNamesEng')
            .hostNodes()
            .simulate('change', {
              target: { id: 'firstNamesEng', value: 'hello' }
            })

          app.find('#next_section').hostNodes().simulate('click')
          await flushPromises()
        })
        it('redirect to home when pressed save and exit button', async () => {
          app.find('#save-exit-btn').hostNodes().simulate('click')
          await flushPromises()
          app.update()
          expect(window.location.href).toContain('/')
        })
        it('check toggle menu toggle button handler', async () => {
          app.find('#eventToggleMenuToggleButton').hostNodes().simulate('click')
          await flushPromises()
          app.update()
          expect(
            app.find('#eventToggleMenuToggleButton').hostNodes().length
          ).toEqual(1)
        })
        it('check toggle menu item handler', async () => {
          const menuLink = await waitForElement(
            app,
            '#eventToggleMenuToggleButton'
          )
          menuLink.hostNodes().simulate('click')
          await flushPromises()
          app.update()

          await waitForElement(app, '#eventToggleMenuItem0')
          app.find('#eventToggleMenuItem0').hostNodes().simulate('click')
          await flushPromises()
          app.update()

          expect(window.location.href).toContain('/')
        })
      })

      describe('when user enters childBirthDate and clicks to documents page', () => {
        beforeEach(async () => {
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
        })

        describe('when user goes to documents page', () => {
          beforeEach(async () => {
            app.find('#next_section').hostNodes().simulate('click')
            await flushPromises()
            app.update()
            app.find('#next_section').hostNodes().simulate('click')
            await flushPromises()
            app.update()
            app.find('#next_section').hostNodes().simulate('click')
            await flushPromises()
            app.update()
            app.find('#next_section').hostNodes().simulate('click')
            await flushPromises()
            app.update()
          })
          it('renders list of document upload field', async () => {
            const fileInputs = app
              .find('#form_section_id_documents-view-group')
              .find('section')
              .children().length

            expect(fileInputs).toEqual(5)
          })
          it('still renders list of document upload field even when page is hidden - allows use of camera', async () => {
            setPageVisibility(false)
            await flushPromises()
            const fileInputs = app
              .update()
              .find('#form_section_id_documents-view-group')
              .find('section')
              .children().length
            expect(fileInputs).toEqual(5)
          })
          it('No error while uploading valid file', async () => {
            selectOption(app, '#uploadDocForMother', 'Birth certificate')
            app.update()
            app
              .find('#image_file_uploader_field')
              .hostNodes()
              .first()
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

            expect(app.find('#upload-error').hostNodes().first().text()).toBe(
              ''
            )
          })
          it('Error while uploading invalid file', async () => {
            selectOption(app, '#uploadDocForMother', 'Birth certificate')
            app.update()
            app
              .find('#image_file_uploader_field')
              .hostNodes()
              .first()
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
          await goToSection(app, 5)
          app
            .find('#btn_change_child_familyNameEng')
            .hostNodes()
            .first()
            .simulate('click')
        })
        it('renders preview page', async () => {
          const button = await waitForElement(app, '#back-to-review-button')

          button.hostNodes().simulate('click')

          const changeNameButton = await waitForElement(
            app,
            '#btn_change_child_familyNameEng'
          )
          expect(changeNameButton.hostNodes()).toHaveLength(2)
        })
        it('should go to input field when user press change button to edit information', async () => {
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
        beforeEach(() => goToMotherSection(app))
        it('changes to the mother details section', () => {
          expect(window.location.href).toContain('mother')
        })
        it('hides everything with pinpad if is page loses focus', async () => {
          setPageVisibility(false)
          await waitForElement(app, '#unlockPage')
        })
      })
      describe('when user clicks the "father" page', () => {
        beforeEach(() => goToFatherSection(app))
        it('changes to the father details section', () => {
          expect(window.location.href).toContain('father')
        })
      })
      describe('when user is in document page', () => {
        beforeEach(() => goToDocumentsSection(app))
        it('image upload field is rendered', () => {
          expect(app.find('#upload_document').hostNodes()).toHaveLength(5)
        })
      })
    })
  })
})
