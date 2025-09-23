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
import {
  ActionDocument,
  eventQueryDataGenerator,
  Location,
  LocationType,
  tennisClubMembershipEvent,
  User,
  UUID
} from '@opencrvs/commons/client'
import { testDataGenerator } from '@client/tests/test-data-generators'
import {
  tennisClubMembershipEventDocument,
  tennisClubMembershipEventIndex
} from '../../fixtures'
import {
  svgToPdfTemplate,
  stringifyEventMetadata,
  compileSvg
} from './pdfUtils'

const fetch = createFetchMock(vi)
fetch.enableMocks()

const locations = [
  {
    id: '35391063-7dca-4e57-abd3-20dcc8538a64' as UUID,
    name: 'HQ Office',
    parentId: 'f09c8dda-2156-420a-8215-2beda4c81d66' as UUID,
    validUntil: null,
    locationType: LocationType.enum.ADMIN_STRUCTURE
  },
  {
    id: 'f09c8dda-2156-420a-8215-2beda4c81d66' as UUID,
    name: 'Embe',
    parentId: '7ef2b9c7-5e6d-49f6-ae05-656207d0fc64' as UUID,
    validUntil: null,
    locationType: LocationType.enum.ADMIN_STRUCTURE
  },
  {
    id: '7ef2b9c7-5e6d-49f6-ae05-656207d0fc64' as UUID,
    name: 'Pualula',
    parentId: null,
    validUntil: null,
    locationType: LocationType.enum.ADMIN_STRUCTURE
  }
] as Location[]
const adminLevels = [
  {
    id: 'province',
    label: {
      id: 'v2.field.address.province.label',
      defaultMessage: 'Province',
      description: 'Label for province in address'
    }
  },
  {
    id: 'district',
    label: {
      id: 'v2.field.address.district.label',
      defaultMessage: 'District',
      description: 'Label for district in address'
    }
  }
]

describe('stringifyEventMetadata', () => {
  test('Resolves event metadata', () => {
    const generator = testDataGenerator()

    generator.user.id.localRegistrar

    const { declaration, ...metadata } = eventQueryDataGenerator({
      id: 'seabeast-clad-stad-elia-oleocellosis' as UUID,
      assignedTo: generator.user.id.localRegistrar,
      createdByUserType: 'user',
      createdBy: generator.user.id.localRegistrar,
      trackingId: 'B77FF6',
      createdAt: new Date(2000, 1, 1).toISOString(),
      updatedAt: new Date(2000, 1, 2).toISOString(),
      updatedAtLocation: locations[0].id,
      createdAtLocation: locations[0].id,
      updatedBy: generator.user.id.localRegistrar
    })

    const users = [generator.user.localRegistrar().v2]

    const stringified = stringifyEventMetadata({
      metadata: {
        ...metadata,
        modifiedAt: new Date(2000, 1, 2).toISOString(),
        copiesPrintedForTemplate: 1
      },
      locations,
      users,
      intl: createIntl({ locale: 'en' }),
      adminLevels
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

function expectRenderOutput(template: string, output: string) {
  const generator = testDataGenerator(2323)
  const registrar = generator.user.localRegistrar()
  const { declaration, ...metadata } = tennisClubMembershipEventIndex

  const result = compileSvg({
    templateString: template,
    $metadata: {
      ...metadata,
      createdBy: registrar.v2.id,
      modifiedAt: new Date().toISOString(),
      copiesPrintedForTemplate: 2
    },
    $actions: tennisClubMembershipEventDocument.actions as ActionDocument[],
    $declaration: {
      'applicant.name': {
        firstname: 'John',
        surname: 'Doe'
      }
    },
    review: false,
    locations: [],
    users: [registrar.v2],
    language: { lang: 'en', messages: {} },
    config: tennisClubMembershipEvent,
    adminLevels: [
      {
        id: 'province',
        label: {
          id: 'field.address.province.label',
          defaultMessage: 'Province',
          description: 'Label for province in address'
        }
      },
      {
        id: 'district',
        label: {
          id: 'field.address.district.label',
          defaultMessage: 'District',
          description: 'Label for district in address'
        }
      }
    ]
  })

  expect(result).toBe(output)
}

describe('SVG compiler', () => {
  describe('$actions', () => {
    it('allows you to access full list of actions', () => {
      expectRenderOutput(
        '<svg><text>{{ $lookup ($actions "DECLARE") "length" }}</text></svg>',
        '<svg><text>1</text></svg>'
      )
    })
  })
  describe('$action', () => {
    it('can be used to get full action details of the event', () => {
      expectRenderOutput(
        '<svg><text>{{ $action "DECLARE" }}</text></svg>',
        '<svg><text>[object Object]</text></svg>'
      )
      expectRenderOutput(
        '<svg><text>{{ $lookup ($action "DECLARE") "createdAt" }}</text></svg>',
        '<svg><text>23 January 2025</text></svg>'
      )
    })
  })
  describe('$lookup', () => {
    it('stringifies complex form field values using the stringifier of said form input', () => {
      expectRenderOutput(
        '<svg><text>{{ $lookup $declaration "applicant.name.fullname" }}</text></svg>',
        '<svg><text>John Doe</text></svg>'
      )
    })
    it('also gives you an access to the fields inside the value', () => {
      expectRenderOutput(
        '<svg><text>{{ $lookup $declaration "applicant.name.firstname" }}</text></svg>',
        '<svg><text>John</text></svg>'
      )
    })
    it('as a debugging helper, renders a json object as JSON instead of [object Object]', () => {
      expectRenderOutput(
        '<svg><text>{{ $lookup $declaration "applicant.name" }}</text></svg>',
        '<svg><text>{&quot;fullname&quot;:&quot;John Doe&quot;,&quot;firstname&quot;:&quot;John&quot;,&quot;surname&quot;:&quot;Doe&quot;}</text></svg>'
      )
    })
    it('Returns full honorific name', () => {
      expectRenderOutput(
        '<svg><text>{{ $lookup $metadata "createdBy.fullHonorificName" }}</text></svg>',
        '<svg><text>1st Order Honorable Kennedy Mweene</text></svg>'
      )
    })
  })
})
