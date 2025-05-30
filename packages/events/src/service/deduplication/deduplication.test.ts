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

import { DeduplicationConfig, EventIndex, getUUID } from '@opencrvs/commons'
import { getOrCreateClient } from '@events/storage/elasticsearch'
import { getEventIndexName } from '@events/storage/__mocks__/elasticsearch'
import { encodeEventIndex } from '@events/service/indexing/utils'
import { searchForDuplicates } from './deduplication'

const LEGACY_BIRTH_DEDUPLICATION_RULES = {
  id: 'Legacy birth deduplication check',
  label: {
    id: 'deduplication.legacy',
    defaultMessage: 'Legacy birth deduplication check',
    description: 'Legacy birth deduplication check'
  },
  query: {
    type: 'or',
    clauses: [
      {
        type: 'and',
        clauses: [
          {
            type: 'strict',
            fieldId: 'mother.identifier'
          },
          {
            type: 'fuzzy',
            fieldId: 'mother.firstNames'
          },
          {
            type: 'fuzzy',
            fieldId: 'mother.familyName'
          },
          {
            type: 'dateRange',
            fieldId: 'mother.DoB',
            options: {
              days: 365,
              origin: 'mother.DoB'
            }
          },
          {
            type: 'and',
            clauses: [
              {
                type: 'dateRange',
                fieldId: 'child.DoB',
                options: {
                  days: 273,
                  origin: 'child.DoB'
                }
              },
              {
                type: 'dateDistance',
                fieldId: 'child.DoB',
                options: {
                  days: 273,
                  origin: 'child.DoB'
                }
              }
            ]
          }
        ]
      },
      {
        type: 'and',
        clauses: [
          {
            type: 'fuzzy',
            fieldId: 'child.firstNames',
            options: {
              fuzziness: 1
            }
          },
          {
            type: 'fuzzy',
            fieldId: 'child.familyName',
            options: {
              fuzziness: 1
            }
          },
          {
            type: 'strict',
            fieldId: 'mother.identifier'
          },
          {
            type: 'fuzzy',
            fieldId: 'mother.firstNames'
          },
          {
            type: 'fuzzy',
            fieldId: 'mother.familyName'
          },
          {
            type: 'dateRange',
            fieldId: 'mother.DoB',
            options: {
              days: 365,
              origin: 'mother.DoB'
            }
          },
          {
            type: 'or',
            clauses: [
              {
                type: 'dateRange',
                fieldId: 'child.DoB',
                options: {
                  days: 273,
                  origin: 'child.DoB'
                }
              },
              {
                type: 'dateDistance',
                fieldId: 'child.DoB',
                options: {
                  days: 365,
                  origin: 'child.DoB'
                }
              }
            ]
          }
        ]
      }
    ]
  }
}

async function findDuplicates(
  registrationComparison: Record<string, string[]>
) {
  const esClient = getOrCreateClient()
  const existingComposition = Object.fromEntries(
    Object.entries(registrationComparison).map(([key, values]) => [
      key,
      values[0]
    ])
  )
  const newComposition = Object.fromEntries(
    Object.entries(registrationComparison).map(([key, values]) => [
      key,
      values[1]
    ])
  )

  await esClient.update({
    index: getEventIndexName(),
    id: getUUID(),
    body: {
      doc: encodeEventIndex({
        id: getUUID(),
        transactionId: getUUID(),
        declaration: existingComposition
      } as unknown as EventIndex),
      doc_as_upsert: true
    },
    refresh: 'wait_for'
  })

  const results = await searchForDuplicates(
    {
      declaration: newComposition,
      // Random field values that should not affect the search
      id: getUUID(),
      type: 'birth',
      status: 'CREATED',
      createdAt: '2025-01-01',
      createdBy: 'test',
      createdAtLocation: 'test',
      updatedAtLocation: 'test',
      legalStatuses: {},
      assignedTo: 'test',
      updatedAt: '2025-01-01',
      updatedBy: 'test',
      trackingId: 'TEST12',
      updatedByUserRole: 'test',
      flags: []
    },
    DeduplicationConfig.parse(LEGACY_BIRTH_DEDUPLICATION_RULES)
  )

  return results
}

