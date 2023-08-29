import { isTask } from './fhir'
import {
  RecordWithPreviousTask,
  ValidRecord,
  withOnlyLatestTask
} from './record'

describe('when a record has more than one task entity', () => {
  describe('withOnlyLatestTask utility', () => {
    it('removes all except for the latest task from bundle in the case there are more than one', () => {
      const newBundle = withOnlyLatestTask({
        resourceType: 'Bundle',
        type: 'document',
        entry: [REJECTED_TASK, RESTORE_PREVIOUS_STATUS_TASK]
      } as any as RecordWithPreviousTask<ValidRecord>)
      expect(
        newBundle.entry.filter((entry) => isTask(entry.resource)).length
      ).toEqual(1)
      expect(newBundle.entry.find((entry) => isTask(entry.resource))).toEqual(
        RESTORE_PREVIOUS_STATUS_TASK
      )
    })
  })
})

const REJECTED_TASK = {
  resource: {
    resourceType: 'Task',
    status: 'rejected',
    intent: 'proposal',
    code: {
      coding: [{ system: 'http://opencrvs.org/specs/types', code: 'BIRTH' }]
    },
    focus: {
      reference: 'Composition/e46e7422-e391-4d54-b9a9-303ee0d8523b'
    },
    id: '55ddff24-f7cb-4a35-8e86-309654e37c0f',
    encounter: {
      reference: 'Encounter/b60784c6-cc80-4597-ae28-148e0cc265c5'
    },
    identifier: [
      {
        system: 'http://opencrvs.org/specs/id/draft-id',
        value: '03d087a0-1e20-4443-aca3-d48461d4d597'
      },
      {
        system: 'http://opencrvs.org/specs/id/birth-tracking-id',
        value: 'BP1VBEJ'
      },
      {
        system: 'http://opencrvs.org/specs/id/birth-registration-number',
        value: '2023BP1VBEJ'
      }
    ],
    extension: [
      {
        url: 'http://opencrvs.org/specs/extension/informants-signature',
        valueString: '/ocrvs/8d6df3d6-ec58-4e1c-b0ac-9b4ba33ba42a.png'
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
        url: 'http://opencrvs.org/specs/extension/noSupportingDocumentationRequired',
        valueBoolean: false
      },
      {
        url: 'http://opencrvs.org/specs/extension/requestingIndividual',
        valueString: 'FATHER'
      },
      {
        url: 'http://opencrvs.org/specs/extension/hasShowedVerifiedDocument',
        valueBoolean: true
      },
      {
        url: 'http://opencrvs.org/specs/extension/regLastUser',
        valueReference: {
          reference: 'Practitioner/7dc24408-d409-4ec0-bd9d-4a5aa817dcab'
        }
      },
      {
        url: 'http://opencrvs.org/specs/extension/regLastLocation',
        valueReference: {
          reference: 'Location/d8d16138-1d3a-42e7-bf85-d7f3f657c5d3'
        }
      },
      {
        url: 'http://opencrvs.org/specs/extension/regLastOffice',
        valueString: 'Ibombo District Office',
        valueReference: {
          reference: 'Location/61e07903-bf3c-4bd9-9b20-6cf0e3bb982c'
        }
      }
    ],
    input: [
      {
        valueCode: 'child',
        valueId: 'firstNamesEng',
        type: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/action-type',
              code: 'update'
            }
          ]
        },
        valueString: 'John Cena'
      }
    ],
    reason: { text: 'Not good!' },
    note: [{ text: '' }],
    lastModified: '2023-08-29T14:38:07.940Z',
    businessStatus: {
      coding: [
        {
          system: 'http://opencrvs.org/specs/reg-status',
          code: 'CORRECTION_REQUESTED'
        }
      ]
    },
    meta: {
      lastUpdated: '2023-08-29T14:38:08.061+00:00',
      versionId: '798f86c6-7030-4f0b-86e2-e12444b50ffe'
    },
    _transforms: {
      meta: { lastUpdated: '2023-08-29T14:38:08.061Z' }
    },
    _request: { method: 'PUT' }
  }
}

const RESTORE_PREVIOUS_STATUS_TASK = {
  resource: {
    resourceType: 'Task',
    status: 'ready',
    code: {
      coding: [{ system: 'http://opencrvs.org/specs/types', code: 'BIRTH' }]
    },
    focus: {
      reference: 'Composition/e46e7422-e391-4d54-b9a9-303ee0d8523b'
    },
    identifier: [
      {
        system: 'http://opencrvs.org/specs/id/draft-id',
        value: '03d087a0-1e20-4443-aca3-d48461d4d597'
      },
      {
        system: 'http://opencrvs.org/specs/id/birth-tracking-id',
        value: 'BP1VBEJ'
      },
      {
        system: 'http://opencrvs.org/specs/id/birth-registration-number',
        value: '2023BP1VBEJ'
      }
    ],
    extension: [
      {
        url: 'http://opencrvs.org/specs/extension/informants-signature',
        valueString: '/ocrvs/8d6df3d6-ec58-4e1c-b0ac-9b4ba33ba42a.png'
      },
      {
        url: 'http://opencrvs.org/specs/extension/contact-person',
        valueString: 'MOTHER'
      },
      {
        url: 'http://opencrvs.org/specs/extension/contact-person-phone-number',
        valueString: '+260745645645'
      },
      {
        url: 'http://opencrvs.org/specs/extension/contact-person-email',
        valueString: 'informant@example.com'
      },
      {
        url: 'http://opencrvs.org/specs/extension/timeLoggedMS',
        valueInteger: 1033703
      },
      {
        url: 'http://opencrvs.org/specs/extension/regLastUser',
        valueReference: {
          reference: 'Practitioner/7dc24408-d409-4ec0-bd9d-4a5aa817dcab'
        }
      },
      {
        url: 'http://opencrvs.org/specs/extension/regLastLocation',
        valueReference: {
          reference: 'Location/d8d16138-1d3a-42e7-bf85-d7f3f657c5d3'
        }
      },
      {
        url: 'http://opencrvs.org/specs/extension/regLastOffice',
        valueString: 'Ibombo District Office',
        valueReference: {
          reference: 'Location/61e07903-bf3c-4bd9-9b20-6cf0e3bb982c'
        }
      },
      { url: 'http://opencrvs.org/specs/extension/regAssigned' }
    ],
    note: [
      {
        text: 'Both mother and father were present',
        time: '2023-08-28T07:10:26.735Z',
        authorString: 'Practitioner/7dc24408-d409-4ec0-bd9d-4a5aa817dcab'
      }
    ],
    lastModified: '2023-08-29T15:37:33.733Z',
    businessStatus: {
      coding: [
        {
          system: 'http://opencrvs.org/specs/reg-status',
          code: 'REGISTERED'
        }
      ]
    },
    meta: {
      lastUpdated: '2023-08-29T15:37:33.850+00:00',
      versionId: 'd5f4b878-d811-44fd-9470-182bede7182c'
    },
    id: '55ddff24-f7cb-4a35-8e86-309654e37c0f'
  }
}
