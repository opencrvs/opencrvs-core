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
import {
  DeduplicationConfig,
  getUUID,
  UUID,
  FieldValue,
  eventQueryDataGenerator,
  Clause
} from '@opencrvs/commons'
import { v2BirthEvent } from '@opencrvs/commons/fixtures'
import { field, and, or } from '@opencrvs/commons/events/deduplication'
import { getOrCreateClient } from '@events/storage/elasticsearch'
import { getEventIndexName } from '@events/storage/__mocks__/elasticsearch'
import { encodeEventIndex } from '@events/service/indexing/utils'
import {
  generateElasticsearchQuery,
  searchForDuplicates
} from './deduplication'

const similarNamedChild = field('child.name').fuzzyMatches()
const childDobWithin5Days = field('child.dob').dateRangeMatches({ days: 5 })
const similarNamedMother = field('mother.name').fuzzyMatches()
const similarAgedMother = field('mother.dob').dateRangeMatches({ days: 365 })
const sameMotherNid = field('mother.nid').strictMatches()
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
      sameMotherNid
    ),
    and(
      similarNamedMother,
      similarAgedMother,
      sameMotherNid,
      childDobWithin9Months
    ),
    and(
      exactNamedChild,
      childDobWithin3Years,
      similarNamedMother,
      similarAgedMother,
      sameMotherNid
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
    index: getEventIndexName(),
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
        v2BirthEvent
      ),
      doc_as_upsert: true
    },
    refresh: 'wait_for'
  })

  const results = await searchForDuplicates(
    eventQueryDataGenerator({ declaration: newEvent }, 37),
    DeduplicationConfig.parse(LEGACY_BIRTH_DEDUPLICATION_RULES),
    v2BirthEvent
  )

  return results
}

describe('deduplication query input conversion', () => {
  it('should convert similar child name to fuzzy query', () => {
    const encodedEventIndex = encodeEventIndex(
      eventQueryDataGenerator({
        declaration: {
          'child.name': { firstname: 'John', surname: 'Smith' }
        }
      }),
      v2BirthEvent
    )
    expect(
      generateElasticsearchQuery(
        encodedEventIndex,
        Clause.parse(similarNamedChild),
        v2BirthEvent
      )
    ).toMatchSnapshot()
  })

  it('should convert childDobWithin5Days to dateRange query', () => {
    const encodedEventIndex = encodeEventIndex(
      eventQueryDataGenerator({
        declaration: {
          'child.dob': '2011-11-11'
        }
      }),
      v2BirthEvent
    )
    expect(
      generateElasticsearchQuery(
        encodedEventIndex,
        Clause.parse(childDobWithin5Days),
        v2BirthEvent
      )
    ).toMatchSnapshot()
  })

  it('should convert similarNamedMother to fuzzy query', () => {
    const encodedEventIndex = encodeEventIndex(
      eventQueryDataGenerator({
        declaration: {
          'mother.name': { firstname: 'Janet', surname: 'Smith' }
        }
      }),
      v2BirthEvent
    )
    expect(
      generateElasticsearchQuery(
        encodedEventIndex,
        Clause.parse(similarNamedMother),
        v2BirthEvent
      )
    ).toMatchSnapshot()
  })

  it('should convert similarAgedMother to dateRange query', () => {
    const encodedEventIndex = encodeEventIndex(
      eventQueryDataGenerator({
        declaration: {
          'mother.dob': '1999-11-11'
        }
      }),
      v2BirthEvent
    )
    expect(
      generateElasticsearchQuery(
        encodedEventIndex,
        Clause.parse(similarAgedMother),
        v2BirthEvent
      )
    ).toMatchSnapshot()
  })

  it('should convert sameMotherNid to strict query', () => {
    const encodedEventIndex = encodeEventIndex(
      eventQueryDataGenerator({
        declaration: {
          'mother.nid': '1232314352'
        }
      }),
      v2BirthEvent
    )
    expect(
      generateElasticsearchQuery(
        encodedEventIndex,
        Clause.parse(sameMotherNid),
        v2BirthEvent
      )
    ).toMatchSnapshot()
  })

  it('should convert exactNamedChild to strict query', () => {
    const encodedEventIndex = encodeEventIndex(
      eventQueryDataGenerator({
        declaration: {
          'child.name': { firstname: 'John', surname: 'Smith' }
        }
      }),
      v2BirthEvent
    )
    expect(
      generateElasticsearchQuery(
        encodedEventIndex,
        Clause.parse(exactNamedChild),
        v2BirthEvent
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
      index: getEventIndexName(),
      id: event.id,
      body: {
        doc: encodeEventIndex(event, v2BirthEvent),
        doc_as_upsert: true
      },
      refresh: 'wait_for'
    })

    const duplicateEvent = eventQueryDataGenerator({
      declaration: declarationOverrides
    })

    const matchResultForDuplicateEvent = await searchForDuplicates(
      duplicateEvent,
      DeduplicationConfig.parse(LEGACY_BIRTH_DEDUPLICATION_RULES),
      v2BirthEvent
    )
    expect(matchResultForDuplicateEvent).toHaveLength(1)

    const duplicateEventWithSameId = eventQueryDataGenerator({
      id: '123-123-123-123' as UUID,
      declaration: declarationOverrides
    })

    const matchResultForEventWithSameId = await searchForDuplicates(
      duplicateEventWithSameId,
      DeduplicationConfig.parse(LEGACY_BIRTH_DEDUPLICATION_RULES),
      v2BirthEvent
    )
    expect(matchResultForEventWithSameId).toHaveLength(0)
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
