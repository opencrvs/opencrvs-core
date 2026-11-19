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
  DeduplicationConfig,
  getUUID,
  UUID,
  FieldValue,
  eventQueryDataGenerator,
  Clause,
  getDeclarationFields,
  FieldType,
  getEventConfigForRecord,
  PlainDate,
  toVersionedEventConfig,
  withDeclarationField
} from '@opencrvs/commons'
import { ChildOnboardingEvent } from '@opencrvs/commons/fixtures'
import { field, and, or, not } from '@opencrvs/commons/events/deduplication'
import { getOrCreateClient } from '@events/storage/elasticsearch'
import { getEventIndexName } from '@events/storage/__mocks__/elasticsearch'
import {
  declarationReference,
  encodeEventIndex,
  encodeFieldId
} from '@events/service/indexing/utils'
import { createEventIndex } from '@events/tests/createEventIndex'
import {
  generateElasticsearchQuery,
  searchForDuplicates
} from './deduplication'

const similarNamedChild = field('child.name').fuzzyMatches()
const childDobWithin5Days = field('child.dob').dateRangeMatches({ days: 5 })
const similarNamedMother = field('mother.name').fuzzyMatches()
const similarAgedMother = or(
  field('mother.dob').dateRangeMatches({
    days: 365
  }),
  field('mother.age').dateRangeMatches({
    days: 365
  }),
  field('mother.dob').dateRangeMatches({
    days: 365,
    matchAgainst: 'mother.age'
  }),
  field('mother.age').dateRangeMatches({
    days: 365,
    matchAgainst: 'mother.dob'
  })
)
const differentMotherIdTypes = not(field('mother.idType').strictMatches())
const motherIdNotProvided = field('mother.idType').strictMatches({
  value: 'NONE'
})
const sameMotherNid = field('mother.nid').strictMatches()
const sameMotherPassport = field('mother.passport').strictMatches()
const motherIdMatchesIfGiven = or(
  differentMotherIdTypes,
  motherIdNotProvided,
  sameMotherNid,
  sameMotherPassport
)
const childDobWithin9Months = field('child.dob').dateRangeMatches({
  days: 270
})
const childDobWithin3Years = field('child.dob').dateRangeMatches({
  days: 1095
})
const exactNamedChild = field('child.name').strictMatches()

const LEGACY_BIRTH_DEDUPLICATION_RULES = {
  id: 'Legacy birth deduplication check',
  label: {
    id: 'deduplication.legacy',
    defaultMessage: 'Legacy birth deduplication check',
    description: 'Legacy birth deduplication check'
  },
  query: or(
    and(
      similarNamedChild,
      childDobWithin5Days,
      similarNamedMother,
      similarAgedMother,
      motherIdMatchesIfGiven
    ),
    and(
      similarNamedMother,
      similarAgedMother,
      motherIdMatchesIfGiven,
      childDobWithin9Months
    ),
    and(
      exactNamedChild,
      childDobWithin3Years,
      similarNamedMother,
      similarAgedMother,
      motherIdMatchesIfGiven
    )
  )
}

async function findDuplicates(eventComparison: Record<string, FieldValue[]>) {
  const esClient = getOrCreateClient()
  const existingEvent = Object.fromEntries(
    Object.entries(eventComparison).map(([key, values]) => [key, values[0]])
  )
  const newEvent = Object.fromEntries(
    Object.entries(eventComparison).map(([key, values]) => [key, values[1]])
  )

  const id = getUUID()

  await esClient.update({
    index: getEventIndexName(ChildOnboardingEvent.id),
    id,
    body: {
      doc: encodeEventIndex(
        eventQueryDataGenerator(
          {
            id,
            declaration: existingEvent
          },
          73
        ),
        ChildOnboardingEvent
      ),
      doc_as_upsert: true
    },
    refresh: 'wait_for'
  })

  const results = await searchForDuplicates({
    eventIndex: eventQueryDataGenerator(
      { declaration: newEvent, type: ChildOnboardingEvent.id },
      37
    ),
    deduplication: DeduplicationConfig.parse(LEGACY_BIRTH_DEDUPLICATION_RULES),
    versionedConfig: toVersionedEventConfig(ChildOnboardingEvent),
    today: '2025-01-01' as PlainDate
  })

  return results
}

