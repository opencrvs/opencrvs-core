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
  Bundle,
  FhirResourceType,
  StateIdenfitiers,
  getFromBundleById,
  isComposition
} from '@opencrvs/commons/types'
import { writeFileSync } from 'fs'
import * as os from 'os'
import { join } from 'path'
import { sortBy, uniqBy } from 'lodash'
import { UUID } from '@opencrvs/commons'
import client from '@search/config/hearthClient'

function developmentTimeError(...params: Parameters<typeof console.error>) {
  /* eslint-disable no-console */
  console.error('-----------------------------')
  console.error('')
  console.error(...params)
  console.error('')
  console.error('-----------------------------')
  /* eslint-enable no-console */
}

export class RecordNotFoundError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'RecordNotFoundError'
  }
}

/*
 * This is a development-time only function to verify there exists no references
 * inside the bundle entries that are not resolved in the bundle.
 */
function checkForUnresolvedReferences(bundle: Bundle) {
  const EXCLUDED_PATHS = [
    'Patient.address.extension',
    'RelatedPerson.address.extension.valueReference',
    'Composition.relatesTo.targetReference.reference',
    'CompositionHistory.relatesTo.targetReference.reference'
  ]

  const EXCLUDED_REFERENCES = ['Location/0']

  function check(
    object: Record<string, any>,
    path: string,
    rootResource: Record<string, any>
  ) {
    for (const key of Object.keys(object)) {
      if (EXCLUDED_PATHS.includes(path + '.' + key)) {
        continue
      }
      const value = object[key]
      if (typeof value === 'string') {
        const collectionReference = /^[A-Z][a-z]+\/.*/
        if (collectionReference.test(value)) {
          if (EXCLUDED_REFERENCES.includes(value)) {
            continue
          }
          const id = value.split('/')[1]
          try {
            getFromBundleById(bundle, id)
          } catch (error) {
            const dumpFile = join(os.tmpdir(), Date.now() + '.json')
            writeFileSync(dumpFile, JSON.stringify(bundle))
            developmentTimeError(
              'Unresolved reference found: ' + value,
              'Make sure to add a join to getFHIRBundleWithRecordID query so that all resources of the records are returned',
              `Resource path: ${path}`,
              'Bundle',
              dumpFile
            )
            throw error
          }
        }
      } else if (Array.isArray(value)) {
        for (const item of value) {
          if (typeof item === 'object') {
            check(item, path + '.' + key, rootResource)
          }
        }
      } else if (typeof value === 'object') {
        check(value, path + '.' + key, rootResource)
      }
    }
  }

  for (const entry of bundle.entry!) {
    check(entry.resource, entry.resource.resourceType, entry.resource)
  }
}

type CollectionName =
  | 'Composition'
  | 'CompositionHistory'
  | 'DocumentReference'
  | 'Encounter'
  | 'Location'
  | 'Observation'
  | 'Patient'
  | 'PaymentReconciliation'
  | 'Practitioner'
  | 'PractitionerRole'
  | 'RelatedPerson'
  | 'Task'
  | 'QuestionnaireResponse'

function joinCollections(
  localField: string,
  collectionsToJoin: CollectionName[]
) {
  return collectionsToJoin.map((collection) => [
    {
      $lookup: {
        from: collection,
        localField,
        foreignField: 'id',
        as: 'joinResult'
      }
    },
    {
      $addFields: {
        bundle: { $concatArrays: ['$bundle', '$joinResult'] }
      }
    }
  ])
}

function filterByType(resourceTypes: Array<FhirResourceType>) {
  return {
    $filter: {
      input: '$bundle',
      as: 'item',
      cond: {
        $or: resourceTypes.map((resourceType) => ({
          $eq: ['$$item.resourceType', resourceType]
        }))
      }
    }
  }
}

function flattenArray(nestedQuery: Record<string, any>) {
  return {
    $reduce: {
      input: {
        $filter: {
          input: nestedQuery,
          as: 'item',
          cond: { $ne: ['$$item', null] }
        }
      },
      initialValue: [],
      in: {
        $concatArrays: ['$$value', '$$this']
      }
    }
  }
}

