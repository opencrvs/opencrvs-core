import { generateBirthRegPoint } from '@metrics/features/registration/pointGenerator'
import { testPayload } from '@metrics/features/registration/testUtils'
import { cloneDeep } from 'lodash'
import * as fetchAny from 'jest-fetch-mock'

const fetch = fetchAny as any

describe('Verify point generation', () => {
  it('Return valid birth registration point to insert in influx', async () => {
    Date.now = jest.fn(() => 1552380296600) // 12-03-2019
    fetch.mockResponses(
      [
        JSON.stringify({
          id: '1',
          partOf: {
            reference: 'Location/4'
          }
        })
      ],
      [
        JSON.stringify({
          id: '2',
          partOf: {
            reference: 'Location/3'
          }
        })
      ],
      [
        JSON.stringify({
          id: '3',
          partOf: {
            reference: 'Location/2'
          }
        })
      ]
    )
    const point = await generateBirthRegPoint(
      cloneDeep(testPayload),
      'mark-existing-application-registered',
      {
        Authorization: 'Bearer mock-token'
      }
    )
    expect(point).toEqual({
      measurement: 'birth_reg',
      tags: {
        reg_status: 'mark-existing-application-registered',
        gender: 'male'
      },
      fields: {
        current_status: 'registered',
        locationLevel5: 'Location/308c35b4-04f8-4664-83f5-9790e790cde1',
        locationLevel4: 'Location/4',
        locationLevel3: 'Location/3',
        locationLevel2: 'Location/2',
        age_in_days: 435
      }
    })
  })
  it('Only populates level5 location data if rest of the tree is missing', async () => {
    const payload = cloneDeep(testPayload)
    // @ts-ignore
    payload.entry[2].resource = {
      resourceType: 'Patient',
      active: true,
      id: '3b5c1496-2794-4deb-aba0-c3c034695029',
      name: [
        {
          use: 'bn',
          family: ['মকবুলনিউ']
        }
      ],
      gender: 'male'
    }

    Date.now = jest.fn(() => 1552380296600) // 12-03-2019
    fetch.mockResponseOnce(JSON.stringify({}))
    const point = await generateBirthRegPoint(
      payload,
      'mark-existing-application-registered',
      {
        Authorization: 'Bearer mock-token'
      }
    )
    expect(point).toEqual({
      measurement: 'birth_reg',
      tags: {
        reg_status: 'mark-existing-application-registered',
        gender: 'male'
      },
      fields: {
        current_status: 'registered',
        locationLevel5: 'Location/308c35b4-04f8-4664-83f5-9790e790cde1',
        age_in_days: undefined
      }
    })
  })
  it('Populates partial location tree in-case data unavailibility', async () => {
    Date.now = jest.fn(() => 1552380296600) // 12-03-2019
    fetch.mockResponses(
      [
        JSON.stringify({
          id: '1',
          partOf: {
            reference: 'Location/4'
          }
        })
      ],
      [JSON.stringify({})]
    )
    const point = await generateBirthRegPoint(
      cloneDeep(testPayload),
      'mark-existing-application-registered',
      {
        Authorization: 'Bearer mock-token'
      }
    )
    expect(point).toEqual({
      measurement: 'birth_reg',
      tags: {
        reg_status: 'mark-existing-application-registered',
        gender: 'male'
      },
      fields: {
        current_status: 'registered',
        locationLevel5: 'Location/308c35b4-04f8-4664-83f5-9790e790cde1',
        locationLevel4: 'Location/4',
        age_in_days: 435
      }
    })
  })
  it('Throw error when no child section found', () => {
    const payload = cloneDeep(testPayload)
    // @ts-ignore
    payload.entry[2] = {
      fullUrl: 'urn:uuid:048d3e42-40c3-4e46-81f0-e3869251b74a'
    }
    expect(
      generateBirthRegPoint(payload, 'mark-existing-application-registered', {
        Authorization: 'Bearer mock-token'
      })
    ).rejects.toThrowError('No child found!')
  })
})