beforeEach(async () => {
  return createEventIndex(
    ChildOnboardingEvent.id,
    getDeclarationFields(ChildOnboardingEvent)
  )
})

describe('deduplication query input conversion', () => {
  it('should convert similar child name to fuzzy query', () => {
    const encodedEventIndex = encodeEventIndex(
      eventQueryDataGenerator({
        type: ChildOnboardingEvent.id,
        declaration: {
          'child.name': { firstname: 'John', surname: 'Smith' }
        }
      }),
      ChildOnboardingEvent
    )
    expect(
      generateElasticsearchQuery(
        encodedEventIndex,
        Clause.parse(similarNamedChild),
        [ChildOnboardingEvent]
      )
    ).toMatchSnapshot()
  })

  it('should convert childDobWithin5Days to dateRange query', () => {
    const encodedEventIndex = encodeEventIndex(
      eventQueryDataGenerator({
        type: ChildOnboardingEvent.id,
        declaration: {
          'child.dob': '2011-11-11'
        }
      }),
      ChildOnboardingEvent
    )
    expect(
      generateElasticsearchQuery(
        encodedEventIndex,
        Clause.parse(childDobWithin5Days),
        [ChildOnboardingEvent]
      )
    ).toMatchSnapshot()
  })

  it('should convert similarNamedMother to fuzzy query', () => {
    const encodedEventIndex = encodeEventIndex(
      eventQueryDataGenerator({
        type: ChildOnboardingEvent.id,
        declaration: {
          'mother.name': { firstname: 'Janet', surname: 'Smith' }
        }
      }),
      ChildOnboardingEvent
    )
    expect(
      generateElasticsearchQuery(
        encodedEventIndex,
        Clause.parse(similarNamedMother),
        [ChildOnboardingEvent]
      )
    ).toMatchSnapshot()
  })

  it('should convert similarAgedMother to dateRange query when dob present', () => {
    const encodedEventIndex = encodeEventIndex(
      eventQueryDataGenerator({
        type: ChildOnboardingEvent.id,
        declaration: {
          'mother.dob': '1999-11-11'
        }
      }),
      ChildOnboardingEvent
    )
    expect(
      generateElasticsearchQuery(
        encodedEventIndex,
        Clause.parse(similarAgedMother),
        [ChildOnboardingEvent]
      )
    ).toMatchSnapshot()
  })

  describe('should convert similarAgedMother to dateRange query when age present', () => {
    it('with reference date present', () => {
      const encodedEventIndex = encodeEventIndex(
        eventQueryDataGenerator({
          type: ChildOnboardingEvent.id,
          declaration: {
            'child.dob': '2020-11-11',
            'mother.age': { age: 19, asOfDateRef: 'child.dob' }
          }
        }),
        ChildOnboardingEvent
      )
      expect(
        generateElasticsearchQuery(
          encodedEventIndex,
          Clause.parse(similarAgedMother),
          [ChildOnboardingEvent]
        )
      ).toMatchSnapshot()
    })

    it('with reference date absent', () => {
      const encodedEventIndex = encodeEventIndex(
        eventQueryDataGenerator({
          type: ChildOnboardingEvent.id,
          declaration: {
            'mother.age': { age: 11, asOfDateRef: 'child.dob' }
          }
        }),
        ChildOnboardingEvent
      )
      expect(
        generateElasticsearchQuery(
          encodedEventIndex,
          Clause.parse(similarAgedMother),
          [ChildOnboardingEvent]
        )
      ).toMatchSnapshot()
    })
  })

  it('should convert motherIdMatchesIfGiven to strict query', () => {
    const encodedEventIndex = encodeEventIndex(
      eventQueryDataGenerator({
        declaration: {
          'mother.idType': 'NID',
          'mother.nid': '1232314352'
        },
        type: ChildOnboardingEvent.id
      }),
      ChildOnboardingEvent
    )
    expect(
      generateElasticsearchQuery(
        encodedEventIndex,
        Clause.parse(motherIdMatchesIfGiven),
        [ChildOnboardingEvent]
      )
    ).toMatchSnapshot()
  })

  it('should convert exactNamedChild to strict query', () => {
    const encodedEventIndex = encodeEventIndex(
      eventQueryDataGenerator({
        declaration: {
          'child.name': { firstname: 'John', surname: 'Smith' }
        },
        type: ChildOnboardingEvent.id
      }),
      ChildOnboardingEvent
    )
    expect(
      generateElasticsearchQuery(
        encodedEventIndex,
        Clause.parse(exactNamedChild),
        [ChildOnboardingEvent]
      )
    ).toMatchSnapshot()
  })
})