function mapKey(input: Record<string, any>, key: string) {
  return {
    $map: {
      input,
      as: 'item',
      in: `$$item.${key}`
    }
  }
}

function joinSectionsToCollections(
  resourceTypes: CollectionName[],
  collectionsToJoinTo: CollectionName[]
) {
  return [
    {
      $addFields: {
        extensionReferences: flattenArray({
          $map: {
            input: flattenArray(mapKey(filterByType(resourceTypes), 'section')),
            as: 'el',
            in: {
              $let: {
                vars: {
                  firstElement: { $arrayElemAt: ['$$el.entry', 0] }
                },
                in: {
                  $map: {
                    input: '$$el.entry',
                    as: 'entry',
                    in: {
                      $let: {
                        vars: {
                          collectionName: {
                            $arrayElemAt: [
                              { $split: ['$$entry.reference', '/'] },
                              0
                            ]
                          },
                          id: {
                            $arrayElemAt: [
                              { $split: ['$$entry.reference', '/'] },
                              1
                            ]
                          }
                        },
                        in: '$$id'
                      }
                    }
                  }
                }
              }
            }
          }
        })
      }
    },
    ...joinCollections('extensionReferences', collectionsToJoinTo)
  ]
}

const FIND_TASKS_REFERENCING_COMPOSITION = [
  {
    $addFields: {
      compositionIdForJoining: {
        $concat: ['Composition/', '$composition.id']
      }
    }
  },
  {
    $lookup: {
      from: 'Task',
      localField: `compositionIdForJoining`,
      foreignField: 'focus.reference',
      as: 'task'
    }
  },
  {
    $addFields: {
      bundle: { $concatArrays: ['$bundle', '$task'] }
    }
  },
  // There should only be one task for each composition, so we can flatten it
  { $unwind: '$task' }
]

const CREATE_TASK_HISTORY = [
  {
    $lookup: {
      from: 'Task_history',
      localField: 'task.id',
      foreignField: 'id',
      as: 'taskHistory'
    }
  },
  {
    $set: {
      taskHistory: {
        $map: {
          input: '$taskHistory',
          as: 'task',
          in: {
            $mergeObjects: [
              '$$task',
              {
                /*
                 * Custom resource type that forces history items
                 * to be dealt with separately to avoid conflicts.
                 * Each resource gets a new ID here that's based on the version id.
                 */
                resourceType: 'TaskHistory',
                id: '$$task.meta.versionId'
              }
            ]
          }
        }
      }
    }
  },
  {
    $addFields: {
      bundle: { $concatArrays: ['$bundle', '$taskHistory'] }
    }
  },
  // Find all encounters that Task history items are referring to
  {
    $addFields: {
      taskHistoryEncounterIds: {
        $map: {
          input: '$taskHistory',
          as: 'taskHistory',
          in: {
            $arrayElemAt: [
              {
                $split: ['$$taskHistory.encounter.reference', '/']
              },
              1
            ]
          }
        }
      }
    }
  },
  {
    $lookup: {
      from: 'Encounter',
      localField: `taskHistoryEncounterIds`,
      foreignField: 'id',
      as: 'joinResult'
    }
  },
  {
    $addFields: {
      bundle: { $concatArrays: ['$bundle', '$joinResult'] }
    }
  }
]

function joinFromResourcesResourceIdentifierKey(
  resourceTypes: CollectionName[],
  resourceKey: string,
  collectionToJoin: CollectionName
) {
  return [
    {
      $addFields: {
        ids: {
          $map: {
            input: filterByType(resourceTypes),
            as: 'resource',
            in: {
              $arrayElemAt: [{ $split: [`$$resource.${resourceKey}`, '/'] }, 1]
            }
          }
        }
      }
    },
    {
      $lookup: {
        from: collectionToJoin,
        localField: `ids`,
        foreignField: 'id',
        as: 'joinResult'
      }
    },
    {
      $addFields: {
        bundle: { $concatArrays: ['$bundle', '$joinResult'] }
      }
    }
  ]
}

