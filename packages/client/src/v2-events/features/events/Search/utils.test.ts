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
/* eslint-disable max-lines */

import {
  EventStatus,
  QueryInputType,
  AdvancedSearchField,
  tennisClubMembershipEvent,
  PlainDate,
  FieldConfig,
  FieldType,
  AdministrativeAreas,
  AddressType,
  UUID,
  FieldGroup,
  AdministrativeAreaField
} from '@opencrvs/commons/client'
import { toVersionedLocation } from '@client/v2-events/VersionedLocation'
import { AdminStructureItem } from '@client/utils/referenceApi'
import {
  getMetadataFieldConfigs,
  buildSearchQuery,
  serializeSearchParams,
  deserializeSearchParams,
  buildQuickSearchQuery,
  resolveAdvancedSearchConfig,
  getAdvancedSearchFieldErrors,
  toAdvancedSearchQueryType,
  withSearchLocationBehaviour
} from './utils'

/** Farajaland's default admin levels, as the offline config supplies them. */
const ADMIN_STRUCTURE = [
  {
    id: 'province',
    label: { id: 'province', defaultMessage: 'Province', description: 'p' }
  },
  {
    id: 'district',
    label: { id: 'district', defaultMessage: 'District', description: 'd' }
  }
] as AdminStructureItem[]

describe('getAdvancedSearchFieldErrors', () => {
  it('should return no errors for empty values', () => {
    const mockFormValues = { 'applicant.dob': '3' }
    const sections = resolveAdvancedSearchConfig(
      tennisClubMembershipEvent,
      ADMIN_STRUCTURE
    )
    const errors = getAdvancedSearchFieldErrors(sections, mockFormValues, {})
    expect(errors).toEqual({
      'applicant.name': [],
      'recommender.name': [],
      'applicant.email': [],
      'applicant.dob': [
        {
          message: {
            defaultMessage: 'Invalid date field',
            description: 'Error message when date field is invalid',
            id: 'error.invalidDate'
          }
        }
      ],
      'event.legalStatuses.REGISTERED.acceptedAt': [],
      'event.legalStatuses.REGISTERED.createdAtLocation': [],
      'event.status': [],
      'event.updatedAt': []
    } satisfies ReturnType<typeof getAdvancedSearchFieldErrors>)
  })
})

describe('getDefaultSearchFields', () => {
  it('should generate default search field configurations for known field IDs', () => {
    const fields = getMetadataFieldConfigs(
      tennisClubMembershipEvent.advancedSearch[0].fields
    )
    const ids = fields.map((f) => f.id)
    expect(ids).toContain('event.legalStatuses.REGISTERED.createdAtLocation')
    expect(ids).toContain('event.legalStatuses.REGISTERED.acceptedAt')
    expect(ids).toContain('event.status')
    expect(ids).toContain('event.updatedAt')
  })
})

describe('buildDataCondition', () => {
  const fields = resolveAdvancedSearchConfig(
    tennisClubMembershipEvent,
    ADMIN_STRUCTURE
  ).flatMap((section) => section.fields)
  const searchConfigs = tennisClubMembershipEvent.advancedSearch.flatMap(
    (section) => section.fields
  )
  it('should return anyOf condition for status=ALL', () => {
    const state = { 'event.status': 'ALL' }
    const result = buildSearchQuery(
      state,
      fields,
      searchConfigs,
      tennisClubMembershipEvent
    )
    //@ts-ignore
    expect(result['event.status']).toEqual({
      type: 'anyOf',
      terms: [
        EventStatus.enum.CREATED,
        EventStatus.enum.NOTIFIED,
        EventStatus.enum.DECLARED,
        EventStatus.enum.REGISTERED,
        EventStatus.enum.ARCHIVED
      ]
    })
  })

  it('should generate exact match condition for trackingId', () => {
    const state = {
      'event.legalStatuses.REGISTERED.createdAtLocation': 'ABC123'
    }
    const result = buildSearchQuery(
      state,
      fields,
      searchConfigs,
      tennisClubMembershipEvent
    )
    expect(
      //@ts-ignore
      result['event.legalStatuses.REGISTERED.createdAtLocation']
    ).toEqual({
      type: 'exact',
      term: 'ABC123'
    })
  })

  it('should generate range match condition for DATE_RANGE fields when range is selected', () => {
    const state = {
      'applicant.dob': {
        start: PlainDate.parse('1996-01-01'),
        end: PlainDate.parse('1996-12-31')
      }
    }
    const result = buildSearchQuery(
      state,
      fields,
      searchConfigs,
      tennisClubMembershipEvent
    )
    expect(
      //@ts-ignore
      result['applicant.dob']
    ).toEqual({
      type: 'range',
      gte: '1996-01-01',
      lte: '1996-12-31'
    })
  })

  it('should generate range match condition for DATE_RANGE fields even if exact date is selected', () => {
    const state = {
      'applicant.dob': '1996-01-01'
    }
    const result = buildSearchQuery(
      state,
      fields,
      searchConfigs,
      tennisClubMembershipEvent
    )
    expect(
      //@ts-ignore
      result['applicant.dob']
    ).toEqual({
      type: 'range',
      gte: '1996-01-01',
      lte: '1996-01-01'
    })
  })
})

