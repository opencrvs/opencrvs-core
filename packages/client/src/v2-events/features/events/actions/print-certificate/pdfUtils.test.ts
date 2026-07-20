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
  UUID,
  V2_DEFAULT_MOCK_ADMINISTRATIVE_AREAS_MAP,
  V2_DEFAULT_MOCK_LOCATIONS,
  V2_DEFAULT_MOCK_LOCATIONS_MAP
} from '@opencrvs/commons/client'
import { testDataGenerator } from '@client/tests/test-data-generators'
import { toFileUrl } from '@client/v2-events/cache'
import {
  tennisClubMembershipEventDocument,
  tennisClubMembershipEventIndex
} from '../../fixtures'

import {
  svgToPdfTemplate,
  stringifyEventMetadata,
  compileSvg,
  isFetchableHref
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

describe('isFetchableHref', () => {
  test.each([
    ['https://example.com/logo.png', true],
    ['http://minio.example.com/passport.jpg', true],
    ['/users/abc123/signature.png', true],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [toFileUrl('users/abc123/signature.png' as any), true],
    ['data:image/png;base64,ABC123', false],
    ['blob:http://localhost/abc', false],
    ['users/abc123/signature.png', false]
  ])('%s → %s', (href, expected) => {
    expect(isFetchableHref(href)).toBe(expected)
  })
})

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

describe('stringifyEventMetadata — versioned offices (per-fact anchors)', () => {
  // One office, renamed on 2008-06-01.
  const OFFICE_ID = '11111111-1111-4111-8111-111111111111' as UUID
  const RENAME_VERSION_ID = '22222222-2222-4222-8222-222222222222' as UUID

  const versionedLocations = new Map([
    [
      OFFICE_ID,
      {
        id: OFFICE_ID,
        administrativeAreaId: null,
        locationType: 'CRVS_OFFICE',
        versions: [
          {
            versionId: OFFICE_ID,
            effectiveFrom: '0001-01-01',
            name: 'Alaminos Registry',
            externalId: null,
            status: 'active' as const
          },
          {
            versionId: RENAME_VERSION_ID,
            effectiveFrom: '2008-06-01',
            name: 'Alaminos City Registry Office',
            externalId: null,
            status: 'active' as const
          }
        ]
      }
    ]
  ])

  function stringifyWithOffice(recordCreatedAt: string, registeredAt: string) {
    const generator = testDataGenerator()
    const { declaration, ...metadata } = eventQueryDataGenerator({
      createdBy: generator.user.id.localRegistrar,
      createdByUserType: 'user',
      createdAt: recordCreatedAt,
      createdAtLocation: OFFICE_ID,
      updatedAtLocation: OFFICE_ID,
      updatedAt: recordCreatedAt,
      updatedBy: generator.user.id.localRegistrar,
      legalStatuses: {
        REGISTERED: {
          createdAt: registeredAt,
          acceptedAt: registeredAt,
          createdBy: generator.user.id.localRegistrar,
          createdByRole: 'LOCAL_REGISTRAR',
          createdAtLocation: OFFICE_ID,
          registrationNumber: '2010000001'
        }
      }
    })

    return stringifyEventMetadata({
      metadata: {
        ...metadata,
        modifiedAt: recordCreatedAt,
        copiesPrintedForTemplate: 1
      },
      locations: versionedLocations,
      administrativeAreas: new Map(),
      users: [generator.user.localRegistrar().v2],
      intl: createIntl({ locale: 'en' }),
      adminLevels
    })
  }

  it('renders the registered-at office under its name as of the registration date', () => {
    // Registered in 2010, after the 2008 rename → the new name.
    const stringified = stringifyWithOffice(
      new Date('2004-01-01').toISOString(),
      new Date('2010-03-01').toISOString()
    )
    expect(
      stringified.legalStatuses.REGISTERED?.createdAtLocation
    ).toMatchObject({ name: 'Alaminos City Registry Office' })
  })

  it('resolves the same office to different names per fact — record creation vs registration', () => {
    // The record was created in 2004 (before the rename) and registered in 2010
    // (after it). The same office therefore carries its old name where the
    // record-creation fact is rendered and its new name at registration.
    const stringified = stringifyWithOffice(
      new Date('2004-01-01').toISOString(),
      new Date('2010-03-01').toISOString()
    )
    expect(stringified.createdAtLocation).toMatchObject({
      name: 'Alaminos Registry'
    })
    expect(
      stringified.legalStatuses.REGISTERED?.createdAtLocation
    ).toMatchObject({ name: 'Alaminos City Registry Office' })
  })
})

describe('compileSvg — versioned place of event', () => {
  // A province renamed on 2005-03-28: Alaminos → Alaminos City.
  const PROVINCE_ID = '33333333-3333-4333-8333-333333333333' as UUID
  const RENAME_VERSION_ID = '44444444-4444-4444-8444-444444444444' as UUID

  const versionedAreas = new Map([
    [
      PROVINCE_ID,
      {
        id: PROVINCE_ID,
        parentId: null,
        versions: [
          {
            versionId: PROVINCE_ID,
            effectiveFrom: '0001-01-01',
            name: 'Alaminos',
            externalId: null,
            status: 'active' as const
          },
          {
            versionId: RENAME_VERSION_ID,
            effectiveFrom: '2005-03-28',
            name: 'Alaminos City',
            externalId: null,
            status: 'active' as const
          }
        ]
      }
    ]
  ])

  function renderPlaceOfEventAt(dateOfEvent: string) {
    const generator = testDataGenerator(2323)
    const registrar = generator.user.localRegistrar()
    const { declaration: _decl, ...metadata } = tennisClubMembershipEventIndex

    return compileSvg({
      templateString:
        '<svg><text>{{$lookup $declaration "applicant.address.province"}}</text></svg>',
      $metadata: {
        ...metadata,
        dateOfEvent,
        createdBy: registrar.v2.id,
        modifiedAt: new Date().toISOString(),
        copiesPrintedForTemplate: 1
      },
      $actions: tennisClubMembershipEventDocument.actions as ActionDocument[],
      $declaration: {
        'applicant.address': {
          addressType: AddressType.DOMESTIC,
          administrativeArea: PROVINCE_ID,
          country: 'FAR'
        }
      },
      review: false,
      locations: new Map(),
      administrativeAreas: versionedAreas,
      users: [registrar.v2],
      language: { lang: 'en', messages: {} },
      config: tennisClubMembershipEvent,
      adminLevels
    })
  }

  it('renders the name valid at the event date, not today, for a pre-rename event', () => {
    // A 1995 event under a province not renamed until 2005 → the old name.
    expect(renderPlaceOfEventAt('1995-05-20')).toBe(
      '<svg><text>Alaminos</text></svg>'
    )
  })

  it('renders the later name when the event date is after the rename', () => {
    expect(renderPlaceOfEventAt('2021-01-01')).toBe(
      '<svg><text>Alaminos City</text></svg>'
    )
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

  test('replaces service-worker-cached path with base64 data', async () => {
    const mockFiles = ['data:image/png;base64,CACHED_SIGNATURE']

    fetch.mockResolvedValue({
      blob: async () =>
        Promise.resolve(new Blob(['fake-sig'], { type: 'image/png' }))
    } as Response)

    global.FileReader = vi.fn(() => {
      const mockFileReader = {
        readAsDataURL: vi.fn(),
        result: mockFiles.shift(),
        onload: null as null | (() => void),
        onerror: null
      }
      setTimeout(() => {
        if (mockFileReader.onload) {
          mockFileReader.onload()
        }
      }, 0)
      return mockFileReader
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }) as any

    const svgString = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><image xlink:href="/users/abc123/signature.png" x="0" y="0" width="140" height="70"/></svg>`

    const result = await svgToPdfTemplate(svgString, {})
    const [content] = result.definition.content as [ContentSvg]

    expect(fetch).toHaveBeenCalledWith('/users/abc123/signature.png')
    expect(content.svg).toContain(
      'xlink:href="data:image/png;base64,CACHED_SIGNATURE"'
    )
  })

  test('leaves already-embedded data URIs untouched', async () => {
    fetch.mockClear()

    const svgString = `<svg xmlns="http://www.w3.org/2000/svg"><image href="data:image/png;base64,ALREADY_EMBEDDED" x="0" y="0" width="140" height="70"/></svg>`

    const result = await svgToPdfTemplate(svgString, {})
    const [content] = result.definition.content as [ContentSvg]

    expect(fetch).not.toHaveBeenCalled()
    expect(content.svg).toContain(
      'href="data:image/png;base64,ALREADY_EMBEDDED"'
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
    it('renders empty when the looked-up action does not exist on the event', () => {
      expectRenderOutput(
        '<svg><text>{{ $lookup ($action "ARCHIVE") "annotation.book-number" }}</text></svg>',
        '<svg><text></text></svg>'
      )
    })
    it('treats a lookup on a missing action as undefined in conditionals', () => {
      expectRenderOutput(
        '<svg>{{#ifCond ($lookup ($action "ARCHIVE") "annotation.book-number") "!==" undefined}}<text>book</text>{{/ifCond}}</svg>',
        '<svg></svg>'
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
  describe('administrativeHierarchy', () => {
    // administrativeHierarchy is a computed convenience field on ADDRESS certificate variables.
    // DOMESTIC: admin levels joined most-specific-first, then country.
    // INTERNATIONAL: country only (streetLevelDetails is country-specific and not assumed).
    //
    // Note on 'FAR' (Farajaland): FAR is only added to the countries list when
    // window.config.COUNTRY === 'FAR', which is set at runtime in dev and prod but
    // not in the test environment. So in tests, SelectCountry.stringify('FAR') returns ''
    // and gets filtered out. In dev/prod, it resolves to "Farajaland" and is included.
    function expectAdministrativeHierarchy(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      addressValue: Record<string, any>,
      output: string
    ) {
      const generator = testDataGenerator(2323)
      const registrar = generator.user.localRegistrar()
      const { declaration: _decl, ...metadata } = tennisClubMembershipEventIndex

      const result = compileSvg({
        templateString:
          '<svg><text>{{$lookup $declaration "applicant.address.administrativeHierarchy"}}</text></svg>',
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
      expectAdministrativeHierarchy(
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
      expectAdministrativeHierarchy(
        {
          addressType: AddressType.DOMESTIC,
          administrativeArea: 'a45b982a-5c7b-4bd9-8fd8-a42d0994054c' as UUID,
          country: 'FAR'
        },
        '<svg><text>Central</text></svg>'
      )
    })

    it('international: country only (streetLevelDetails is country-specific, not assumed)', () => {
      // USA resolves to full English name via intl; state is ignored regardless
      expectAdministrativeHierarchy(
        {
          addressType: AddressType.INTERNATIONAL,
          country: 'USA',
          streetLevelDetails: { state: 'California' }
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

  describe('Signatures', () => {
    it('renders user signatures through action objects when $action is combined with $lookup', () => {
      expectRenderOutput(
        `<svg><text>{{$lookup ($action 'REGISTER') 'createdBySignature'}}</text></svg>`,
        '<svg><text>/aa13a268-ae48-4a30-9450-554aebaab203/signature.png</text></svg>'
      )
    })
  })
})
