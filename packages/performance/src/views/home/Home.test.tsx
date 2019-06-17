import * as React from 'react'
import { Home } from '@performance/views/home/Home'
import { ReactWrapper } from 'enzyme'
import { createStore } from '@performance/store'
import {
  createTestComponent,
  mockUserResponse,
  userDetails
} from '@performance/tests/util'
import { queries } from '@performance/profile/queries'
import { setInitialUserDetails } from '@opencrvs/performance/src/profile/actions'
import { FETCH_METRIC } from '@performance/views/home/queries'

const mockFetchUserDetails = jest.fn()
Date.now = jest.fn(() => 1567142659530)
mockFetchUserDetails.mockReturnValue(mockUserResponse)
queries.fetchUserDetails = mockFetchUserDetails

const { store } = createStore()

describe('when user is in the home page', () => {
  let homeComponent: ReactWrapper<{}, {}>
  const graphQLMock = [
    {
      request: {
        query: FETCH_METRIC,
        variables: {
          timeStart: 1527098400000,
          timeEnd: 1567142659530,
          locationId: '123456789'
        }
      },
      result: {
        data: {
          fetchBirthRegistrationMetrics: {
            keyFigures: [
              {
                label: 'DAYS_0_TO_45',
                value: 17,
                total: 500,
                estimate: 3000,
                categoricalData: [
                  {
                    name: 'female',
                    value: 280
                  },
                  {
                    name: 'male',
                    value: 220
                  }
                ]
              },
              {
                label: 'DAYS_46_TO_365',
                value: 33,
                total: 1000,
                estimate: 3000,
                categoricalData: [
                  {
                    name: 'female',
                    value: 480
                  },
                  {
                    name: 'male',
                    value: 520
                  }
                ]
              },
              {
                label: 'DAYS_0_TO_365',
                value: 50,
                total: 1500,
                estimate: 3000,
                categoricalData: [
                  {
                    name: 'female',
                    value: 760
                  },
                  {
                    name: 'male',
                    value: 740
                  }
                ]
              },
              {
                label: 'dummy',
                value: 0,
                total: 0,
                estimate: 0,
                categoricalData: [
                  {
                    name: '',
                    value: 0
                  }
                ]
              }
            ],
            regByAge: [
              {
                label: '45d',
                value: 3
              },
              {
                label: '46d - 1yr',
                value: 0
              },
              {
                label: '1yr',
                value: 152
              },
              {
                label: '2yr',
                value: 0
              },
              {
                label: '3yr',
                value: 0
              },
              {
                label: '4yr',
                value: 0
              },
              {
                label: '5yr',
                value: 0
              },
              {
                label: '6yr',
                value: 0
              },
              {
                label: '7yr',
                value: 0
              },
              {
                label: '8yr',
                value: 0
              },
              {
                label: '9r',
                value: 0
              },
              {
                label: '10yr',
                value: 0
              }
            ],
            regWithin45d: [
              {
                label: 'May',
                value: 0,
                totalEstimate: 155
              },
              {
                label: 'June',
                value: 0,
                totalEstimate: 155
              },
              {
                label: 'July',
                value: 0,
                totalEstimate: 155
              },
              {
                label: 'August',
                value: 0,
                totalEstimate: 155
              },
              {
                label: 'September',
                value: 0,
                totalEstimate: 155
              },
              {
                label: 'October',
                value: 0,
                totalEstimate: 155
              },
              {
                label: 'November',
                value: 0,
                totalEstimate: 155
              },
              {
                label: 'December',
                value: 0,
                totalEstimate: 155
              },
              {
                label: 'January',
                value: 0,
                totalEstimate: 155
              },
              {
                label: 'February',
                value: 0,
                totalEstimate: 155
              },
              {
                label: 'March',
                value: 16,
                totalEstimate: 155
              },
              {
                label: 'April',
                value: 139,
                totalEstimate: 155
              }
            ]
          }
        }
      }
    }
  ]

  beforeEach(async () => {
    const testComponent = createTestComponent(<Home />, store, graphQLMock)
    store.dispatch(setInitialUserDetails(userDetails))
    homeComponent = testComponent.component
    await new Promise((resolve, reject) => {
      setTimeout(resolve, 500)
    })
    homeComponent.update()
  })

  it('renders box title', () => {
    expect(
      homeComponent
        .find('#box_title')
        .hostNodes()
        .text()
    ).toBe('Birth Registration Key Figures')
  })

  it('renders bar chart box title', () => {
    expect(
      homeComponent
        .find('#bar_chart_box_title')
        .hostNodes()
        .text()
    ).toBe('At What Age Are Births Registered In Children Aged 0-10 Years')
  })

  it('renders line chart box title', () => {
    expect(
      homeComponent
        .find('#line_chart_box_title')
        .hostNodes()
        .text()
    ).toBe('Birth Rate For Registrations Within 45 Days')
  })

  it('renders footer text', () => {
    expect(
      homeComponent
        .find('#footer_text')
        .hostNodes()
        .text()
    ).toBe('Estimates provided using National Population Census data')
  })
})