describe('deduplication tests', () => {
  it('does not find duplicates with completely different details', async () => {
    await expect(
      findDuplicates({
        // Similar child's firstname(s)
        'child.firstNames': ['John', 'Riku'],
        // Similar child's lastname
        'child.familyName': ['Smith', 'Rouvila'],
        // Date of birth within 5 days
        'child.DoB': ['2011-11-11', '2000-10-13'],
        // Similar Mother’s firstname(s)
        'mother.firstNames': ['Mother', 'Sofia'],
        // Similar Mother’s lastname.
        'mother.familyName': ['Smith', 'Matthews'],
        // Similar Mother’s date of birth or Same Age of mother
        'mother.DoB': ['2000-11-11', '1980-09-02'],
        // Same mother’s NID
        'mother.identifier': ['23412387', '8653434']
      })
    ).resolves.toStrictEqual([])
  })
  it('does not find duplicates with completely different details', async () => {
    await expect(
      findDuplicates({
        // Similar child's firstname(s)
        'child.firstNames': ['John', 'Riku'],
        // Similar child's lastname
        'child.familyName': ['Smith', 'Rouvila'],
        // Date of birth within 5 days
        'child.DoB': ['2011-11-11', '2000-10-13'],
        // Similar Mother’s firstname(s)
        'mother.firstNames': ['Mother', 'Sofia'],
        // Similar Mother’s lastname.
        'mother.familyName': ['Smith', 'Matthews'],
        // Similar Mother’s date of birth or Same Age of mother
        'mother.DoB': ['2000-11-11', '1980-09-02'],
        // Same mother’s NID
        'mother.identifier': ['23412387', '8653434']
      })
    ).resolves.toStrictEqual([])
  })
  it('does not find duplicates with the same id', async () => {
    const esClient = getOrCreateClient()

    await esClient.update({
      index: getEventIndexName(),
      id: getUUID(),
      body: {
        doc: {
          id: '123-123-123-123'
        },
        doc_as_upsert: true
      },
      refresh: 'wait_for'
    })

    const results = await searchForDuplicates(
      {
        declaration: {},
        // Random field values that should not affect the search
        id: '123-123-123-123',
        type: 'birth',
        status: 'CREATED',
        createdAt: '2025-01-01',
        createdBy: 'test',
        createdAtLocation: 'test',
        updatedAtLocation: 'test',
        legalStatuses: {},
        assignedTo: 'test',
        updatedAt: '2025-01-01',
        updatedBy: 'test',
        trackingId: 'TEST12',
        updatedByUserRole: 'test',
        flags: []
      },
      DeduplicationConfig.parse(LEGACY_BIRTH_DEDUPLICATION_RULES)
    )
    expect(results).toHaveLength(0)
  })
  it('finds a duplicate with very similar details', async () => {
    await expect(
      findDuplicates({
        // Similar child's firstname(s)
        'child.firstNames': ['John', 'John'],
        // Similar child's lastname
        'child.familyName': ['Smith', 'Smith'],
        // Date of birth within 5 days
        'child.DoB': ['2011-11-11', '2011-11-11'],
        // Similar Mother’s firstname(s)
        'mother.firstNames': ['Mother', 'Mothera'],
        // Similar Mother’s lastname.
        'mother.familyName': ['Smith', 'Smith'],
        // Similar Mother’s date of birth or Same Age of mother
        'mother.DoB': ['2000-11-11', '2000-11-12'],
        // Same mother’s NID
        'mother.identifier': ['23412387', '23412387']
      })
    ).resolves.toHaveLength(1)
  })

  it('finds no duplicate with different mother nid', async () => {
    await expect(
      findDuplicates({
        'child.firstNames': ['John', 'John'],
        'child.familyName': ['Smith', 'Smith'],
        'child.DoB': ['2011-11-11', '2011-11-11'],
        'mother.firstNames': ['Mother', 'Mother'],
        'mother.familyName': ['Smith', 'Smith'],
        'mother.DoB': ['2000-11-12', '2000-11-12'],
        // Different mother’s NID
        'mother.identifier': ['23412387', '23412388']
      })
    ).resolves.toHaveLength(0)
  })

  it('finds no duplicates with very different details', async () => {
    await expect(
      findDuplicates({
        'child.firstNames': ['John', 'Mathew'],
        'child.familyName': ['Smith', 'Wilson'],
        'child.DoB': ['2011-11-11', '1980-11-11'],
        'mother.firstNames': ['Mother', 'Harriet'],
        'mother.familyName': ['Smith', 'Wilson'],
        'mother.DoB': ['2000-11-12', '1992-11-12'],
        'mother.identifier': ['23412387', '123123']
      })
    ).resolves.toHaveLength(0)
  })

  it('finds a duplicate even if the firstName of child is not given', async () => {
    await expect(
      findDuplicates({
        'child.firstNames': ['John', ''],
        'child.familyName': ['Smith', 'Smiht'],
        'child.DoB': ['2011-11-11', '2011-11-01'],
        'mother.firstNames': ['Mother', 'Mother'],
        'mother.familyName': ['Smith', 'Smith'],
        'mother.DoB': ['2000-11-12', '2000-11-12']
      })
    ).resolves.toHaveLength(1)
  })

  describe('same mother two births within 9 months of each other', () => {
    it('finds a duplicate with same mother two births within 9 months', async () => {
      await expect(
        findDuplicates({
          'child.firstNames': ['John', 'Janet'],
          'child.familyName': ['Smith', 'Smith'],
          'child.DoB': ['2011-11-11', '2011-12-01'],
          'mother.firstNames': ['Mother', 'Mother'],
          'mother.familyName': ['Smith', 'Smith'],
          'mother.DoB': ['2000-11-12', '2000-11-12'],
          'mother.identifier': ['23412387', '23412387']
        })
      ).resolves.toHaveLength(1)
    })

    it('births more than 9 months apart', async () => {
      await expect(
        findDuplicates({
          'child.firstNames': ['John', 'Janet'],
          'child.familyName': ['Smith', 'Smith'],
          'child.DoB': ['2011-11-11', '2010-10-01'],
          'mother.firstNames': ['Mother', 'Mother'],
          'mother.familyName': ['Smith', 'Smith'],
          'mother.DoB': ['2000-11-12', '2000-11-12'],
          'mother.identifier': ['23412387', '23412387']
        })
      ).resolves.toStrictEqual([])
    })
  })

  it('finds a duplicate for even there is a 3 year gap', async () => {
    await expect(
      findDuplicates({
        'child.DoB': ['2011-11-11', '2014-11-01'],
        'child.firstNames': ['John', 'John'],
        'child.familyName': ['Smith', 'Smith'],
        'mother.firstNames': ['Mother', 'Mother'],
        'mother.familyName': ['Smith', 'Smith'],
        'mother.DoB': ['2000-11-12', '2000-11-12'],
        'mother.identifier': ['23412387', '23412387']
      })
    ).resolves.toHaveLength(1)
  })
})
