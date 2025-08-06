/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */

import { createIntl } from 'react-intl'
import createFetchMock from 'vitest-fetch-mock'
import { ContentSvg } from 'pdfmake/interfaces'
import { eventQueryDataGenerator, User, UUID } from '@opencrvs/commons/client'
import { svgToPdfTemplate, stringifyEventMetadata } from './pdfUtils'

const fetch = createFetchMock(vi)
fetch.enableMocks()

const locations = [
  {
    id: '35391063-7dca-4e57-abd3-20dcc8538a64' as UUID,
    externalId: '2OKicPQMNI',
    name: 'HQ Office',
    partOf: 'f09c8dda-2156-420a-8215-2beda4c81d66' as UUID
  },
  {
    id: 'f09c8dda-2156-420a-8215-2beda4c81d66' as UUID,
    externalId: 'BxrIbNW7f3K',
    name: 'Embe',
    partOf: '7ef2b9c7-5e6d-49f6-ae05-656207d0fc64' as UUID
  },
  {
    id: '7ef2b9c7-5e6d-49f6-ae05-656207d0fc64' as UUID,
    externalId: 'B1u1bVtIA92',
    name: 'Pualula',
    partOf: null
  }
]
const userId = '677fb08730f3abfa33072769'

describe('stringifyEventMetadata', () => {
  test('Resolves event metadata', () => {
    const { declaration, ...metadata } = eventQueryDataGenerator({
      id: 'seabeast-clad-stad-elia-oleocellosis' as UUID,
      assignedTo: userId,
      createdByUserType: 'user',
      createdBy: userId,
      trackingId: 'B77FF6',
      createdAt: new Date(2000, 1, 1).toISOString(),
      updatedAt: new Date(2000, 1, 2).toISOString(),
      updatedAtLocation: locations[0].id,
      createdAtLocation: locations[0].id,
      updatedBy: userId
    })

    const users = [
      {
        id: userId,
        name: [
          {
            use: 'en',
            given: ['Joseph'],
            family: 'Musonda'
          }
        ],
        role: 'NATIONAL_REGISTRAR'
      }
    ] satisfies User[]

    const stringified = stringifyEventMetadata({
      metadata: {
        ...metadata,
        modifiedAt: new Date(2000, 1, 2).toISOString(),
        copiesPrintedForTemplate: 1
      },
      locations,
      users,
      intl: createIntl({ locale: 'en' })
    })
    expect(stringified).toMatchSnapshot()
  })
})
describe('svgToPdfTemplate', () => {
  test('replaces image URL with base64 data', async () => {
    fetch.mockResolvedValue({
      blob: async () =>
        Promise.resolve(new Blob(['fake-image-data'], { type: 'image/png' }))
    } as Response)

    const mockFiles = [
      'data:image/png;base64,FIRST_FILE_DATA',
      'data:image/png;base64,SECOND_FILE_DATA'
    ]

    global.FileReader = vi.fn(() => {
      const mockFileReader = {
        readAsDataURL: vi.fn(),
        result: mockFiles.shift(),
        onload: null as null | (() => void),
        onerror: null
      }
      // Trigger the FileReader onload manually
      setTimeout(() => {
        if (mockFileReader.onload) {
          mockFileReader.onload()
        }
      }, 0)
      return mockFileReader
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }) as any

    const svgString = `
      <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <image href="https://example.com/image.png" x="0" y="0" width="50" height="50"/>
        <image xlink:href="https://example.com/image2.png" x="0" y="0" width="50" height="50"/>
      </svg>
    `

    const result = await svgToPdfTemplate(svgString, {})
    const [content] = result.definition.content as [ContentSvg]

    expect(content).toHaveProperty('svg')
    expect(fetch).toHaveBeenCalledTimes(2)
    expect(content.svg).toBe(
      `
      <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <image href="data:image/png;base64,FIRST_FILE_DATA" x="0" y="0" width="50" height="50"/>
        <image xlink:href="data:image/png;base64,SECOND_FILE_DATA" x="0" y="0" width="50" height="50"/>
      </svg>
      `.trim()
    )
  })
})
