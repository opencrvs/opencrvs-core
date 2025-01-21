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
import { SavedTask, TrackingID } from '@opencrvs/commons/types'
import { createRegisterTask } from './fhir'
import { UUID } from '@opencrvs/commons'

describe('https://github.com/opencrvs/opencrvs-core/issues/8278', () => {
  /*
   * It's possible that a user for instance "views" a record between the record being set to WAITING_VALIDATION and the record being set to REGISTERED.
   * In this case the "previous task" that the registration confirmation uses will have different values from expected.
   * This test ensures that the new task will not have null values if this happens.
   */
  test('create register task produces an extension array with a pre-existing timeLoggedMS extension from the previous task if such extension exists', () => {
    const previousTask: SavedTask = {
      resourceType: 'Task',
      status: 'ready',
      intent: 'proposal',
      code: {
        coding: [
          {
            system: 'http://opencrvs.org/specs/types',
            code: 'BIRTH'
          }
        ]
      },
      focus: {
        reference:
          'Composition/1a738c6a-2dfe-4fad-96c8-597834692b07' as `Composition/${UUID}`
      },
      id: '11af7c9c-8d57-4e83-9c83-93e28725da41' as UUID,
      requester: {
        agent: {
          reference:
            'Practitioner/c3647cf0-4abc-4fa1-896c-91fa7be2ac05' as `Practitioner/${UUID}`
        }
      },
      identifier: [
        {
          system: 'http://opencrvs.org/specs/id/draft-id',
          value: 'b21428dd-6fd8-41bc-aae5-651db50596d2' as TrackingID
        },
        {
          system: 'http://opencrvs.org/specs/id/birth-tracking-id',
          value: 'BJ5AGDQ' as TrackingID
        }
      ],
      extension: [
        {
          url: 'http://opencrvs.org/specs/extension/informants-signature',
          valueString:
            '/ocrvs/00376d63-2b3f-4e26-890a-e70fad1403f3.png' as `ocrvs/${UUID}.png`
        },
        {
          url: 'http://opencrvs.org/specs/extension/contact-person-email',
          valueString: 'informant@example.com'
        },
        {
          url: 'http://opencrvs.org/specs/extension/timeLoggedMS',
          valueInteger: 0
        },
        {
          url: 'http://opencrvs.org/specs/extension/regLastUser',
          valueReference: {
            reference:
              'Practitioner/c3647cf0-4abc-4fa1-896c-91fa7be2ac05' as `Practitioner/${UUID}`
          }
        },
        {
          url: 'http://opencrvs.org/specs/extension/regLastOffice',
          valueReference: {
            reference:
              'Location/7ae08280-d387-494a-9f1c-52f90f1b6bd0' as `Location/${UUID}`
          }
        }
      ],
      lastModified: '2025-01-08T01:57:45.455Z',
      businessStatus: {
        coding: [
          {
            system: 'http://opencrvs.org/specs/reg-status',
            code: 'WAITING_VALIDATION'
          }
        ]
      },
      meta: {
        lastUpdated: '2025-01-08T01:57:45.492+00:00',
        versionId: '9d39e624-9af6-455a-bdce-8d8e75b8d7d9'
      }
    }
    expect(createRegisterTask(previousTask).extension).toStrictEqual([
      {
        url: 'http://opencrvs.org/specs/extension/informants-signature',
        valueString: '/ocrvs/00376d63-2b3f-4e26-890a-e70fad1403f3.png'
      },
      {
        url: 'http://opencrvs.org/specs/extension/contact-person-email',
        valueString: 'informant@example.com'
      },
      {
        url: 'http://opencrvs.org/specs/extension/timeLoggedMS',
        valueInteger: 0
      }
    ])

    const previousTaskWithNoTimeLoggedMS = {
      ...previousTask,
      extension: previousTask.extension.filter(
        (extension) =>
          extension.url !== 'http://opencrvs.org/specs/extension/timeLoggedMS'
      )
    }
    expect(
      createRegisterTask(previousTaskWithNoTimeLoggedMS).extension
    ).toStrictEqual([
      {
        url: 'http://opencrvs.org/specs/extension/informants-signature',
        valueString: '/ocrvs/00376d63-2b3f-4e26-890a-e70fad1403f3.png'
      },
      {
        url: 'http://opencrvs.org/specs/extension/contact-person-email',
        valueString: 'informant@example.com'
      }
      // undefined – this appeared here previously
    ])
  })
})