function joinFromResourcesIdToResourceIdentifier(
  resourceType: CollectionName,
  foreignField: string,
  collectionToJoin: CollectionName
) {
  return [
    {
      $addFields: {
        resourceIds: {
          $map: {
            input: filterByType([resourceType]),
            as: 'resource',
            in: { $concat: [resourceType, '/', '$$resource.id'] }
          }
        }
      }
    },
    /*
     * If resourceIds is empty, $lookup considers it being a subset of everything and joins the entire `from` collection.
     * To workaround, set the array to be not-empty to not join anything.
     */
    {
      $addFields: {
        resourceIds: {
          $cond: {
            if: { $eq: ['$resourceIds', []] },
            then: ['_EMPTY_'],
            else: '$resourceIds'
          }
        }
      }
    },
    {
      $lookup: {
        from: collectionToJoin,
        localField: `resourceIds`,
        foreignField,
        as: 'joinResult'
      }
    },
    {
      $addFields: {
        bundle: { $concatArrays: ['$bundle', '$joinResult'] }
      }
    }
  ]
}

export const aggregateRecords = ({
  recordId,
  includeHistoryResources
}: {
  recordId?: UUID
  includeHistoryResources: boolean
}) =>
  [
    ...(recordId
      ? [
          {
            $match: {
              id: recordId
            }
          }
        ]
      : []),
    { $addFields: { bundle: ['$$ROOT'], composition: '$$ROOT' } },
    { $project: { bundle: 1, composition: 1 } },

    ...(includeHistoryResources
      ? [
          // Get CompositionHistory for the composition
          {
            $addFields: {
              compositionIds: {
                $map: {
                  input: filterByType(['Composition']),
                  as: 'composition',
                  in: '$$composition.id'
                }
              }
            }
          },
          {
            $lookup: {
              from: 'Composition_history',
              localField: 'compositionIds',
              foreignField: 'id',
              as: 'compositionHistory'
            }
          },
          {
            $set: {
              compositionHistory: {
                $map: {
                  input: '$compositionHistory',
                  as: 'composition',
                  in: {
                    $mergeObjects: [
                      '$$composition',
                      {
                        /*
                         * Custom resource type that forces history items
                         * to be dealt with separately to avoid conflicts.
                         */
                        resourceType: 'CompositionHistory'
                      }
                    ]
                  }
                }
              }
            }
          },
          {
            $addFields: {
              bundle: { $concatArrays: ['$bundle', '$compositionHistory'] }
            }
          }
        ]
      : []),

    /*
     * Reads all references from Composition.section end makes a list of UUIDs "extensionReferences" of all resource identifiers found
     */

    ...joinSectionsToCollections(
      ['Composition', 'CompositionHistory'],
      ['Encounter', 'RelatedPerson', 'Patient', 'DocumentReference']
    ),

    /*
     * Next, find all tasks that reference the composition
     */
    ...FIND_TASKS_REFERENCING_COMPOSITION,

    ...(includeHistoryResources ? CREATE_TASK_HISTORY : []),
    /*
     * Creates a list "relatedPerson" of all patient references inside RelatedPerson
     */
    ...joinFromResourcesResourceIdentifierKey(
      ['RelatedPerson'],
      'patient.reference',
      'Patient'
    ),

    // Get Observations by Encounter ids
    // (Encounter.id -> Observation.context.reference)
    ...joinFromResourcesIdToResourceIdentifier(
      'Encounter',
      'context.reference',
      'Observation'
    ),

    {
      $addFields: {
        /*
         * Creates a list of all references inside Task.extensions
         */
        taskReferenceIds: flattenArray({
          $map: {
            input: filterByType(['Task', 'TaskHistory']),
            as: 'task',
            in: {
              $map: {
                input: {
                  $filter: {
                    input: '$$task.extension',
                    as: 'extension',
                    cond: { $ne: ['$$extension.valueReference', undefined] }
                  }
                },
                as: 'extension',
                in: {
                  $arrayElemAt: [
                    {
                      $split: ['$$extension.valueReference.reference', '/']
                    },
                    1
                  ]
                }
              }
            }
          }
        }),
        /*
         * Creates a list of all references inside Task.requester
         */
        taskRequesterIds: {
          $map: {
            input: filterByType(['Task', 'TaskHistory']),
            as: 'task',
            in: {
              $arrayElemAt: [
                { $split: ['$$task.requester.agent.reference', '/'] },
                1
              ]
            }
          }
        },
        /*
         * Creates a list of all encounters inside Task.encounter.reference
         */
        taskEncounterIds: {
          $map: {
            input: filterByType(['Task', 'TaskHistory']),
            as: 'task',
            in: {
              $arrayElemAt: [
                {
                  $split: ['$$task.encounter.reference', '/']
                },
                1
              ]
            }
          }
        },
        /*
         * Creates a list of all authors inside Task.note
         */
        taskNoteAuthorIds: flattenArray({
          $map: {
            input: filterByType(['Task', 'TaskHistory']),
            as: 'task',
            in: {
              $map: {
                input: {
                  $filter: {
                    input: '$$task.note',
                    as: 'note',
                    cond: { $ne: ['$$note.authorString', undefined] }
                  }
                },
                as: 'note',
                in: {
                  $arrayElemAt: [
                    {
                      $split: ['$$note.authorString', '/']
                    },
                    1
                  ]
                }
              }
            }
          }
        }),
        /*
         * Creates a list of all location ids inside Encounter.location
         */
        encounterLocationIds: flattenArray({
          $map: {
            input: filterByType(['Encounter']),
            as: 'encounter',
            in: {
              $map: {
                input: '$$encounter.location',
                as: 'location',
                in: {
                  $arrayElemAt: [
                    { $split: ['$$location.location.reference', '/'] },
                    1
                  ]
                }
              }
            }
          }
        })
      }
    },
    // Get task note Practitioner references
    {
      $lookup: {
        from: 'Practitioner',
        localField: `taskNoteAuthorIds`,
        foreignField: 'id',
        as: 'joinResult'
      }
    },
    {
      $addFields: {
        bundle: { $concatArrays: ['$bundle', '$joinResult'] }
      }
    },
    // Get Task extension references
    {
      $addFields: {
        taskReferenceIds: {
          $concatArrays: ['$taskReferenceIds', '$taskRequesterIds']
        }
      }
    },
    ...joinCollections('taskReferenceIds', [
      'Practitioner',
      'Location',
      'PaymentReconciliation'
    ]),

    // Get encounters Tasks are referring to
    {
      $lookup: {
        from: 'Encounter',
        localField: `taskEncounterIds`,
        foreignField: 'id',
        as: 'joinResult'
      }
    },
    {
      $addFields: {
        bundle: { $concatArrays: ['$bundle', '$joinResult'] }
      }
    },
    // Get DocumentReferences by Encounter ids
    // (Encounter.id -> DocumentReference.subject.reference)
    ...joinFromResourcesIdToResourceIdentifier(
      'Encounter',
      'subject.reference',
      'DocumentReference'
    ),
    // Get Locations by Encounter location ids
    {
      $lookup: {
        from: 'Location',
        localField: `encounterLocationIds`,
        foreignField: 'id',
        as: 'joinResult'
      }
    },
    {
      $addFields: {
        bundle: { $concatArrays: ['$bundle', '$joinResult'] }
      }
    },
    // Get RelatedPersons from DocumentReferences -> extension -> http://opencrvs.org/specs/extension/collector
    {
      $addFields: {
        bundle: { $concatArrays: ['$bundle', '$joinResult'] }
      }
    },
    // Get RelatedPersons from DocumentReferences -> extension -> http://opencrvs.org/specs/extension/collector
    {
      $addFields: {
        documentReferenceIds: flattenArray({
          $map: {
            input: filterByType(['DocumentReference']),
            as: 'documentReference',
            in: {
              $map: {
                input: '$$documentReference.extension',
                as: 'extension',
                in: {
                  $arrayElemAt: [
                    {
                      $split: ['$$extension.valueReference.reference', '/']
                    },
                    1
                  ]
                }
              }
            }
          }
        })
      }
    },
    ...joinCollections('documentReferenceIds', [
      'RelatedPerson',
      'PaymentReconciliation'
    ]),
    {
      $addFields: {
        /*
         * Creates a list "relatedPerson" of all patient references inside RelatedPerson
         */
        relatedPersonPatientIds: {
          $map: {
            input: filterByType(['RelatedPerson']),
            as: 'relatedPerson',
            in: {
              $arrayElemAt: [
                { $split: ['$$relatedPerson.patient.reference', '/'] },
                1
              ]
            }
          }
        }
      }
    },
    // Get Patients & RelatedPatients RelatedPersonIds
    ...joinCollections('relatedPersonPatientIds', ['RelatedPerson', 'Patient']),

    // Get PractitionerRoles for all found practitioners
    {
      $addFields: {
        practitionerIds: {
          $map: {
            input: filterByType(['DocumentReference']),
            as: 'documentReference',
            in: {
              $map: {
                input: '$$documentReference.extension',
                as: 'extension',
                in: {
                  $arrayElemAt: [
                    {
                      $split: ['$$extension.valueReference.reference', '/']
                    },
                    1
                  ]
                }
              }
            }
          }
        }
      }
    },
    ...joinCollections('documentReferenceIds', [
      'RelatedPerson',
      'PaymentReconciliation'
    ]),
    {
      $addFields: {
        /*
         * Creates a list "relatedPerson" of all patient references inside RelatedPerson
         */
        relatedPersonPatientIds: {
          $map: {
            input: filterByType(['RelatedPerson']),
            as: 'relatedPerson',
            in: {
              $arrayElemAt: [
                { $split: ['$$relatedPerson.patient.reference', '/'] },
                1
              ]
            }
          }
        }
      }
    },
    // Get Patients & RelatedPatients RelatedPersonIds
    ...joinCollections('relatedPersonPatientIds', ['RelatedPerson', 'Patient']),

    // Get PractitionerRoles for all found practitioners
    ...joinFromResourcesIdToResourceIdentifier(
      'Practitioner',
      'practitioner.reference',
      'PractitionerRole'
    ),

    // Get QuestionnaireResponse by Encounter ids
    // (Encounter.id -> QuestionnaireResponse.subject.reference)
    ...joinFromResourcesIdToResourceIdentifier(
      'Encounter',
      'subject.reference',
      'QuestionnaireResponse'
    ),

    ...(includeHistoryResources
      ? [
          // Get PractitionerRolesHistory for all found practitioners roles
          {
            $addFields: {
              practitionerRoleIds: {
                $map: {
                  input: filterByType(['PractitionerRole']),
                  as: 'practitionerRole',
                  in: '$$practitionerRole.id'
                }
              }
            }
          },
          {
            $lookup: {
              from: 'PractitionerRole_history',
              localField: 'practitionerRoleIds',
              foreignField: 'id',
              as: 'practitionerRoleHistory'
            }
          },
          {
            $set: {
              practitionerRoleHistory: {
                $map: {
                  input: '$practitionerRoleHistory',
                  as: 'practitionerRole',
                  in: {
                    $mergeObjects: [
                      '$$practitionerRole',
                      {
                        /*
                         * Custom resource type that forces history items
                         * to be dealt with separately to avoid conflicts.
                         */
                        resourceType: 'PractitionerRoleHistory'
                      }
                    ]
                  }
                }
              }
            }
          },
          {
            $addFields: {
              bundle: { $concatArrays: ['$bundle', '$practitionerRoleHistory'] }
            }
          }
        ]
      : []),
    ...(includeHistoryResources
      ? [
          // Get CompositionHistory for the composition
          {
            $addFields: {
              compositionIds: {
                $map: {
                  input: filterByType(['Composition']),
                  as: 'composition',
                  in: '$$composition.id'
                }
              }
            }
          },
          {
            $lookup: {
              from: 'Composition_history',
              localField: 'compositionIds',
              foreignField: 'id',
              as: 'compositionHistory'
            }
          },
          {
            $set: {
              compositionHistory: {
                $map: {
                  input: '$compositionHistory',
                  as: 'composition',
                  in: {
                    $mergeObjects: [
                      '$$composition',
                      {
                        /*
                         * Custom resource type that forces history items
                         * to be dealt with separately to avoid conflicts.
                         */
                        resourceType: 'CompositionHistory'
                      }
                    ]
                  }
                }
              }
            }
          },
          {
            $addFields: {
              bundle: { $concatArrays: ['$bundle', '$compositionHistory'] }
            }
          }
        ]
      : []),

    // Get Locations for found PractitionerRoles
    {
      $addFields: {
        practitionerLocationIds: flattenArray({
          $map: {
            input: filterByType(['PractitionerRole']),
            as: 'practitionerRole',
            in: {
              $map: {
                input: '$$practitionerRole.location',
                as: 'location',
                in: {
                  $arrayElemAt: [{ $split: ['$$location.reference', '/'] }, 1]
                }
              }
            }
          }
        })
      }
    },
    {
      $lookup: {
        from: 'Location',
        localField: `practitionerLocationIds`,
        foreignField: 'id',
        as: 'joinResult'
      }
    },
    {
      $addFields: {
        bundle: { $concatArrays: ['$bundle', '$joinResult'] }
      }
    },
    /*
     * Resolve location hierarchies for all locations
     */
    {
      $addFields: {
        allLocationIds: {
          $map: {
            input: filterByType(['Location']),
            as: 'location',
            in: '$$location.id'
          }
        }
      }
    },

    {
      $graphLookup: {
        from: 'Location_view_with_plain_ids',
        startWith: '$allLocationIds',
        connectFromField: 'partOf.reference',
        connectToField: 'id',
        as: 'joinResult'
      }
    },
    {
      $set: {
        joinResult: {
          $map: {
            input: '$joinResult',
            as: 'item',
            in: {
              $cond: {
                if: {
                  $gt: ['$$item.partOf', null]
                },
                then: {
                  $mergeObjects: [
                    '$$item',
                    {
                      partOf: {
                        reference: {
                          $concat: ['Location/', '$$item.partOf.reference']
                        }
                      }
                    }
                  ]
                },
                else: '$$item'
              }
            }
          }
        }
      }
    },
    {
      $addFields: {
        bundle: { $concatArrays: ['$bundle', '$joinResult'] }
      }
    },
    {
      $addFields: {
        bundle: {
          $map: {
            input: '$bundle',
            as: 'resource',
            in: {
              // Add fullUrl to all entries
              fullUrl: {
                $concat: [
                  '/fhir/',
                  '$$resource.resourceType',
                  '/',
                  '$$resource.id',
                  '/_history/',
                  '$$resource.meta.versionId'
                ]
              },
              resource: '$$resource'
            }
          }
        }
      }
    },
    {
      $project: {
        entry: '$bundle'
      }
    }
  ].flat()

