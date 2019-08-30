import * as React from 'react'
import { createStore } from '@register/store'
import {
  createTestComponent,
  mockDeathApplicationData,
  validToken,
  mockUserResponse
} from '@register/tests/util'
import { storeApplication } from '@register/applications'
import { Event } from '@register/forms'
import { Payment } from './Payment'
import { queries } from '@register/profile/queries'
import { checkAuth } from '@register/profile/profileActions'

const getItem = window.localStorage.getItem as jest.Mock
;(queries.fetchUserDetails as jest.Mock).mockReturnValue(mockUserResponse)

describe('verify collector tests', () => {
  const { store, history } = createStore()
  const mockLocation: any = jest.fn()

  const deathApplication = {
    id: 'mockDeath1234',
    data: mockDeathApplicationData,
    event: Event.DEATH
  }

  describe('in case of death application renders payment component', () => {
    beforeAll(() => {
      getItem.mockReturnValue(validToken)
      store.dispatch(checkAuth({ '?token': validToken }))

      store.dispatch(storeApplication(deathApplication))
    })

    it('when informant is collector', async () => {
      const testComponent = await createTestComponent(
        <Payment
          location={mockLocation}
          history={history}
          match={{
            params: {
              registrationId: 'mockDeath1234',
              eventType: Event.DEATH
            },
            isExact: true,
            path: '',
            url: ''
          }}
        />,
        store
      )

      expect(
        testComponent.component
          .find('#service')
          .hostNodes()
          .text()
      ).toContain('Death')
    })
  })
})
