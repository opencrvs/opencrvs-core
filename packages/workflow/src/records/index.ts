import { HEARTH_MONGO_URL } from '@workflow/constants'
import { MongoClient } from 'mongodb'
import {
  Bundle,
  BundleEntry,
  findFromBundleById,
  isComposition,
  isRelatedPerson
} from './fhir'
const client = new MongoClient(HEARTH_MONGO_URL)

export async function getFHIRBundleWithRecordID(
  recordId: string
): Promise<Bundle> {
  const connectedClient = await client.connect()

  const db = connectedClient.db()

  const composition = await db
    .collection('Composition')
    .findOne<fhir.Composition>({ id: recordId })

  if (!composition) {
    throw new Error('Cannot find composition with id ' + recordId)
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
    // Get Patients by RelatedPersonIds
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
  const allEntries = result[0].entry!
  const bundleWithFullURLReferences = resolveReferenceFullUrls(
    bundle,
    allEntries
  )

  return {
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
}

const SECTIONS_WITH_ID_REFERENCES = [
  'birth-encounter',
  'death-encounter',
  'marriage-encounter'
]

function sectionReferenceShouldBeFullUrl(section: fhir.CompositionSection) {
  return !(
    section.code?.coding?.[0]?.code &&
    SECTIONS_WITH_ID_REFERENCES.includes(section.code.coding[0].code)
  )
}

function resolveReferenceFullUrls(bundle: Bundle, entries: BundleEntry[]) {
  return entries.map((entry) => {
    const resource = entry.resource!
    if (isComposition(resource)) {
      resource.section?.forEach((section) => {
        if (sectionReferenceShouldBeFullUrl(section)) {
          section.entry?.forEach((entry) => {
            entry.reference = findFromBundleById(
              bundle,
              entry.reference!.split('/')[1]
            )?.fullUrl
          })
        } else {
          section.entry?.forEach((entry) => {
            entry.reference = entry.reference!.split('/')[1]
          })
        }
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