export async function getRecordById<T extends Array<keyof StateIdenfitiers>>(
  recordId: UUID,
  _allowedStates: T,
  includeHistoryResources: boolean
): Promise<StateIdenfitiers[T[number]]> {
  const db = client.db()
  const query = aggregateRecords({ recordId, includeHistoryResources })
  const result = await db
    .collection('Composition')
    .aggregate<Bundle>(query)
    .toArray()

  const bundle = result[0]

  if (!bundle) {
    throw new RecordNotFoundError(`Record with id ${recordId} not found`)
  }

  if (process.env.NODE_ENV !== 'production') {
    checkForUnresolvedReferences(bundle)
  }

  const allEntries = uniqBy(
    result[0].entry,
    ({ resource }) => `${resource.id} ${resource.meta?.versionId}`
  )

  /*
   * Many places in the code assumes that the composition is the first entry in the bundle.
   */

  const entriesInBackwardsCompatibleOrder = sortBy(allEntries, (entry) => {
    if (isComposition(entry.resource)) {
      return 0
    }
    return 1
  })

  const record = {
    resourceType: 'Bundle',
    type: 'document',
    entry: entriesInBackwardsCompatibleOrder.map((entry) => {
      const { _id, ...resourceWithoutMongoId } = entry.resource
      return {
        ...entry,
        resource: resourceWithoutMongoId
      }
    })
  }

  return record as StateIdenfitiers[T[number]]
}

export const streamAllRecords = async (includeHistoryResources: boolean) => {
  const connectedClient = await client.connect()
  const db = connectedClient.db()
  const query = aggregateRecords({ includeHistoryResources })
  return db.collection('Composition').aggregate<Bundle>(query).stream()
}
