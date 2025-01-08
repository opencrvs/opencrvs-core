import { TrackingID } from '@opencrvs/commons/types'
import { createRegisterTask } from './fhir'
import { UUID } from '@opencrvs/commons'

describe('https://github.com/opencrvs/opencrvs-core/issues/8278', () => {
  /*
   * It's possible that a user for instance "views" a record between the record being set to WAITING_VALIDATION and the record being set to REGISTERED.
   * In this case the "previous task" that the registration confirmation uses will have different values from expected.
   * This test ensures that the new task will not have null values if this happens.
   */
  test('create register task never produces an extension array with null values even when there is no timeLoggedMS extension in the previous task', () => {
    const previousTask = createRegisterTask({
      resourceType: 'Task',
      status: 'ready',
      intent: 'proposal',
      code: {
        coding: [{ system: 'http://opencrvs.org/specs/types', code: 'BIRTH' }]
      },
      focus: {
        reference:
          'Composition/1a738c6a-2dfe-4fad-96c8-597834692b07' as `Composition/${UUID}`
      },
      id: '11af7c9c-8d57-4e83-9c83-93e28725da41' as UUID,
      requester: {
        agent: {
          reference: 'Practitioner/c3647cf0-4abc-4fa1-896c-91fa7be2ac05'
        }
      },
      identifier: [
        {
          system: 'http://opencrvs.org/specs/id/draft-id',
          value: 'b21428dd-6fd8-41bc-aae5-651db50596d2'
        },
        {
          system: 'http://opencrvs.org/specs/id/birth-tracking-id',
          value: 'BJ5AGDQ' as TrackingID
        }
      ],
      extension: [
        {
          url: 'http://opencrvs.org/specs/extension/informants-signature',
          valueString: '/ocrvs/00376d63-2b3f-4e26-890a-e70fad1403f3.png'
        },
        {
          url: 'http://opencrvs.org/specs/extension/contact-person-email',
          valueString: 'informant@example.com'
        },
        { url: 'http://opencrvs.org/specs/extension/regViewed' },
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
      lastModified: '2025-01-08T01:58:16.334Z',
      businessStatus: {
        coding: [
          {
            system: 'http://opencrvs.org/specs/reg-status',
            code: 'WAITING_VALIDATION'
          }
        ]
      },
      meta: {
        lastUpdated: '2025-01-08T01:57:56.335+00:00',
        versionId: '74e0b495-0e83-402e-b968-463f3db2e25b' as UUID
      }
    })
    expect(previousTask).toStrictEqual({
      resourceType: 'Task',
      status: 'ready',
      intent: 'proposal',
      code: {
        coding: [{ system: 'http://opencrvs.org/specs/types', code: 'BIRTH' }]
      },
      focus: { reference: 'Composition/1a738c6a-2dfe-4fad-96c8-597834692b07' },
      id: '11af7c9c-8d57-4e83-9c83-93e28725da41',
      requester: {
        agent: {
          reference: 'Practitioner/c3647cf0-4abc-4fa1-896c-91fa7be2ac05'
        }
      },
      identifier: [
        {
          system: 'http://opencrvs.org/specs/id/draft-id',
          value: 'b21428dd-6fd8-41bc-aae5-651db50596d2'
        },
        {
          system: 'http://opencrvs.org/specs/id/birth-tracking-id',
          value: 'BJ5AGDQ'
        }
        // undefined – this appeared here previously
      ],
      extension: [
        {
          url: 'http://opencrvs.org/specs/extension/informants-signature',
          valueString: '/ocrvs/00376d63-2b3f-4e26-890a-e70fad1403f3.png'
        },
        {
          url: 'http://opencrvs.org/specs/extension/contact-person-email',
          valueString: 'informant@example.com'
        }
      ],
      lastModified: expect.any(String),
      note: undefined,
      businessStatus: {
        coding: [
          { system: 'http://opencrvs.org/specs/reg-status', code: 'REGISTERED' }
        ]
      },
      meta: {
        lastUpdated: expect.any(String),
        versionId: '74e0b495-0e83-402e-b968-463f3db2e25b'
      }
    })
  })
})