describe('serializeSearchParams and deserializeSearchParams (full roundtrip)', () => {
  const testObject = {
    str: 'hello',
    num: 123,
    bool: true,
    arrayPrimitives: ['x', 'y'],
    arrayObjects: [{ a: 1 }, { b: 2 }],
    plainObject: { foo: 'bar', count: 9 },
    emptyArray: [],
    nullVal: null,
    undefinedVal: undefined
  }

  const expectedDeserialized = {
    str: 'hello',
    num: '123', // everything comes in as string from URL
    bool: 'true',
    arrayPrimitives: ['x', 'y'],
    arrayObjects: [{ a: 1 }, { b: 2 }],
    plainObject: { foo: 'bar', count: 9 }
    // emptyArray is dropped
    // nullVal, undefinedVal are dropped
  }

  it('serializes correctly (match raw string)', () => {
    const output = serializeSearchParams(testObject)
    // Note: the order of parameters may vary, so we check the content instead.
    const expected =
      `arrayObjects=${encodeURIComponent(JSON.stringify({ a: 1 }))}` +
      `&arrayObjects=${encodeURIComponent(JSON.stringify({ b: 2 }))}` +
      '&arrayPrimitives=x&arrayPrimitives=y' +
      '&bool=true' +
      '&num=123' +
      `&plainObject=${encodeURIComponent(JSON.stringify({ foo: 'bar', count: 9 }))}` +
      '&str=hello'

    expect(output).toBe(expected)
  })

  it('deserializes correctly', () => {
    const serialized = serializeSearchParams(testObject)
    const deserialized = deserializeSearchParams(serialized)

    expect(deserialized).toEqual(expectedDeserialized)
  })

  it('roundtrip preserves data shape and content', () => {
    const serialized = serializeSearchParams(testObject)
    const roundtrip = deserializeSearchParams(serialized)

    expect(roundtrip).toEqual(expectedDeserialized)
  })
})

describe('buildQuickSearchQuery', () => {
  it('should build a quick search query', () => {
    const searchTerm = 'abcdefg'
    const resultQuery = buildQuickSearchQuery(searchTerm, [
      tennisClubMembershipEvent
    ])

    expect(resultQuery).toEqual({
      type: 'or',
      clauses: [
        {
          data: {
            'applicant.name': {
              type: 'fuzzy',
              term: 'abcdefg'
            }
          }
        },
        {
          data: {
            'applicant.email': {
              type: 'exact',
              term: 'abcdefg'
            }
          }
        },
        {
          data: {
            'recommender.name': {
              type: 'fuzzy',
              term: 'abcdefg'
            }
          }
        },
        {
          trackingId: {
            term: 'abcdefg',
            type: 'exact'
          }
        },
        {
          'legalStatuses.REGISTERED.registrationNumber': {
            term: 'abcdefg',
            type: 'exact'
          }
        }
      ]
    })
  })

  it('emails are searched only in email fields', () => {
    const searchTerm = 'abc@gmail.com'
    const resultQuery = buildQuickSearchQuery(searchTerm, [
      tennisClubMembershipEvent
    ])

    expect(resultQuery).toEqual({
      type: 'or',
      clauses: [
        {
          data: {
            'applicant.email': {
              type: 'exact',
              term: 'abc@gmail.com'
            }
          }
        }
      ]
    })
  })
})

