import { createTestApp, setItem, flushPromises } from 'src/tests/util'
import { queries } from 'src/profile/queries'
import { merge } from 'lodash'
import { assign, validToken, mockUserResponse } from 'src/tests/util'
import { WORK_QUEUE } from 'src/navigation/routes'
import { storage } from 'src/storage'
import { History } from 'history'
import { ReactWrapper } from 'enzyme'
import * as fetch from 'jest-fetch-mock'
const mockFetchUserDetails = jest.fn()

const nameObj = {
  data: {
    getUser: {
      name: [
        {
          use: 'en',
          firstNames: 'Mohammad',
          familyName: 'Ashraful',
          __typename: 'HumanName'
        },
        { use: 'bn', firstNames: '', familyName: '', __typename: 'HumanName' }
      ],
      role: 'DISTRICT_REGISTRAR'
    }
  }
}

merge(mockUserResponse, nameObj)
mockFetchUserDetails.mockReturnValue(mockUserResponse)
queries.fetchUserDetails = mockFetchUserDetails

const getItem = window.localStorage.getItem as jest.Mock

storage.getItem = jest.fn()
storage.setItem = jest.fn()
beforeEach(() => {
  history.replaceState({}, '', '/')
  assign.mockClear()
})

describe('WorkQueue tests', async () => {
  let app: ReactWrapper
  let history: History

  beforeEach(async () => {
    getItem.mockReturnValue(validToken)
    setItem.mockClear()
    fetch.resetMocks()
    const testApp = createTestApp()
    app = testApp.app
    await flushPromises()
    app.update()
    history = testApp.history
    history.replace(WORK_QUEUE.replace(':tabId', 'progress'))
    app.update()
  })
  it('renders page with three tabs', async () => {
    expect(app.find('#tab_progress').hostNodes()).toHaveLength(1)

    app
      .find('#tab_progress')
      .hostNodes()
      .simulate('click')
    app
      .find('#tab_review')
      .hostNodes()
      .simulate('click')
    app
      .find('#tab_updates')
      .hostNodes()
      .simulate('click')
  })
})
