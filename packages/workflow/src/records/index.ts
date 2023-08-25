import {
  Bundle,
  BundleEntry,
  Composition,
  StateIdenfitiers,
  isComposition,
  isRelatedPerson
} from '@opencrvs/commons'
import { HEARTH_MONGO_URL } from '@workflow/constants'
import { MongoClient } from 'mongodb'

import { findFromBundleById } from './fhir'
import { sortBy, uniqBy } from 'lodash'

const client = new MongoClient(HEARTH_MONGO_URL)

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
            console.log('-----------------------------------')
            console.log()
            console.log(
              'Unresolved reference found: ' + value,
              JSON.stringify(rootResource)
            )
            console.log(
              'Make sure to add a join to getFHIRBundleWithRecordID query so that all resources of the records are returned'
            )
            console.log()
            console.log(JSON.stringify(bundle))
            console.log()
            console.log('-----------------------------------')
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

export async function getRecordById<T extends Array<keyof StateIdenfitiers>>(
  recordId: string,
  allowedStates: T
): Promise<StateIdenfitiers[T[number]]> {
  const connectedClient = await client.connect()

  const db = connectedClient.db()

  const composition = await db
    .collection('Composition')
    .findOne<Composition>({ id: recordId })

  if (!composition) {
    throw new RecordNotFoundError('Cannot find composition with id ' + recordId)
  }

  const referenceSections = composition
    .section!.filter((section) => section.entry && section.entry.length > 0)
    .map((section) => ({
      sectionId: section.code!.coding![0].code,
      referencingCollection: section.entry![0].reference!.split('/')[0]
    }))

  const query = [
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
    {
      $addFields: {
        bundle: ['$composition'],
        extensions: {
          $arrayToObject: {
            $map: {
              input: '$composition.section',
              as: 'el',
              in: [
                {
                  $let: {
                    vars: {
                      firstElement: {
                        $arrayElemAt: ['$$el.code.coding', 0]
                      }
                    },
                    in: '$$firstElement.code'
                  }
                },
                {
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
              ]
            }
          }
        }
      }
    },

    ...referenceSections.map((section) => [
      {
        $lookup: {
          from: section.referencingCollection,
          localField: `extensions.${section.sectionId}`,
          foreignField: 'id',
          as: 'joinResult'
        }
      },
      {
        $addFields: {
          bundle: { $concatArrays: ['$bundle', '$joinResult'] }
        }
      }
    ]),
    // Add task to bundle
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
        relatedPersonPatientIds: {
          $map: {
            input: {
              $filter: {
                input: '$bundle',
                as: 'item',
                cond: { $eq: ['$$item.resourceType', 'RelatedPerson'] }
              }
            },
            as: 'relatedPerson',
            in: {
              $arrayElemAt: [
                { $split: ['$$relatedPerson.patient.reference', '/'] },
                1
              ]
            }
          }
        },
        encounterIds: {
          $map: {
            input: {
              $filter: {
                input: '$bundle',
                as: 'item',
                cond: { $eq: ['$$item.resourceType', 'Encounter'] }
              }
            },
            as: 'encounter',
            in: { $concat: ['Encounter/', '$$encounter.id'] }
          }
        },
        /*
         * Creates a list of all references inside Task.extensions
         */
        taskNoteAuthorIds: {
          $reduce: {
            input: {
              $map: {
                input: {
                  $filter: {
                    input: '$bundle',
                    as: 'item',
                    cond: { $eq: ['$$item.resourceType', 'Task'] }
                  }
                },
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
            },
            initialValue: [],
            in: {
              $concatArrays: ['$$value', '$$this']
            }
          }
        },

        taskReferenceIds: {
          $reduce: {
            input: {
              $map: {
                input: {
                  $filter: {
                    input: '$bundle',
                    as: 'item',
                    cond: { $eq: ['$$item.resourceType', 'Task'] }
                  }
                },
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
            },
            initialValue: [],
            in: {
              $concatArrays: ['$$value', '$$this']
            }
          }
        },
        encounterLocationIds: {
          $reduce: {
            input: {
              $map: {
                input: {
                  $filter: {
                    input: '$bundle',
                    as: 'item',
                    cond: { $eq: ['$$item.resourceType', 'Encounter'] }
                  }
                },
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
            },
            initialValue: [],
            in: {
              $concatArrays: ['$$value', '$$this']
            }
          }
        }
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
      $lookup: {
        from: 'Practitioner',
        localField: `taskReferenceIds`,
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
      $lookup: {
        from: 'Location',
        localField: `taskReferenceIds`,
        foreignField: 'id',
        as: 'joinResult'
      }
    },
    {
      $addFields: {
        bundle: { $concatArrays: ['$bundle', '$joinResult'] }
      }
    },
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

  if (process.env.NODE_ENV !== 'production') {
    try {
      checkForUnresolvedReferences(bundle)
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  const allEntries = uniqBy(result[0].entry!, ({ resource }) => resource.id)

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

    if (isRelatedPerson(resource) && resource.patient.reference) {
      resource.patient.reference = findFromBundleById(
        bundle,
        resource.patient.reference.split('/')[1]
      ).fullUrl
    }

    return entry
  })
}
