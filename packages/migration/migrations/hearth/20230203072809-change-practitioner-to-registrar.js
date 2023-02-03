/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */

/*
 * This migration changes "practitioner" references to the person who
 * registered the record from whomever was the first to touch it
 */

export const up = async (db, client) => {
  await db
    .collection('Task')
    .aggregate(
      [
        { $unwind: '$businessStatus.coding' },
        {
          $match: {
            'businessStatus.coding.code': { $in: ['CERTIFIED', 'REGISTERED'] }
          }
        },
        {
          $addFields: {
            compositionId: {
              $arrayElemAt: [{ $split: ['$focus.reference', '/'] }, 1]
            }
          }
        },
        {
          $lookup: {
            from: 'Composition',
            localField: 'compositionId',
            foreignField: 'id',
            as: 'composition'
          }
        },
        { $unwind: '$composition' },
        { $addFields: { 'composition.latestTask': '$$ROOT' } },
        { $replaceRoot: { newRoot: '$composition' } },
        {
          $addFields: {
            extensions: {
              $arrayToObject: {
                $map: {
                  input: '$section',
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
                          $arrayElemAt: [
                            { $split: ['$$firstElement.reference', '/'] },
                            1
                          ]
                        }
                      }
                    }
                  ]
                }
              }
            }
          }
        },
        {
          $lookup: {
            from: 'Task',
            localField: 'latestTask.focus.reference',
            foreignField: 'focus.reference',
            as: 'task'
          }
        },
        {
          $lookup: {
            from: 'Task_history',
            localField: 'latestTask.focus.reference',
            foreignField: 'focus.reference',
            as: 'task_history'
          }
        },
        {
          $addFields: {
            allTasks: { $concatArrays: ['$task', '$task_history'] }
          }
        },
        {
          $addFields: {
            registerTask: {
              $arrayElemAt: [
                {
                  $filter: {
                    input: '$allTasks',
                    cond: {
                      $eq: [
                        'REGISTERED',
                        {
                          $let: {
                            vars: {
                              coding: {
                                $arrayElemAt: [
                                  '$$this.businessStatus.coding',
                                  0
                                ]
                              }
                            },
                            in: '$$coding.code'
                          }
                        }
                      ]
                    }
                  }
                },
                0
              ]
            },
            firstTask: {
              $arrayElemAt: [
                {
                  $filter: {
                    input: '$allTasks',
                    cond: {
                      $eq: [
                        {
                          $min: '$allTasks.meta.lastUpdated'
                        },
                        '$$this.meta.lastUpdated'
                      ]
                    }
                  }
                },
                0
              ]
            }
          }
        },
        {
          $addFields: {
            'firstTask.extensionsObject': {
              $arrayToObject: {
                $map: {
                  input: '$firstTask.extension',
                  as: 'el',
                  in: [
                    {
                      $replaceOne: {
                        input: '$$el.url',
                        find: 'http://opencrvs.org/specs/extension/',
                        replacement: ''
                      }
                    },
                    {
                      $arrayElemAt: [
                        { $split: ['$$el.valueReference.reference', '/'] },
                        1
                      ]
                    }
                  ]
                }
              }
            },
            'registerTask.extensionsObject': {
              $arrayToObject: {
                $map: {
                  input: '$registerTask.extension',
                  as: 'el',
                  in: [
                    {
                      $replaceOne: {
                        input: '$$el.url',
                        find: 'http://opencrvs.org/specs/extension/',
                        replacement: ''
                      }
                    },
                    {
                      $arrayElemAt: [
                        { $split: ['$$el.valueReference.reference', '/'] },
                        1
                      ]
                    }
                  ]
                }
              }
            }
          }
        },
        {
          $lookup: {
            from: 'Patient',
            localField: 'extensions.mother-details',
            foreignField: 'id',
            as: 'mother'
          }
        },
        {
          $lookup: {
            from: 'Patient',
            localField: 'extensions.mother-details',
            foreignField: 'id',
            as: 'mother'
          }
        },
        {
          $lookup: {
            from: 'Patient',
            localField: 'extensions.father-details',
            foreignField: 'id',
            as: 'father'
          }
        },
        {
          $lookup: {
            from: 'Encounter',
            localField: 'extensions.birth-encounter',
            foreignField: 'id',
            as: 'encounter'
          }
        },
        { $unwind: '$encounter' },
        { $unwind: '$encounter.location' },
        {
          $addFields: {
            placeOfBirthLocationId: {
              $replaceOne: {
                input: '$encounter.location.location.reference',
                find: 'Location/',
                replacement: ''
              }
            }
          }
        },
        {
          $addFields: {
            encounterIdForJoining: { $concat: ['Encounter/', '$encounter.id'] }
          }
        },
        {
          $lookup: {
            from: 'Observation',
            localField: 'encounterIdForJoining',
            foreignField: 'context.reference',
            as: 'observations'
          }
        },
        {
          $addFields: {
            birthTypeObservation: {
              $filter: {
                input: '$observations',
                as: 'element',
                cond: {
                  $eq: [
                    {
                      $let: {
                        vars: {
                          firstElement: {
                            $arrayElemAt: ['$$element.code.coding', 0]
                          }
                        },
                        in: '$$firstElement.code'
                      }
                    },
                    '57722-1'
                  ]
                }
              }
            }
          }
        },
        { $unwind: '$birthTypeObservation' },
        {
          $lookup: {
            from: 'Location',
            localField: 'placeOfBirthLocationId',
            foreignField: 'id',
            as: 'placeOfBirthLocation'
          }
        },
        {
          $lookup: {
            from: 'Patient',
            localField: 'extensions.child-details',
            foreignField: 'id',
            as: 'child'
          }
        },
        { $unwind: '$mother' },
        { $unwind: '$father' },
        { $unwind: '$child' },
        { $unwind: '$placeOfBirthLocation' },
        {
          $addFields: {
            childsAgeInDaysAtDeclaration: {
              $divide: [
                {
                  $subtract: [
                    { $toDate: '$date' },
                    { $toDate: '$child.birthDate' }
                  ]
                },
                1000 * 60 * 60 * 24
              ]
            },
            mothersAgeAtBirthOfChild: {
              $divide: [
                {
                  $subtract: [
                    { $toDate: '$child.birthDate' },
                    { $toDate: '$mother.birthDate' }
                  ]
                },
                1000 * 60 * 60 * 24 * 365
              ]
            },
            placeOfBirthType: {
              $arrayElemAt: ['$placeOfBirthLocation.type.coding.code', 0]
            },
            'mother.extensionsObject': {
              $arrayToObject: {
                $map: {
                  input: '$mother.extension',
                  as: 'el',
                  in: [
                    {
                      $replaceOne: {
                        input: '$$el.url',
                        find: 'http://opencrvs.org/specs/extension/',
                        replacement: ''
                      }
                    },
                    '$$el.valueString'
                  ]
                }
              }
            },
            'father.extensionsObject': {
              $arrayToObject: {
                $map: {
                  input: '$father.extension',
                  as: 'el',
                  in: [
                    {
                      $replaceOne: {
                        input: '$$el.url',
                        find: 'http://opencrvs.org/specs/extension/',
                        replacement: ''
                      }
                    },
                    '$$el.valueString'
                  ]
                }
              }
            }
          }
        },
        {
          $lookup: {
            from: 'Practitioner',
            localField: 'registerTask.extensionsObject.regLastUser',
            foreignField: 'id',
            as: 'practitioner'
          }
        },
        { $unwind: '$practitioner' },
        { $unwind: '$practitioner.name' },
        {
          $addFields: {
            practitionerRoleForJoining: {
              $concat: ['Practitioner/', '$practitioner.id']
            },
            practitionerFirstname: {
              $reduce: {
                input: '$practitioner.name.given',
                initialValue: '',
                in: { $concat: ['$$value', ' ', '$$this'] }
              }
            },
            practitionerFamilyname: {
              $cond: {
                if: {
                  $isArray: '$practitioner.name.family'
                },
                then: {
                  $reduce: {
                    input: '$practitioner.name.family',
                    initialValue: '',
                    in: { $concat: ['$$value', ' ', '$$this'] }
                  }
                },
                else: '$practitioner.name.family'
              }
            }
          }
        },
        {
          $lookup: {
            from: 'PractitionerRole',
            localField: 'practitionerRoleForJoining',
            foreignField: 'practitioner.reference',
            as: 'practitionerRole'
          }
        },
        { $unwind: '$practitionerRole' },
        { $unwind: '$practitionerRole.code' },
        { $unwind: '$practitionerRole.code.coding' },
        {
          $match: {
            'practitionerRole.code.coding.system':
              'http://opencrvs.org/specs/titles'
          }
        },
        {
          $lookup: {
            from: 'Location',
            localField: 'firstTask.extensionsObject.regLastOffice',
            foreignField: 'id',
            as: 'office'
          }
        },
        { $unwind: '$office' },
        {
          $addFields: {
            'office.lga': {
              $arrayElemAt: [{ $split: ['$office.partOf.reference', '/'] }, 1]
            }
          }
        },
        {
          $lookup: {
            from: 'Location',
            localField: 'office.lga',
            foreignField: 'id',
            as: 'lga'
          }
        },
        { $unwind: '$lga' },
        {
          $addFields: {
            'lga.state': {
              $arrayElemAt: [{ $split: ['$lga.partOf.reference', '/'] }, 1]
            }
          }
        },
        {
          $lookup: {
            from: 'Location',
            localField: 'lga.state',
            foreignField: 'id',
            as: 'state'
          }
        },
        { $unwind: '$state' },
        {
          $project: {
            _id: 1,
            id: 1,
            event: 'Birth',
            mothersLiteracy: '$mother.extensionsObject.literacy',
            fathersLiteracy: '$father.extensionsObject.literacy',
            mothersEducationalAttainment:
              '$mother.extensionsObject.educational-attainment',
            fathersEducationalAttainment:
              '$father.extensionsObject.educational-attainment',
            gender: '$child.gender',
            birthOrder: '$child.multipleBirthInteger',
            createdBy: '$firstTask.extensionsObject.regLastUser',
            officeName: '$office.name',
            lgaName: '$lga.name',
            stateName: '$state.name',
            createdAt: {
              $dateFromString: { dateString: '$firstTask.lastModified' }
            },
            practitionerRole: 1,
            status: '$latestTask.businessStatus.coding.code',
            childsAgeInDaysAtDeclaration: 1,
            birthType: '$birthTypeObservation.valueQuantity.value',
            mothersAgeAtBirthOfChildInYears: '$mothersAgeAtBirthOfChild',
            placeOfBirthType: 1,
            practitionerRole: '$practitionerRole.code.coding.code',
            practitionerName: {
              $concat: [
                '$practitionerFamilyname',
                ', ',
                '$practitionerFirstname'
              ]
            }
          }
        },
        {
          $out: {
            db: 'analytics',
            coll: 'registrations'
          }
        }
      ],
      { allowDiskUse: true }
    )
    .toArray()
}

export const down = async (db, client) => {}
