import {
  createTestApp,
  flushPromises,
  userDetails,
  goToEndOfForm,
  goToDocumentsSection,
  goToFatherSection,
  goToMotherSection,
  setPageVisibility
} from '@register/tests/util'
import { DRAFT_BIRTH_PARENT_FORM } from '@register/navigation/routes'
import {
  storeApplication,
  createApplication,
  IApplication,
  IUserData
} from '@register/applications'
import { ReactWrapper } from 'enzyme'
import { History } from 'history'
import { Store } from 'redux'
import { storage } from '@register/storage'
import { Event } from '@register/forms'
import { waitForElement } from '@register/tests/wait-for-element'

describe('when user has starts a new application', () => {
  describe('In case of insecured page show unlock screen', () => {
    let draft: IApplication
    let app: ReactWrapper
    let history: History
    let store: Store

    beforeEach(async () => {
      const userData: IUserData[] = [
        {
          userID: userDetails.userMgntUserID,
          userPIN:
            '$2a$10$xQBLcbPgGQNu9p6zVchWuu6pmCrQIjcb6k2W1PIVUxVTE/PumWM82',
          applications: []
        }
      ]

      const indexedDB = {
        USER_DETAILS: JSON.stringify(userDetails),
        USER_DATA: JSON.stringify(userData),
        screenLock: 'true'
      }
      ;(storage.getItem as jest.Mock).mockImplementation(
        (param: keyof typeof indexedDB) => Promise.resolve(indexedDB[param])
      )
      const testApp = await createTestApp()
      app = testApp.app
      history = testApp.history
      store = testApp.store

      draft = createApplication(Event.BIRTH)
      await store.dispatch(storeApplication(draft))
    })

    it('renders unlock screen', async () => {
      history.replace(
        DRAFT_BIRTH_PARENT_FORM.replace(':applicationId', draft.id.toString())
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
      let draft: IApplication
      beforeEach(async () => {
        draft = createApplication(Event.BIRTH)

        /*
         * Needs to be done before storeApplication(draft)
         * so offline applications wouldn't override the dispatched ones
         */
        store.dispatch(storeApplication(draft))
        history.replace(
          DRAFT_BIRTH_PARENT_FORM.replace(':applicationId', draft.id.toString())
        )

        await waitForElement(app, '#register_form')
      })

      describe('when user types in something and press continue', () => {
        beforeEach(async () => {
          await waitForElement(app, '#informant_parent_view')
          app
            .find('#firstNames')
            .hostNodes()
            .simulate('change', {
              target: { id: 'firstNames', value: 'hello' }
            })

          app
            .find('#next_section')
            .hostNodes()
            .simulate('click')
        })
        it('stores the value to a new draft and move to next section', () => {
          const mockCalls = (storage.setItem as jest.Mock).mock.calls
          const userData = mockCalls[mockCalls.length - 1]
          const storedApplications = JSON.parse(
            userData[userData.length - 1]
          )[0].applications
          expect(storedApplications[0].data.child.firstNames).toEqual('hello')
          expect(window.location.href).toContain('mother')
        })
        it('redirect to home when pressed save and exit button', async () => {
          app
            .find('#save_draft')
            .hostNodes()
            .simulate('click')
          await flushPromises()
          app.update()
          expect(window.location.href).toContain('/')
        })
        it('check toggle menu toggle button handler', async () => {
          app
            .find('#eventToggleMenuToggleButton')
            .hostNodes()
            .simulate('click')
          await flushPromises()
          app.update()
          expect(
            app.find('#eventToggleMenuSubMenu').hostNodes().length
          ).toEqual(1)
        })
        it('check toggle menu item handler', async () => {
          app
            .find('#eventToggleMenuToggleButton')
            .hostNodes()
            .simulate('click')
          await flushPromises()
          app.update()

          app
            .find('#eventToggleMenuItem0')
            .hostNodes()
            .simulate('click')
          await flushPromises()
          app.update()

          expect(window.location.href).toContain('/')
        })
      })

      describe('when user enters childBirthDate and clicks to documents page', () => {
        beforeEach(async () => {
          Date.now = jest.fn(() => 1549607679507) // 08-02-2019
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

          it('renders list of document upload field', () => {
            const fileInputs = app
              .find('#form_section_id_documents-view-group')
              .find('section')
              .children().length

            expect(fileInputs).toEqual(4)
          })
          it('still renders list of document upload field even when page is hidden - allows use of camera', async () => {
            setPageVisibility(false)
            await flushPromises()
            const fileInputs = app
              .update()
              .find('#form_section_id_documents-view-group')
              .find('section')
              .children().length
            expect(fileInputs).toEqual(4)
          })
        })
      })

      describe('when user goes to preview page', () => {
        beforeEach(async () => {
          await goToEndOfForm(app)
          app
            .find('#btn_change_child_firstNames')
            .hostNodes()
            .simulate('click')
        })

        it('renders preview page', async () => {
          const button = await waitForElement(app, '#back-to-review-button')

          button.hostNodes().simulate('click')

          const changeNameButton = await waitForElement(
            app,
            '#btn_change_child_firstNames'
          )
          expect(changeNameButton.hostNodes()).toHaveLength(1)
        })
      })

      describe('when user clicks the "mother" page', () => {
        beforeEach(() => goToMotherSection(app))
        it('changes to the mother details section', () => {
          expect(
            app.find('#form_section_title_mother-view-group').hostNodes()
          ).toHaveLength(1)
        })
        it('hides everything with pinpad if is page loses focus', async () => {
          setPageVisibility(false)
          await waitForElement(app, '#unlockPage')
        })
      })
      describe('when user clicks the "father" page', () => {
        beforeEach(() => goToFatherSection(app))
        it('changes to the father details section', () => {
          expect(
            app.find('#form_section_title_father-view-group').hostNodes()
          ).toHaveLength(1)
        })
      })
      describe('when user is in document page', () => {
        beforeEach(() => goToDocumentsSection(app))
        it('image upload field is rendered', () => {
          expect(app.find('#upload_document').hostNodes()).toHaveLength(4)
        })
      })
    })
  })
})
