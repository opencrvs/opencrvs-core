import { createTestApp } from '@register/tests/util'
import { ReactWrapper } from 'enzyme'
import { Store } from 'redux'
import * as actions from '@register/notification/actions'
import * as i18nActions from '@register/i18n/actions'
import * as CommonUtils from '@register/utils/commonUtils'

describe('when app notifies the user', () => {
  let app: ReactWrapper
  let store: Store

  beforeEach(async () => {
    const testApp = await createTestApp()
    app = testApp.app
    store = testApp.store
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
        .update()
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
        .update()
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

  describe('When user submits a form', () => {
    describe('In case of successful submission', () => {
      beforeEach(() => {
        const action = actions.showSubmitFormSuccessToast('userFormSuccess')
        store.dispatch(action)
        app.update()
      })

      it('shows submit success toast', () => {
        expect(app.find('#submissionSuccessToast').hostNodes()).toHaveLength(1)
      })

      it('clicking cancel button should hide the toast', () => {
        app
          .find('#submissionSuccessToastCancel')
          .hostNodes()
          .simulate('click')
        app.update()
        expect(store.getState().notification.submitFormSuccessToast).toBe(null)
      })
    })

    describe('In case of failed submission', () => {
      beforeEach(() => {
        const action = actions.showSubmitFormErrorToast('userFormFail')
        store.dispatch(action)
        app.update()
      })

      it('shows submit fail toast', () => {
        expect(app.find('#submissionErrorToast').hostNodes()).toHaveLength(1)
      })

      it('clicking cancel button should hide the toast', () => {
        app
          .find('#submissionErrorToastCancel')
          .hostNodes()
          .simulate('click')
        app.update()
        expect(store.getState().notification.submitFormErrorToast).toBe(null)
      })
    })
  })
})