/*
 * @todo
 * The current implementation will flag quite a few false positives
 * for incomplete data. A minimum thresold for relevance score needs
 * to be implemented to avoid this.
 */
describe('deduplication tests', () => {
  it('does not find duplicates with completely different details', async () => {
    await expect(
      findDuplicates({
        'child.name': [
          { firstname: 'John', surname: 'Smith' },
          { firstname: 'Riku', surname: 'Rouvila' }
        ],
        'child.dob': ['2011-11-11', '2000-10-13'],
        'mother.name': [
          { firstname: 'Mother', surname: 'Smith' },
          { firstname: 'Sofia', surname: 'Matthews' }
        ],
        'mother.dob': ['2000-11-11', '1980-09-02'],
        'mother.nid': ['23412387', '8653434']
      })
    ).resolves.toStrictEqual([])
  })
  it('does not find duplicates with the same event id', async () => {
    const esClient = getOrCreateClient()

    const declarationOverrides = {
      'child.name': { firstname: 'John', surname: 'Smith' },
      'child.dob': '2011-11-11',
      'mother.name': { firstname: 'Mother', surname: 'Smith' },
      'mother.dob': '2000-11-11',
      'mother.nid': '23412387'
    }

    const event = eventQueryDataGenerator({
      id: '123-123-123-123' as UUID,
      declaration: declarationOverrides
    })

    await esClient.update({
      index: getEventIndexName(ChildOnboardingEvent.id),
      id: event.id,
      body: {
        doc: encodeEventIndex(event, ChildOnboardingEvent),
        doc_as_upsert: true
      },
      refresh: 'wait_for'
    })

    const duplicateEvent = eventQueryDataGenerator({
      declaration: declarationOverrides,
      type: ChildOnboardingEvent.id
    })

    const matchResultForDuplicateEvent = await searchForDuplicates({
      eventIndex: duplicateEvent,
      deduplication: DeduplicationConfig.parse(
        LEGACY_BIRTH_DEDUPLICATION_RULES
      ),
      versionedConfig: toVersionedEventConfig(ChildOnboardingEvent),
      today: '2025-01-01' as PlainDate
    })
    expect(matchResultForDuplicateEvent).toHaveLength(1)

    const duplicateEventWithSameId = eventQueryDataGenerator({
      id: '123-123-123-123' as UUID,
      type: ChildOnboardingEvent.id,
      declaration: declarationOverrides
    })

    const matchResultForEventWithSameId = await searchForDuplicates({
      eventIndex: duplicateEventWithSameId,
      deduplication: DeduplicationConfig.parse(
        LEGACY_BIRTH_DEDUPLICATION_RULES
      ),
      versionedConfig: toVersionedEventConfig(ChildOnboardingEvent),
      today: '2025-01-01' as PlainDate
    })
    expect(matchResultForEventWithSameId).toHaveLength(0)
  })
  it('finds a duplicate that has a field that the config of the new record does not have', async () => {
    // e.g. a record of another version, with a field that the new version removed
    const esClient = getOrCreateClient()

    const declarationOverrides = {
      'child.name': { firstname: 'John', surname: 'Smith' },
      'child.dob': '2011-11-11',
      'mother.name': { firstname: 'Mother', surname: 'Smith' },
      'mother.dob': '2000-11-11',
      'mother.nid': '23412387'
    }

    const existing = eventQueryDataGenerator(
      { declaration: declarationOverrides },
      73
    )
    const encoded = encodeEventIndex(existing, ChildOnboardingEvent)

    await esClient.update({
      index: getEventIndexName(ChildOnboardingEvent.id),
      id: existing.id,
      body: {
        doc: {
          ...encoded,
          declaration: {
            ...encoded.declaration,
            [encodeFieldId('mother.maritalStatus')]: 'MARRIED'
          }
        },
        doc_as_upsert: true
      },
      refresh: 'wait_for'
    })

    const newRecord = eventQueryDataGenerator(
      { declaration: declarationOverrides, type: ChildOnboardingEvent.id },
      37
    )

    const matches = await searchForDuplicates({
      eventIndex: newRecord,
      deduplication: DeduplicationConfig.parse(
        LEGACY_BIRTH_DEDUPLICATION_RULES
      ),
      versionedConfig: toVersionedEventConfig(ChildOnboardingEvent),
      today: '2025-01-01' as PlainDate
    })
    expect(matches).toHaveLength(1)
    expect(matches[0].event.declaration['mother.maritalStatus']).toBe('MARRIED')
  })

  it('finds a duplicate with very similar details', async () => {
    await expect(
      findDuplicates({
        // Similar child's firstname(s)
        'child.name': [
          { firstname: 'John', surname: 'Smith' },
          { firstname: 'John', surname: 'Smith' }
        ],
        // Date of birth within 5 days
        'child.dob': ['2011-11-11', '2011-11-11'],
        // Similar Mother’s firstname(s)
        'mother.name': [
          { firstname: 'Mother', surname: 'Smith' },
          { firstname: 'Mothera', surname: 'Smith' }
        ],
        // Similar Mother’s date of birth or Same Age of mother
        'mother.dob': ['2000-11-11', '2000-11-12'],
        // Same mother’s NID
        'mother.nid': ['23412387', '23412387']
      })
    ).resolves.toHaveLength(1)
  })

  it('finds no duplicate with different mother nid', async () => {
    await expect(
      findDuplicates({
        'child.name': [
          { firstname: 'John', surname: 'Smith' },
          { firstname: 'John', surname: 'Smith' }
        ],
        'child.dob': ['2011-11-11', '2011-11-11'],
        'mother.name': [
          { firstname: 'Mother', surname: 'Smith' },
          { firstname: 'Mother', surname: 'Smith' }
        ],
        'mother.dob': ['2000-11-12', '2000-11-12'],
        // Different mother’s NID
        'mother.nid': ['23412387', '23412388']
      })
    ).resolves.toHaveLength(0)
  })

  it('finds no duplicates with very different details', async () => {
    await expect(
      findDuplicates({
        'child.name': [
          { firstname: 'John', surname: 'Smith' },
          { firstname: 'Mathew', surname: 'Wilson' }
        ],
        'child.dob': ['2011-11-11', '1980-11-11'],
        'mother.name': [
          { firstname: 'Mother', surname: 'Smith' },
          { firstname: 'Harriet', surname: 'Wilson' }
        ],
        'mother.dob': ['2000-11-12', '1992-11-12'],
        'mother.nid': ['23412387', '123123']
      })
    ).resolves.toHaveLength(0)
  })

  it('finds a duplicate even if the firstname of child is not given', async () => {
    await expect(
      findDuplicates({
        'child.name': [
          { firstname: 'John', surname: 'Smith' },
          { firstname: '', surname: 'Smiht' }
        ],
        'child.dob': ['2011-11-11', '2011-11-01'],
        'mother.name': [
          { firstname: 'Mother', surname: 'Smith' },
          { firstname: 'Mother', surname: 'Smith' }
        ],
        'mother.dob': ['2000-11-12', '2000-11-12'],
        'mother.nid': ['23412387', '23412387']
      })
    ).resolves.toHaveLength(1)
  })

  it('finds a duplicate if mother id types are different', async () => {
    await expect(
      findDuplicates({
        'child.name': [
          { firstname: 'John', surname: 'Smith' },
          { firstname: 'John', surname: 'Smith' }
        ],
        'child.dob': ['2011-11-11', '2011-11-11'],
        'mother.name': [
          { firstname: 'Mother', surname: 'Smith' },
          { firstname: 'Mothera', surname: 'Smith' }
        ],
        'mother.dob': ['2000-11-11', '2000-11-12'],
        'mother.idType': ['NID', 'PASSPORT']
      })
    ).resolves.toHaveLength(1)
  })

  it('finds a duplicate if both of the records do not have mother id', async () => {
    await expect(
      findDuplicates({
        'child.name': [
          { firstname: 'John', surname: 'Smith' },
          { firstname: 'John', surname: 'Smith' }
        ],
        'child.dob': ['2011-11-11', '2011-11-11'],
        'mother.name': [
          { firstname: 'Mother', surname: 'Smith' },
          { firstname: 'Mothera', surname: 'Smith' }
        ],
        'mother.dob': ['2000-11-11', '2000-11-12'],
        'mother.idType': ['NONE', 'NONE']
      })
    ).resolves.toHaveLength(1)
  })

  describe('same mother two births within 9 months of each other', () => {
    it('finds a duplicate with same mother two births within 9 months', async () => {
      await expect(
        findDuplicates({
          'child.name': [
            { firstname: 'John', surname: 'Smith' },
            { firstname: 'Janet', surname: 'Smith' }
          ],
          'child.dob': ['2011-11-11', '2011-12-01'],
          'mother.name': [
            { firstname: 'Mother', surname: 'Smith' },
            { firstname: 'Mother', surname: 'Smith' }
          ],
          'mother.dob': ['2000-11-12', '2000-11-12'],
          'mother.nid': ['23412387', '23412387']
        })
      ).resolves.toHaveLength(1)
    })

    it('births more than 9 months apart', async () => {
      await expect(
        findDuplicates({
          'child.name': [
            { firstname: 'John', surname: 'Smith' },
            { firstname: 'Janet', surname: 'Smith' }
          ],
          'child.dob': ['2011-11-11', '2010-10-01'],
          'mother.name': [
            { firstname: 'Mother', surname: 'Smith' },
            { firstname: 'Mother', surname: 'Smith' }
          ],
          'mother.dob': ['2000-11-12', '2000-11-12'],
          'mother.nid': ['23412387', '23412387']
        })
      ).resolves.toStrictEqual([])
    })
  })

  it('finds a duplicate even if there is a 3 year gap', async () => {
    await expect(
      findDuplicates({
        'child.dob': ['2011-11-11', '2014-11-01'],
        'child.name': [
          { firstname: 'John', surname: 'Smith' },
          { firstname: 'John', surname: 'Smith' }
        ],
        'mother.name': [
          { firstname: 'Mother', surname: 'Smith' },
          { firstname: 'Mother', surname: 'Smith' }
        ],
        'mother.dob': ['2000-11-12', '2000-11-12'],
        'mother.nid': ['23412387', '23412387']
      })
    ).resolves.toHaveLength(1)
  })

  it('finds a duplicate for dob against age', async () => {
    await expect(
      findDuplicates({
        'child.dob': ['2011-11-11', '2011-11-01'],
        'child.name': [
          { firstname: 'John', surname: 'Smith' },
          { firstname: 'John', surname: 'Smith' }
        ],
        'mother.name': [
          { firstname: 'Mother', surname: 'Smith' },
          { firstname: 'Mother', surname: 'Smith' }
        ],
        'mother.dob': [undefined, '2000-11-12'],
        'mother.age': [{ age: 11, asOfDateRef: 'child.dob' }, undefined],
        'mother.nid': ['23412387', '23412387']
      })
    ).resolves.toHaveLength(1)
  })

  it('finds a duplicate for age against dob', async () => {
    await expect(
      findDuplicates({
        'child.dob': ['2011-11-11', '2011-11-01'],
        'child.name': [
          { firstname: 'John', surname: 'Smith' },
          { firstname: 'John', surname: 'Smith' }
        ],
        'mother.name': [
          { firstname: 'Mother', surname: 'Smith' },
          { firstname: 'Mother', surname: 'Smith' }
        ],
        'mother.dob': ['2000-11-12', undefined],
        'mother.age': [undefined, { age: 11, asOfDateRef: 'child.dob' }],
        'mother.nid': ['23412387', '23412387']
      })
    ).resolves.toHaveLength(1)
  })

  it('does not find a duplicate if there is a missing field value', async () => {
    await expect(
      findDuplicates({
        'child.dob': ['2011-11-11', ''],
        'child.name': [
          { firstname: 'John', surname: 'Smith' },
          { firstname: 'John', surname: 'Smith' }
        ],
        'mother.name': [
          { firstname: 'Mother', surname: 'Smith' },

          { firstname: 'Mother', surname: 'Smith' }
        ],
        'mother.dob': ['2000-11-12', '2000-11-12'],
        'mother.nid': ['23412387', '23412387']
      })
    ).resolves.toHaveLength(0)
  })
})

