import { deathNotificationHandler } from '@bgd-dhis2-mediator/features/notification/death/handler'
import { body } from '@bgd-dhis2-mediator/test/death-integration'
import * as fetchMock from 'jest-fetch-mock'

let fetch: fetchMock.FetchMock
let locationTuple: [fetchMock.BodyOrFunction, fetchMock.MockParams]

describe('Death handler', () => {
  beforeAll(() => {
    fetch = fetchMock as fetchMock.FetchMock
    locationTuple = [
      JSON.stringify({
        resourceType: 'Bundle',
        entry: [
          {
            resource: {
              resourceType: 'Location',
              id: '123',
              partOf: { reference: 'Location/123' }
            }
          }
        ]
      }),
      {}
    ]
  })

  it('return a mediator response', async () => {
    const request = {
      payload: JSON.stringify(body),
      headers: { authorization: 'bearer xyz' }
    }
    const header = jest.fn()
    const code = jest.fn().mockReturnValue({ header })
    const h = { response: () => ({ code }) }

    // 3 x create patient location fetches
    fetch.mockResponses(...new Array(12).fill(locationTuple))

    // Resolve union
    fetch.mockResponses(...new Array(4).fill(locationTuple))

    // post bundle
    fetch.mockResponse(
      JSON.stringify({
        resourceType: 'Bundle',
        entry: [
          {
            resource: {}
          }
        ]
      })
    )

    // @ts-ignore
    await deathNotificationHandler(request, h)

    expect(code).toBeCalledWith(201)
    expect(header).toBeCalledWith('Content-Type', 'application/json+openhim')

    fetch.resetMocks()
  })
})
