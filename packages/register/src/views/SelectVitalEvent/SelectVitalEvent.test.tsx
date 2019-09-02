import {
  createTestApp,
  flushPromises,
  waitForReady
} from '@register/tests/util'
import { SELECT_VITAL_EVENT } from '@register/navigation/routes'
import { ReactWrapper } from 'enzyme'
import { History } from 'history'
import { waitForElement } from '@register/tests/wait-for-element'

describe('when user is selecting the vital event', () => {
  let app: ReactWrapper
  let history: History

  beforeEach(async () => {
    const testApp = await createTestApp()
    app = testApp.app
    history = testApp.history
    await waitForReady(app)
  })

  describe('when user is in vital event selection view', () => {
    beforeEach(async () => {
      history.replace(SELECT_VITAL_EVENT)
      await waitForElement(app, '#select_vital_event_view')
    })
    it('lists the options', () => {
      expect(app.find('#select_vital_event_view')).toHaveLength(2)
    })
    describe('when selects "Birth"', () => {
      beforeEach(() => {
        app
          .find('#select_birth_event')
          .hostNodes()
          .simulate('change')

        app
          .find('#continue')
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
          .simulate('change')
        app
          .find('#continue')
          .hostNodes()
          .simulate('click')
      })
      it('takses user to the death registration form', () => {
        expect(history.location.pathname).toContain('events/death')
      })
    })

    describe('when clicked on cross button', () => {
      beforeEach(async () => {
        app
          .find('#crcl-btn')
          .hostNodes()
          .simulate('click')
        await flushPromises()
        app.update()
      })
      it('go back to home page', async () => {
        expect(window.location.href).toContain('/')
      })
    })
  })
})