describe('Nested Query Generation with searchFields', () => {
  it('creates OR clauses for fields with multiple searchFields', () => {
    const searchParams = {
      'person-name': 'Bob',
      'child.dob': '1985-01-01'
    }
    const searchFieldConfigs: AdvancedSearchField[] = [
      {
        fieldId: 'person-name',
        fieldType: 'field',
        type: 'NAME',
        config: {
          type: 'fuzzy',
          searchFields: [
            'child.name.firstname',
            'child.name.surname',
            'mother.name.firstname',
            'father.name.firstname'
          ]
        }
      },
      {
        fieldId: 'child.dob',
        fieldType: 'field',
        config: { type: 'exact' }
      }
    ]

    const result = toAdvancedSearchQueryType(
      searchParams as unknown as QueryInputType,
      searchFieldConfigs,
      'birth'
    )

    expect(result).toEqual({
      type: 'and',
      clauses: [
        {
          eventType: 'birth'
        },
        {
          type: 'or',
          clauses: [
            {
              data: { 'child.name.firstname': 'Bob' }
            },
            {
              data: { 'child.name.surname': 'Bob' }
            },
            {
              data: { 'mother.name.firstname': 'Bob' }
            },
            {
              data: { 'father.name.firstname': 'Bob' }
            }
          ]
        },
        {
          data: { 'child.dob': '1985-01-01' }
        }
      ]
    })
  })

  it('creates individual clauses for fields without searchFields', () => {
    const searchParams = {
      'child.name.firstname': 'Alice',
      'child.dob': '1990-01-01'
    }
    const searchFieldConfigs: AdvancedSearchField[] = [
      {
        fieldId: 'child.name.firstname',
        fieldType: 'field',
        config: { type: 'fuzzy' }
      },
      {
        fieldId: 'child.dob',
        fieldType: 'field',
        config: { type: 'exact' }
      }
    ]

    const result = toAdvancedSearchQueryType(
      searchParams as unknown as QueryInputType,
      searchFieldConfigs,
      'birth'
    )

    expect(result).toEqual({
      type: 'and',
      clauses: [
        {
          eventType: 'birth'
        },
        {
          data: { 'child.name.firstname': 'Alice' }
        },
        {
          data: { 'child.dob': '1990-01-01' }
        }
      ]
    })
  })

  it('handles single searchField as individual clause', () => {
    const searchParams = {
      'custom-field': 'test-value'
    }
    const searchFieldConfigs: AdvancedSearchField[] = [
      {
        fieldId: 'custom-field',
        fieldType: 'field',
        config: {
          type: 'exact',
          searchFields: ['mapped.database.field'] // Single field
        }
      }
    ]

    const result = toAdvancedSearchQueryType(
      searchParams as unknown as QueryInputType,
      searchFieldConfigs,
      'birth'
    )

    expect(result).toEqual({
      type: 'and',
      clauses: [
        {
          eventType: 'birth'
        },
        {
          type: 'or',
          clauses: [
            {
              data: { 'mapped.database.field': 'test-value' }
            }
          ]
        }
      ]
    })
  })

  it('handles metadata fields correctly', () => {
    const searchParams = {
      'event.trackingId': 'ABC123',
      'person-name': 'Bob'
    }

    const searchFieldConfigs: AdvancedSearchField[] = [
      {
        fieldId: 'event.trackingId',
        fieldType: 'event',
        config: { type: 'exact' }
      },
      {
        fieldId: 'person-name',
        fieldType: 'field',
        config: {
          type: 'fuzzy',
          searchFields: ['child.name.firstname', 'mother.name.firstname']
        }
      }
    ]

    const result = toAdvancedSearchQueryType(
      searchParams as unknown as QueryInputType,
      searchFieldConfigs,
      'birth'
    )

    expect(result).toEqual({
      type: 'and',
      clauses: [
        {
          trackingId: 'ABC123',
          eventType: 'birth'
        },
        {
          type: 'or',
          clauses: [
            {
              data: { 'child.name.firstname': 'Bob' }
            },
            {
              data: { 'mother.name.firstname': 'Bob' }
            }
          ]
        }
      ]
    })
  })

  it('handles complex multi-field scenario', () => {
    const searchParams = {
      'applicant-name': 'John',
      'contact-info': 'john@example.com',
      'event.status': 'REGISTERED',
      'birth.date': '1980-01-01'
    }

    const searchFieldConfigs: AdvancedSearchField[] = [
      {
        fieldId: 'applicant-name',
        fieldType: 'field',
        config: {
          type: 'fuzzy',
          searchFields: [
            'child.name.firstname',
            'child.name.surname',
            'informant.name.firstname',
            'informant.name.surname'
          ]
        }
      },
      {
        fieldId: 'contact-info',
        fieldType: 'field',
        config: {
          type: 'exact',
          searchFields: [
            'child.email',
            'informant.email',
            'child.phone',
            'informant.phone'
          ]
        }
      },
      {
        fieldId: 'event.status',
        fieldType: 'event',
        config: { type: 'exact' }
      },
      {
        fieldId: 'birth.date',
        fieldType: 'field',
        config: { type: 'exact' }
      }
    ]

    const result = toAdvancedSearchQueryType(
      searchParams as unknown as QueryInputType,
      searchFieldConfigs,
      'birth'
    )

    expect(result).toEqual({
      type: 'and',
      clauses: [
        {
          status: 'REGISTERED',
          eventType: 'birth'
        },
        {
          type: 'or',
          clauses: [
            {
              data: { 'child.name.firstname': 'John' }
            },
            {
              data: { 'child.name.surname': 'John' }
            },
            {
              data: { 'informant.name.firstname': 'John' }
            },
            {
              data: { 'informant.name.surname': 'John' }
            }
          ]
        },
        {
          type: 'or',
          clauses: [
            {
              data: { 'child.email': 'john@example.com' }
            },
            {
              data: { 'informant.email': 'john@example.com' }
            },
            {
              data: { 'child.phone': 'john@example.com' }
            },
            {
              data: { 'informant.phone': 'john@example.com' }
            }
          ]
        },
        {
          data: { 'birth.date': '1980-01-01' }
        }
      ]
    })
  })
})

