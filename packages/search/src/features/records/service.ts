import {
  Bundle,
  BundleEntry,
  StateIdenfitiers,
  findFromBundleById,
  isComposition,
  isEncounter,
  isRelatedPerson
} from '@opencrvs/commons/types'
import { HEARTH_MONGO_URL } from '@search/constants'
import { MongoClient } from 'mongodb'

import { sortBy, uniqBy } from 'lodash'

const client = new MongoClient(HEARTH_MONGO_URL)

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
  const EXCLUDED_PATHS = ['Location.partOf.reference']

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
          const id = value.split('/')[1]
          try {
            findFromBundleById(bundle, id)
          } catch (error) {
            developmentTimeError(
              'Unresolved reference found: ' + value,
              'Make sure to add a join to getFHIRBundleWithRecordID query so that all resources of the records are returned',
              'Resource:',
              JSON.stringify(rootResource),
              'Bundle',
              JSON.stringify(bundle)
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

const COLLECTIONS_TO_AUTOMATICALLY_JOIN = [
  'DocumentReference',
  'Encounter',
  'Location',
  'Observation',
  'Patient',
  'PaymentReconciliation',
  'Practitioner',
  'PractitionerRole',
  'RelatedPerson',
  'Task'
]

/*
 * Reads the array of UUIDs in "localField" and tries to join all collections one by one
 */

function autoJoinAllCollections(localField: string) {
  return COLLECTIONS_TO_AUTOMATICALLY_JOIN.map((collection) => [
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

function filterByType(resourceType: fhir3.FhirResource['resourceType']) {
  return {
    $filter: {
      input: '$bundle',
      as: 'item',
      cond: { $eq: ['$$item.resourceType', resourceType] }
    }
  }
}

function flattenArray(nestedQuery: Record<string, any>) {
  return {
    $reduce: {
      input: nestedQuery,
      initialValue: [],
      in: {
        $concatArrays: ['$$value', '$$this']
      }
    }
  }
}

export async function getRecordById<T extends Array<keyof StateIdenfitiers>>(
  recordId: string,
  allowedStates: T
): Promise<StateIdenfitiers[T[number]]> {
  const connectedClient = await client.connect()

  const db = connectedClient.db()

  const query: Array<Record<string, any>> = [
    {
      $match: {
        id: recordId
      }
    },
    {
      $group: {
        _id: null,
        composition: { $push: '$$ROOT' }
      }
    },
    { $unwind: '$composition' },
    /*
     * Reads all references from Composition.section end makes a list "extensionReferences" of all UUIDs found
     */
    {
      $addFields: {
        bundle: ['$composition'],
        extensionReferences: flattenArray({
          $map: {
            input: '$composition.section',
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
    ...autoJoinAllCollections('extensionReferences'),
    /*
     * Next, find all tasks that reference the composition
     */
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
        as: 'joinResult'
      }
    },
    {
      $addFields: {
        bundle: { $concatArrays: ['$bundle', '$joinResult'] }
      }
    },
    {
      $addFields: {
        /*
         * Creates a list "relatedPerson" of all patient references inside RelatedPerson
         */
        relatedPersonPatientIds: {
          $map: {
            input: filterByType('RelatedPerson'),
            as: 'relatedPerson',
            in: {
              $arrayElemAt: [
                { $split: ['$$relatedPerson.patient.reference', '/'] },
                1
              ]
            }
          }
        },
        /*
         * Creates a list "encounterIds" of all encounters. This is later on used for finding all Observations
         */
        encounterIds: {
          $map: {
            input: filterByType('Encounter'),
            as: 'encounter',
            in: { $concat: ['Encounter/', '$$encounter.id'] }
          }
        },
        /*
         * Creates a list of all references inside Task.extensions
         */
        taskReferenceIds: flattenArray({
          $map: {
            input: filterByType('Task'),
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
            input: filterByType('Task'),
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
            input: filterByType('Task'),
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
            input: filterByType('Task'),
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
            input: filterByType('Encounter'),
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
    ...autoJoinAllCollections('taskReferenceIds'),
    // Get Patients by RelatedPersonIds
    {
      $lookup: {
        from: 'Patient',
        localField: `relatedPersonPatientIds`,
        foreignField: 'id',
        as: 'joinResult'
      }
    },
    {
      $addFields: {
        bundle: { $concatArrays: ['$bundle', '$joinResult'] }
      }
    },
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
    // Get observations by Encounter ids
    {
      $lookup: {
        from: 'Observation',
        localField: `encounterIds`,
        foreignField: 'context.reference',
        as: 'joinResult'
      }
    },
    {
      $addFields: {
        bundle: { $concatArrays: ['$bundle', '$joinResult'] }
      }
    },
    {
      $lookup: {
        from: 'Observation',
        localField: `encounterIds`,
        foreignField: 'context.reference',
        as: 'joinResult'
      }
    },
    {
      $addFields: {
        bundle: { $concatArrays: ['$bundle', '$joinResult'] }
      }
    },
    // Get PractitionerRoles for all found practitioners
    {
      $addFields: {
        practitionerIds: {
          $map: {
            input: {
              $filter: {
                input: '$bundle',
                as: 'item',
                cond: { $eq: ['$$item.resourceType', 'Practitioner'] }
              }
            },
            as: 'practitioner',
            in: { $concat: ['Practitioner/', '$$practitioner.id'] }
          }
        }
      }
    },
    {
      $lookup: {
        from: 'PractitionerRole',
        localField: `practitionerIds`,
        foreignField: 'practitioner.reference',
        as: 'joinResult'
      }
    },
    {
      $addFields: {
        bundle: { $concatArrays: ['$bundle', '$joinResult'] }
      }
    },
    // Get Locations for found PractitionerRoles
    {
      $addFields: {
        practitionerLocationIds: flattenArray({
          $map: {
            input: {
              $filter: {
                input: '$bundle',
                as: 'item',
                cond: { $eq: ['$$item.resourceType', 'PractitionerRole'] }
              }
            },
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
                  'http://localhost:3447/fhir/',
                  '$$resource.resourceType',
                  '/',
                  '$$resource.id',
                  '/',
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

  const result = await db
    .collection('Composition')
    .aggregate<Bundle>(query)
    .toArray()

  const bundle = result[0]

  if (!bundle) {
    throw new RecordNotFoundError(`Record with id ${recordId} not found`)
  }

  if (process.env.NODE_ENV !== 'production') {
    try {
      checkForUnresolvedReferences(bundle)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error)
      // eslint-disable-next-line no-console
      console.log(JSON.stringify(query))
      throw error
    }
  }

  const allEntries = uniqBy(result[0].entry, ({ resource }) => resource.id)

  /*
   * Many places in the code assumes that the composition is the first entry in the bundle.
   */

  const entriesInBackwardsCompatibleOrder = sortBy(allEntries, (entry) => {
    if (isComposition(entry.resource)) {
      return 0
    }
    return 1
  })

  const bundleWithFullURLReferences = resolveReferenceFullUrls(
    bundle,
    entriesInBackwardsCompatibleOrder
  )

  const record = {
    resourceType: 'Bundle',
    type: 'document',
    entry: bundleWithFullURLReferences.map((entry) => {
      const { _id, ...resourceWithoutMongoId } = entry.resource
      return {
        ...entry,
        resource: resourceWithoutMongoId
      }
    })
  }

  return record as StateIdenfitiers[T[number]]
}

function resolveReferenceFullUrls(bundle: Bundle, entries: BundleEntry[]) {
  return entries.map((entry) => {
    const resource = entry.resource!
    if (isComposition(resource)) {
      resource.section?.forEach((section) => {
        section.entry?.forEach((entry) => {
          entry.reference = findFromBundleById(
            bundle,
            entry.reference!.split('/')[1]
          )?.fullUrl
        })
      })
    }
    if (isEncounter(resource)) {
      resource.location?.forEach(({ location }) => {
        location.reference = findFromBundleById(
          bundle,
          location.reference.split('/')[1]
        )?.fullUrl
      })
    }

    if (isRelatedPerson(resource) && resource.patient.reference) {
      resource.patient.reference = findFromBundleById(
        bundle,
        resource.patient.reference.split('/')[1]
      ).fullUrl
    }

    return entry
  })
}
