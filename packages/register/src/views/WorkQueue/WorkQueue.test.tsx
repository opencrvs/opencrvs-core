import * as React from 'react'
import { WorkQueue, FETCH_REGISTRATION_QUERY } from './WorkQueue'
import { createTestComponent } from 'src/tests/util'
import { createStore } from 'src/store'
import { Spinner, DataTable } from '@opencrvs/components/lib/interface'

describe('WorkQueue tests', async () => {
  const { store } = createStore()

  it('sets loading state while waiting for data', () => {
    const testComponent = createTestComponent(
      // @ts-ignore
      <WorkQueue />,
      store
    )

    // @ts-ignore
    expect(testComponent.component.containsMatchingElement(Spinner)).toBe(true)

    testComponent.component.unmount()
  })

  it('renders all items returned from graphql query', async () => {
    const graphqlMock = [
      {
        request: {
          query: FETCH_REGISTRATION_QUERY
        },
        result: {
          data: {
            listBirthRegistrations: [
              {
                id: 'e302f7c5-ad87-4117-91c1-35eaf2ea7be8',
                registration: {
                  trackingId: 'B111111'
                },
                child: {
                  name: [
                    {
                      use: null,
                      firstNames: 'Baby',
                      familyName: 'Doe'
                    }
                  ],
                  birthDate: null
                },
                createdAt: '2018-05-23T14:44:58+02:00'
              },
              {
                id: 'cc66d69c-7f0a-4047-9283-f066571830f1',
                registration: {
                  trackingId: 'B222222'
                },
                child: {
                  name: [
                    {
                      use: 'english',
                      firstNames: 'Baby',
                      familyName: 'Smith'
                    }
                  ],
                  birthDate: null
                },
                createdAt: '2018-05-23T14:44:58+02:00'
              }
            ]
          }
        }
      }
    ]

    const testComponent = createTestComponent(
      // @ts-ignore
      <WorkQueue />,
      store,
      graphqlMock
    )

    // wait for mocked data to load mockedProvider
    await new Promise(resolve => {
      setTimeout(resolve, 0)
    })

    testComponent.component.update()

    const data = testComponent.component.find(DataTable).prop('data')
    expect(data).toEqual([
      {
        name: 'Baby Doe',
        dob: '',
        date_of_application: '6 months ago',
        tracking_id: 'B111111',
        createdAt: '2018-05-23T14:44:58+02:00',
        declaration_status: 'application',
        event: 'birth',
        location: ''
      },
      {
        name: 'Baby Smith',
        dob: '',
        date_of_application: '6 months ago',
        tracking_id: 'B222222',
        createdAt: '2018-05-23T14:44:58+02:00',
        declaration_status: 'application',
        event: 'birth',
        location: ''
      }
    ])

    testComponent.component.unmount()
  })

  it('renders error text when an error occurs', async () => {
    const graphqlMock = [
      {
        request: {
          query: FETCH_REGISTRATION_QUERY
        },
        error: new Error('boom')
      }
    ]

    const testComponent = createTestComponent(
      // @ts-ignore
      <WorkQueue />,
      store,
      graphqlMock
    )

    // wait for mocked data to load mockedProvider
    await new Promise(resolve => {
      setTimeout(resolve, 0)
    })

    testComponent.component.update()

    expect(
      testComponent.component
        .find('#work-queue-error-text')
        .children()
        .text()
    ).toBe('An error occurred while searching')

    testComponent.component.unmount()
  })
})