describe('withSearchLocationBehaviour', () => {
  const label = {
    id: 'field.label',
    defaultMessage: 'Field',
    description: 'Field label'
  }

  const configOf = (field: FieldConfig) =>
    (field as { configuration?: Record<string, unknown> }).configuration

  it('keeps inactive locations listed for a location (office/health) field', () => {
    const field = {
      id: 'field',
      type: FieldType.LOCATION,
      label,
      configuration: { locationTypes: ['HEALTH_FACILITY'] }
    } as FieldConfig

    const result = withSearchLocationBehaviour(field, ADMIN_STRUCTURE)

    expect(configOf(result)).toMatchObject({
      locationTypes: ['HEALTH_FACILITY'],
      activeOnly: false,
      anchorToDateOfEvent: false
    })
  })

  it('overrides activeOnly and anchorToDateOfEvent for a location field even when the declaration field set them true', () => {
    const field = {
      id: 'field',
      type: FieldType.LOCATION,
      label,
      configuration: {
        locationTypes: ['HEALTH_FACILITY'],
        activeOnly: true,
        anchorToDateOfEvent: true
      }
    } as FieldConfig

    const result = withSearchLocationBehaviour(field, ADMIN_STRUCTURE)

    expect(configOf(result)).toMatchObject({
      activeOnly: false,
      anchorToDateOfEvent: false
    })
  })

  it('excludes inactive areas for an admin-structure field', () => {
    const field = {
      id: 'field',
      type: FieldType.ADMINISTRATIVE_AREA,
      label,
      configuration: { type: AdministrativeAreas.enum.ADMIN_STRUCTURE }
    } as FieldConfig

    const result = withSearchLocationBehaviour(field, ADMIN_STRUCTURE)

    expect(configOf(result)).toMatchObject({ activeOnly: true })
  })

  it('keeps inactive listed for a non-admin-structure admin-area field', () => {
    const field = {
      id: 'field',
      type: FieldType.ADMINISTRATIVE_AREA,
      label,
      configuration: { type: AdministrativeAreas.enum.HEALTH_FACILITY }
    } as FieldConfig

    const result = withSearchLocationBehaviour(field, ADMIN_STRUCTURE)

    expect(configOf(result)).toMatchObject({ activeOnly: false })
  })

  it('flattens an address field into a group with one field per level', () => {
    const field = {
      id: 'applicant.address',
      type: FieldType.ADDRESS,
      label,
      configuration: {}
    } as FieldConfig

    const result = withSearchLocationBehaviour(field, ADMIN_STRUCTURE)

    expect(result.type).toBe(FieldType.FIELD_GROUP)
    expect(result.id).toBe('applicant.address')

    const group = result as FieldGroup
    expect(group.fields.map((subfield) => subfield.id)).toEqual([
      'country',
      'province',
      'district'
    ])
    expect(
      group.fields
        .filter((subfield) => subfield.type === FieldType.ADMINISTRATIVE_AREA)
        .map((subfield) => configOf(subfield))
    ).toEqual([
      expect.objectContaining({ activeOnly: true }),
      expect.objectContaining({ activeOnly: true })
    ])
  })

  it("keeps an address group's level references as bare sibling ids", () => {
    const field = {
      id: 'applicant.address',
      type: FieldType.ADDRESS,
      label,
      configuration: {}
    } as FieldConfig

    const group = withSearchLocationBehaviour(
      field,
      ADMIN_STRUCTURE
    ) as FieldGroup
    const district = group.fields.find(
      (subfield) => subfield.id === 'district'
    ) as AdministrativeAreaField

    /*
     * The group supplies its own values as the scope its subfields resolve
     * against (@see GeneratedInputField's FIELD_GROUP branch), so a level refers
     * to its parent exactly as it does in a declaration form. That also keeps a
     * country's own street-field conditionals, which are written against bare
     * ids, working unchanged.
     */
    expect(district.configuration.partOf).toMatchObject({
      $$field: 'province',
      $$subfield: []
    })
  })

  it("carries an address field's scope-based default down to each level", () => {
    const field = {
      id: 'applicant.address',
      type: FieldType.ADDRESS,
      label,
      configuration: {},
      defaultValue: {
        country: 'FAR',
        addressType: AddressType.DOMESTIC,
        administrativeArea: { $userField: 'administrativeAreaId' }
      }
    } as FieldConfig

    const group = withSearchLocationBehaviour(
      field,
      ADMIN_STRUCTURE
    ) as FieldGroup

    /*
     * An ADDRESS holds one administrative area, and the form fills the chain
     * above it. A group has a field per level, so the default is restated as
     * one `$location` lookup per level against the same user attribute.
     */
    expect(
      group.fields.map((subfield) => [
        subfield.id,
        (subfield as { defaultValue?: unknown }).defaultValue
      ])
    ).toEqual([
      ['country', 'FAR'],
      [
        'province',
        { $userField: 'administrativeAreaId', $location: 'province' }
      ],
      [
        'district',
        { $userField: 'administrativeAreaId', $location: 'district' }
      ]
    ])
  })

  it('leaves a group without defaults when the address has none', () => {
    const field = {
      id: 'applicant.address',
      type: FieldType.ADDRESS,
      label,
      configuration: {}
    } as FieldConfig

    const group = withSearchLocationBehaviour(
      field,
      ADMIN_STRUCTURE
    ) as FieldGroup

    expect(
      group.fields.every(
        (subfield) =>
          (subfield as { defaultValue?: unknown }).defaultValue === undefined
      )
    ).toBe(true)
  })

  it('leaves non-location fields untouched', () => {
    const field = {
      id: 'field',
      type: FieldType.TEXT,
      label
    } as FieldConfig

    const result = withSearchLocationBehaviour(field, ADMIN_STRUCTURE)

    expect(result).toEqual(field)
  })
})

