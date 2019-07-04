import {
  createTestApp,
  mockOfflineData,
  assign,
  validToken,
  getItem,
  flushPromises,
  setItem
} from '@register/tests/util'
import { ReactWrapper } from 'enzyme'
import { Store } from 'redux'
import { getOfflineDataSuccess } from '@register/offline/actions'
import * as fetchAny from 'jest-fetch-mock'
import { storage } from '@register/storage'
import * as actions from '@register/notification/actions'
import * as i18nActions from '@register/i18n/actions'
import * as CommonUtils from '@register/utils/commonUtils'

const fetch = fetchAny as any

storage.getItem = jest.fn()
storage.setItem = jest.fn()

beforeEach(() => {
  window.history.replaceState({}, '', '/')
  assign.mockClear()
})

describe('when app notifies the user', () => {
  let app: ReactWrapper
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
    store = testApp.store
    store.dispatch(getOfflineDataSuccess(JSON.stringify(mockOfflineData)))
  })

  describe('when appliation has new update', () => {
    jest.spyOn(CommonUtils, 'isMobileDevice').mockReturnValue(true)
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
        'কিছু তথ্য হালনাগাদ করা হয়েছে, রিফ্রেশ করতে এখানে ক্লিক করুন।'
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
})
