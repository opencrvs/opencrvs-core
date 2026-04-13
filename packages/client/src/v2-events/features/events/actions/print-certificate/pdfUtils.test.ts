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
  AddressType,
  eventQueryDataGenerator,
  tennisClubMembershipEvent,
  UUID
} from '@opencrvs/commons/client'
import { testDataGenerator } from '@client/tests/test-data-generators'
import {
  tennisClubMembershipEventDocument,
  tennisClubMembershipEventIndex
} from '../../fixtures'
import {
  V2_DEFAULT_MOCK_ADMINISTRATIVE_AREAS_MAP,
  V2_DEFAULT_MOCK_LOCATIONS,
  V2_DEFAULT_MOCK_LOCATIONS_MAP
} from '../../../../../tests/v2-events/administrative-hierarchy-mock'
import {
  svgToPdfTemplate,
  stringifyEventMetadata,
  compileSvg
} from './pdfUtils'

const fetch = createFetchMock(vi)
fetch.enableMocks()

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

    const { declaration, ...metadata } = eventQueryDataGenerator({
      id: 'seabeast-clad-stad-elia-oleocellosis' as UUID,
      assignedTo: generator.user.id.localRegistrar,
      createdByUserType: 'user',
      createdBy: generator.user.id.localRegistrar,
      trackingId: 'B77FF6',
      createdAt: new Date(2000, 1, 1).toISOString(),
      updatedAt: new Date(2000, 1, 2).toISOString(),
      updatedAtLocation: V2_DEFAULT_MOCK_LOCATIONS.find(
        (loc) => loc.name === 'Isamba District Office'
      )?.id,
      createdAtLocation: V2_DEFAULT_MOCK_LOCATIONS[0].id,
      updatedBy: generator.user.id.localRegistrar
    })

    const users = [generator.user.localRegistrar().v2]

    const stringified = stringifyEventMetadata({
      metadata: {
        ...metadata,
        modifiedAt: new Date(2000, 1, 2).toISOString(),
        copiesPrintedForTemplate: 1
      },
      locations: V2_DEFAULT_MOCK_LOCATIONS_MAP,
      administrativeAreas: V2_DEFAULT_MOCK_ADMINISTRATIVE_AREAS_MAP,
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

  test('multipage certificate', async () => {
    const svgString = `
      <svg width="200" height="400" xmlns="http://www.w3.org/2000/svg">
        <g data-page="1">
          <rect x="10" y="10" width="180" height="380" fill="red"/>
        </g>
        <g data-page="2">
          <circle cx="100" cy="200" r="80" fill="green"/>
        </g>
      </svg>
    `.trim()

    const result = await svgToPdfTemplate(svgString, {})
    const contents = result.definition.content as ContentSvg[]

    expect(contents.length).toBe(2)

    expect(contents[0].svg).toContain(
      '<svg width="200" height="400" xmlns="http://www.w3.org/2000/svg"><g data-page="1">\n' +
        '          <rect x="10" y="10" width="180" height="380" fill="red"></rect>\n' +
        '        </g></svg>'
    )
    expect(contents[1].svg).toContain(
      '<svg width="200" height="400" xmlns="http://www.w3.org/2000/svg"><g data-page="2">\n' +
        '          <circle cx="100" cy="200" r="80" fill="green"></circle>\n' +
        '        </g></svg>'
    )
    expect(result.definition.pageSize).toEqual({ width: 200, height: 200 })
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
    locations: new Map(),
    administrativeAreas: new Map(),
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
  describe('$join', () => {
    // Uses the tennis club event's `applicant.address` field (ADDRESS type) with real
    // mock admin area UUIDs so stringifyDeclaration can resolve district/province names.
    // Ibombo (62a0ccb4) is a district under Central province (a45b982a).
    // Addressing Central directly gives province-only (no district key).
    function expectRenderWithAddress(
      template: string,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      addressValue: Record<string, any>,
      output: string
    ) {
      const generator = testDataGenerator(2323)
      const registrar = generator.user.localRegistrar()
      const { declaration: _decl, ...metadata } = tennisClubMembershipEventIndex

      const result = compileSvg({
        templateString: template,
        $metadata: {
          ...metadata,
          createdBy: registrar.v2.id,
          modifiedAt: new Date().toISOString(),
          copiesPrintedForTemplate: 2
        },
        $actions: tennisClubMembershipEventDocument.actions as ActionDocument[],
        $declaration: { 'applicant.address': addressValue },
        review: false,
        locations: V2_DEFAULT_MOCK_LOCATIONS_MAP,
        administrativeAreas: V2_DEFAULT_MOCK_ADMINISTRATIVE_AREAS_MAP,
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

    it('joins all values when all location levels are present', () => {
      // Ibombo is a district under Central province → district + province present
      // (domestic country code 'FAR' has no intl message in test env, resolves to '' and is dropped by $join)
      expectRenderWithAddress(
        '<svg><text>{{$join ", " ($lookup $declaration "applicant.address.district") ($lookup $declaration "applicant.address.province") ($lookup $declaration "applicant.address.country")}}</text></svg>',
        {
          addressType: AddressType.DOMESTIC,
          administrativeArea: '62a0ccb4-880d-4f30-8882-f256007dfff9' as UUID,
          country: 'FAR'
        },
        '<svg><text>Ibombo, Central</text></svg>'
      )
    })

    it('omits district when absent, producing no leading comma', () => {
      // Central is a province with no parent → only province, no district key
      expectRenderWithAddress(
        '<svg><text>{{$join ", " ($lookup $declaration "applicant.address.district") ($lookup $declaration "applicant.address.province") ($lookup $declaration "applicant.address.country")}}</text></svg>',
        {
          addressType: AddressType.DOMESTIC,
          administrativeArea: 'a45b982a-5c7b-4bd9-8fd8-a42d0994054c' as UUID,
          country: 'FAR'
        },
        '<svg><text>Central</text></svg>'
      )
    })

    it('combined with $or: uses state when present (international address)', () => {
      // International address: streetLevelDetails.state is set, province is absent
      // country code is resolved to its full English name via intl
      expectRenderWithAddress(
        '<svg><text>{{$join ", " ($or ($lookup $declaration "applicant.address.streetLevelDetails.state") ($lookup $declaration "applicant.address.province")) ($lookup $declaration "applicant.address.country")}}</text></svg>',
        {
          addressType: AddressType.INTERNATIONAL,
          country: 'USA',
          streetLevelDetails: { state: 'California' }
        },
        '<svg><text>California, United States of America</text></svg>'
      )
    })

    it('combined with $or: falls back to province when state is absent (domestic address)', () => {
      // Domestic address at province level: no state, province = Central
      expectRenderWithAddress(
        '<svg><text>{{$join ", " ($or ($lookup $declaration "applicant.address.streetLevelDetails.state") ($lookup $declaration "applicant.address.province")) ($lookup $declaration "applicant.address.country")}}</text></svg>',
        {
          addressType: AddressType.DOMESTIC,
          administrativeArea: 'a45b982a-5c7b-4bd9-8fd8-a42d0994054c' as UUID,
          country: 'FAR'
        },
        '<svg><text>Central</text></svg>'
      )
    })

    it('combined with $or: renders only country when both state and province are absent', () => {
      // International address with no state set — only country remains
      expectRenderWithAddress(
        '<svg><text>{{$join ", " ($or ($lookup $declaration "applicant.address.streetLevelDetails.state") ($lookup $declaration "applicant.address.province")) ($lookup $declaration "applicant.address.country")}}</text></svg>',
        {
          addressType: AddressType.INTERNATIONAL,
          country: 'USA',
          streetLevelDetails: {}
        },
        '<svg><text>United States of America</text></svg>'
      )
    })
  })
  describe('fullAddress', () => {
    // fullAddress is a computed convenience field on ADDRESS certificate variables.
    // It joins admin levels most-specific-first, then country — empty values are filtered.
    //
    // Note on 'FAR' (Farajaland): FAR is only added to the countries list when
    // window.config.COUNTRY === 'FAR', which is set at runtime in dev and prod but
    // not in the test environment. So in tests, SelectCountry.stringify('FAR') returns ''
    // and gets filtered out. In dev/prod, it resolves to "Farajaland" and is included.
    function expectFullAddress(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      addressValue: Record<string, any>,
      output: string
    ) {
      const generator = testDataGenerator(2323)
      const registrar = generator.user.localRegistrar()
      const { declaration: _decl, ...metadata } = tennisClubMembershipEventIndex

      const result = compileSvg({
        templateString:
          '<svg><text>{{$lookup $declaration "applicant.address.fullAddress"}}</text></svg>',
        $metadata: {
          ...metadata,
          createdBy: registrar.v2.id,
          modifiedAt: new Date().toISOString(),
          copiesPrintedForTemplate: 2
        },
        $actions: tennisClubMembershipEventDocument.actions as ActionDocument[],
        $declaration: { 'applicant.address': addressValue },
        review: false,
        locations: V2_DEFAULT_MOCK_LOCATIONS_MAP,
        administrativeAreas: V2_DEFAULT_MOCK_ADMINISTRATIVE_AREAS_MAP,
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

    it('domestic: district + province (most-specific-first, country filtered when unresolved)', () => {
      // Ibombo (district) under Central (province) — FAR not in countries list in test env → filtered
      // In dev/prod: "Ibombo, Central, Farajaland"
      expectFullAddress(
        {
          addressType: AddressType.DOMESTIC,
          administrativeArea: '62a0ccb4-880d-4f30-8882-f256007dfff9' as UUID,
          country: 'FAR'
        },
        '<svg><text>Ibombo, Central</text></svg>'
      )
    })

    it('domestic: province only when no district present', () => {
      // Central has no parent → only province level resolved; FAR filtered in test env
      // In dev/prod: "Central, Farajaland"
      expectFullAddress(
        {
          addressType: AddressType.DOMESTIC,
          administrativeArea: 'a45b982a-5c7b-4bd9-8fd8-a42d0994054c' as UUID,
          country: 'FAR'
        },
        '<svg><text>Central</text></svg>'
      )
    })

    it('international: state + country', () => {
      // USA resolves to full English name via intl
      expectFullAddress(
        {
          addressType: AddressType.INTERNATIONAL,
          country: 'USA',
          streetLevelDetails: { state: 'California' }
        },
        '<svg><text>California, United States of America</text></svg>'
      )
    })

    it('international: country only when state is absent', () => {
      expectFullAddress(
        {
          addressType: AddressType.INTERNATIONAL,
          country: 'USA',
          streetLevelDetails: {}
        },
        '<svg><text>United States of America</text></svg>'
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