describe('buildSearchQuery with version-pinned locations', () => {
  const label = {
    id: 'field.label',
    defaultMessage: 'Field',
    description: 'Field label'
  }

  const OFFICE_ID = UUID.parse('11111111-1111-4111-8111-111111111111')
  const OFFICE_VERSION_ID = UUID.parse('11111111-1111-4111-8111-1111111111aa')
  const PROVINCE_ID = UUID.parse('22222222-2222-4222-8222-222222222222')
  const PROVINCE_VERSION_ID = UUID.parse('22222222-2222-4222-8222-2222222222aa')
  const DISTRICT_ID = UUID.parse('33333333-3333-4333-8333-333333333333')
  const DISTRICT_VERSION_ID = UUID.parse('33333333-3333-4333-8333-3333333333aa')

  const locationField = {
    id: 'applicant.office',
    type: FieldType.LOCATION,
    label
  } as FieldConfig

  const addressField = {
    id: 'applicant.address',
    type: FieldType.ADDRESS,
    label,
    configuration: {}
  } as FieldConfig

  // The search form renders the address filter as a group, one entry per level.
  const addressGroup = withSearchLocationBehaviour(
    addressField,
    ADMIN_STRUCTURE
  )

  const eventConfig = {
    ...tennisClubMembershipEvent,
    declaration: {
      ...tennisClubMembershipEvent.declaration,
      pages: [
        {
          ...tennisClubMembershipEvent.declaration.pages[0],
          fields: [locationField, addressField]
        }
      ]
    }
  } as typeof tennisClubMembershipEvent

  const searchConfigs = [
    {
      fieldId: 'applicant.office',
      fieldType: 'field',
      label,
      config: { type: 'exact' }
    },
    {
      fieldId: 'applicant.address',
      fieldType: 'field',
      label,
      config: { type: 'exact' }
    }
  ] as unknown as AdvancedSearchField[]

  it('queries a pinned location by its id, never by the version', () => {
    const result = buildSearchQuery(
      {
        'applicant.office': toVersionedLocation(OFFICE_ID, OFFICE_VERSION_ID)
      },
      [locationField],
      searchConfigs,
      eventConfig
    )

    expect(result).toEqual({
      'applicant.office': { type: 'exact', term: OFFICE_ID }
    })
    expect(JSON.stringify(result)).not.toContain(OFFICE_VERSION_ID)
  })

  // The app's own country, as the test environment configures it — an address
  // in it is domestic, and only a domestic address carries admin levels.
  const HOME_COUNTRY = window.config.COUNTRY

  it('folds a pinned address group into the leaf area id, never the versions', () => {
    const result = buildSearchQuery(
      {
        'applicant.address': {
          country: HOME_COUNTRY,
          province: toVersionedLocation(PROVINCE_ID, PROVINCE_VERSION_ID),
          district: toVersionedLocation(DISTRICT_ID, DISTRICT_VERSION_ID)
        }
      },
      [addressGroup],
      searchConfigs,
      eventConfig
    )

    expect(result).toEqual({
      'applicant.address': {
        type: 'exact',
        term: JSON.stringify({
          country: HOME_COUNTRY,
          addressType: AddressType.DOMESTIC,
          administrativeArea: DISTRICT_ID,
          streetLevelDetails: {}
        })
      }
    })
    expect(JSON.stringify(result)).not.toContain(PROVINCE_VERSION_ID)
    expect(JSON.stringify(result)).not.toContain(DISTRICT_VERSION_ID)
  })

  it('takes the deepest level filled in as the leaf', () => {
    const result = buildSearchQuery(
      {
        'applicant.address': {
          country: HOME_COUNTRY,
          province: toVersionedLocation(PROVINCE_ID, PROVINCE_VERSION_ID)
        }
      },
      [addressGroup],
      searchConfigs,
      eventConfig
    )

    expect(result).toEqual({
      'applicant.address': {
        type: 'exact',
        term: JSON.stringify({
          country: HOME_COUNTRY,
          addressType: AddressType.DOMESTIC,
          administrativeArea: PROVINCE_ID,
          streetLevelDetails: {}
        })
      }
    })
  })

  it('queries an unpinned address group exactly as a declaration address would', () => {
    const result = buildSearchQuery(
      {
        'applicant.address': {
          country: HOME_COUNTRY,
          province: PROVINCE_ID,
          district: DISTRICT_ID
        }
      },
      [addressGroup],
      searchConfigs,
      eventConfig
    )

    expect(result).toEqual({
      'applicant.address': {
        type: 'exact',
        term: JSON.stringify({
          country: HOME_COUNTRY,
          addressType: AddressType.DOMESTIC,
          administrativeArea: DISTRICT_ID,
          streetLevelDetails: {}
        })
      }
    })
  })

  it('keeps a foreign address international, dropping admin levels but not street details', () => {
    const result = buildSearchQuery(
      {
        'applicant.address': {
          country: 'NZL',
          // An admin level is meaningless abroad, a street detail is not.
          province: PROVINCE_ID,
          addressLine1: '12 Cuba Street'
        }
      },
      [addressGroup],
      searchConfigs,
      eventConfig
    )

    expect(result).toEqual({
      'applicant.address': {
        type: 'exact',
        term: JSON.stringify({
          country: 'NZL',
          addressType: AddressType.INTERNATIONAL,
          streetLevelDetails: { addressLine1: '12 Cuba Street' }
        })
      }
    })
  })
})
