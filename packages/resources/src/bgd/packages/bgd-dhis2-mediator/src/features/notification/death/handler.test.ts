// tslint:disable-next-line:no-relative-imports
import { deathNotificationHandler } from './handler'
// tslint:disable-next-line:no-relative-imports
import { body } from '../../../test/death-integration'
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

  it('throws an error when location of notification cannot be determines', async () => {
    const request = {
      payload: JSON.stringify(body),
      headers: { authorization: 'bearer xyz' }
    }
    const code = jest.fn()
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

    fetch.resetMocks()
  })
})
