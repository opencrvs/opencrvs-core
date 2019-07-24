import {
  createTestApp,
  mockOfflineData,
  assign,
  validToken,
  getItem,
  flushPromises,
  setItem,
  selectOption,
  getFileFromBase64String,
  validImageB64String,
  inValidImageB64String
} from '@register/tests/util'
import { DRAFT_BIRTH_PARENT_FORM } from '@register/navigation/routes'
import {
  storeApplication,
  createApplication,
  IApplication
} from '@register/applications'
import { ReactWrapper } from 'enzyme'
import { History } from 'history'
import { Store } from 'redux'
import { getOfflineDataSuccess } from '@register/offline/actions'
import { storage } from '@register/storage'
import { Event } from '@register/forms'
import * as CommonUtils from '@register/utils/commonUtils'
import * as fetchAny from 'jest-fetch-mock'

const fetch = fetchAny as any

storage.getItem = jest.fn()
storage.setItem = jest.fn()
jest.spyOn(CommonUtils, 'isMobileDevice').mockReturnValue(true)

beforeEach(() => {
  window.history.replaceState({}, '', '/')
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
    let draft: IApplication
    storage.getItem = jest
      .fn()
      .mockReturnValueOnce(null)
      .mockReturnValueOnce(null)
      .mockReturnValueOnce('true')
      .mockReturnValueOnce(
        '$2a$10$nD0E23/QJK0tjbPN23zg1u7rYnhsm8Y5/08.H20SSdqLVyuwFtVsG'
      )
    beforeEach(async () => {
      draft = createApplication(Event.BIRTH)
      store.dispatch(storeApplication(draft))

      it('renders unlock screen', async () => {
        await flushPromises()
        history.replace(
          DRAFT_BIRTH_PARENT_FORM.replace(':applicationId', draft.id.toString())
        )
        await flushPromises()
        app.update()
      })
      expect(app.find('#unlockPage').hostNodes().length).toBe(1)
    })
  })
  describe('when user is in birth registration by parent informant view', () => {
    let draft: IApplication
    beforeEach(async () => {
      storage.getItem = jest.fn()
      storage.setItem = jest.fn()
      draft = createApplication(Event.BIRTH)
      store.dispatch(storeApplication(draft))
      history.replace(
        DRAFT_BIRTH_PARENT_FORM.replace(':applicationId', draft.id.toString())
      )
      await flushPromises()
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

    describe('when user types in something and press continue', () => {
      beforeEach(async () => {
        app
          .find('#firstNames')
          .hostNodes()
          .simulate('change', {
            target: { id: 'firstNames', value: 'hello' }
          })
        await flushPromises()
        app.update()
        app
          .find('#next_section')
          .hostNodes()
          .simulate('click')
        await flushPromises()
        app.update()
      })
      it('stores the value to a new draft and move to next section', () => {
        const mockCalls = (storage.setItem as jest.Mock).mock.calls
        const userData = mockCalls[mockCalls.length - 1]
        const storedApplications = JSON.parse(userData[userData.length - 1])[0]
          .applications
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
        expect(app.find('#eventToggleMenuSubMenu').hostNodes().length).toEqual(
          1
        )
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

          expect(fileInputs).toEqual(6)
        })
      })
    })

    describe('when user goes to preview page', () => {
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
          .find('#btn_change_child_firstNames')
          .hostNodes()
          .simulate('click')
        await flushPromises()
        app.update()
        app
          .find('#edit_confirm')
          .hostNodes()
          .simulate('click')
        await flushPromises()
        app.update()
      })

      it('renders preview page', async () => {
        app
          .find('#back-to-review-button')
          .hostNodes()
          .simulate('click')
        await flushPromises()
        app.update()
        expect(
          app.find('#btn_change_child_firstNames').hostNodes()
        ).toHaveLength(1)
      })
    })

    describe('when user clicks the "mother" page', () => {
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
          app.find('#form_section_title_mother-view-group').hostNodes()
        ).toHaveLength(1)
      })
    })
    describe('when user clicks the "father" page', () => {
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
      })
      it('changes to the father details section', () => {
        expect(
          app.find('#form_section_title_father-view-group').hostNodes()
        ).toHaveLength(1)
      })
    })
    describe('when user is in document page', () => {
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
      it('image upload field is rendered', () => {
        expect(app.find('#upload_document').hostNodes()).toHaveLength(6)
      })
    })
  })
})