describe('deduplication across versions', () => {
  const OLDER_FIELD_ID = 'mother.previousDob'

  // Another version of the event, with a field that the record's own version does not have.
  const otherVersion = withDeclarationField(ChildOnboardingEvent, {
    id: OLDER_FIELD_ID,
    type: FieldType.DATE,
    label: {
      id: 'mother.previousDob.label',
      defaultMessage: 'Previous date of birth',
      description: 'Field that only another version has'
    }
  })

  const clause = Clause.parse(
    field('mother.dob').dateRangeMatches({
      days: 365,
      matchAgainst: OLDER_FIELD_ID
    })
  )

  const encodedEventIndex = encodeEventIndex(
    eventQueryDataGenerator({
      type: ChildOnboardingEvent.id,
      declaration: { 'mother.dob': '1990-01-01' }
    }),
    ChildOnboardingEvent
  )

  it('matches against a field that only another version has', () => {
    const query = generateElasticsearchQuery(encodedEventIndex, clause, [
      ChildOnboardingEvent,
      otherVersion
    ])

    expect(JSON.stringify(query)).toContain(
      declarationReference(encodeFieldId(OLDER_FIELD_ID))
    )
  })

  it('throws when no version has the field', () => {
    expect(() =>
      generateElasticsearchQuery(encodedEventIndex, clause, [
        ChildOnboardingEvent
      ])
    ).toThrow(`Field with id ${OLDER_FIELD_ID} not found in any version`)
  })

  it('finds duplicates of both versions when the first name moved from a TEXT field into a NAME field', async () => {
    const OLDER_FIRSTNAME_ID = 'child.firstname'
    const {
      versions: [base],
      ...eventLevel
    } = toVersionedEventConfig(ChildOnboardingEvent)
    const versionedConfig = {
      ...eventLevel,
      versions: [
        withDeclarationField(base, {
          id: OLDER_FIRSTNAME_ID,
          type: FieldType.TEXT,
          label: {
            id: 'child.firstname.label',
            defaultMessage: 'First name',
            description: 'Field that only the older version has'
          }
        }),
        { ...base, id: 'v2', effectiveFrom: '2020-01-01' }
      ]
    }

    const recordOfV1 = eventQueryDataGenerator({
      id: getUUID(),
      type: ChildOnboardingEvent.id,
      declaration: { [OLDER_FIRSTNAME_ID]: 'John' }
    })
    const recordOfV2 = eventQueryDataGenerator({
      id: getUUID(),
      type: ChildOnboardingEvent.id,
      configVersionId: 'v2',
      declaration: { 'child.name': { firstname: 'John', surname: 'Doe' } }
    })
    for (const record of [recordOfV1, recordOfV2]) {
      await getOrCreateClient().update({
        index: getEventIndexName(ChildOnboardingEvent.id),
        id: record.id,
        body: {
          doc: encodeEventIndex(
            record,
            getEventConfigForRecord(versionedConfig, record)
          ),
          doc_as_upsert: true
        },
        refresh: 'wait_for'
      })
    }

    const matches = await searchForDuplicates({
      eventIndex: eventQueryDataGenerator({
        id: getUUID(),
        type: ChildOnboardingEvent.id,
        configVersionId: 'v2',
        declaration: { 'child.name': { firstname: 'John', surname: 'Smith' } }
      }),
      deduplication: DeduplicationConfig.parse({
        ...LEGACY_BIRTH_DEDUPLICATION_RULES,
        query: field('child.name.firstname').fuzzyMatches({
          matchAgainst: ['child.name.firstname', OLDER_FIRSTNAME_ID]
        })
      }),
      versionedConfig,
      today: '2025-01-01' as PlainDate
    })

    expect(matches.map(({ event }) => event.id).sort()).toEqual(
      [recordOfV1.id, recordOfV2.id].sort()
    )
  })
})
