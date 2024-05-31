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

import { findAssignment } from './assignment'
import { SavedBundle, SavedTask, TaskHistory, URLReference } from './fhir'
import { UUID } from './uuid'
import * as fixtures from './fixtures'

it('finds assignment from the latest task', () => {
  const bundle: SavedBundle = {
    resourceType: 'Bundle',
    type: 'document',
    entry: [
      {
        fullUrl: '' as URLReference,
        resource: {
          id: '' as UUID,
          resourceType: 'Task',
          extension: [
            {
              url: 'http://opencrvs.org/specs/extension/regAssigned'
            },
            {
              url: 'http://opencrvs.org/specs/extension/regLastUser',
              valueReference: {
                reference: 'Practitioner/93e34962-cef1-446a-985f-ad0e46732939'
              }
            },
            {
              url: 'http://opencrvs.org/specs/extension/regLastOffice',
              valueReference: {
                reference: 'Location/347ef736-2359-48cc-a513-5b9fae487fb7'
              }
            }
          ],
          businessStatus: {
            coding: [
              {
                system: 'http://opencrvs.org/specs/reg-status',
                code: 'REGISTERED'
              }
            ]
          }
        } as SavedTask
      },
      {
        fullUrl:
          '/fhir/Practitioner/93e34962-cef1-446a-985f-ad0e46732939/_history/dd7a0728-575e-4592-bb87-28996f498ef8' as URLReference,
        resource: fixtures.savedPractitioner({
          id: '93e34962-cef1-446a-985f-ad0e46732939' as UUID
        })
      },
      {
        fullUrl:
          '/fhir/Location/347ef736-2359-48cc-a513-5b9fae487fb7/_history/dd7a0728-575e-4592-bb87-28996f498ef8' as URLReference,
        resource: fixtures.savedLocation({
          id: '347ef736-2359-48cc-a513-5b9fae487fb7' as UUID
        }) as any
      }
    ]
  }

  const { practitioner, office } = findAssignment(bundle) ?? {}
  expect(practitioner!.id).toBe('93e34962-cef1-446a-985f-ad0e46732939')
  expect(office!.id).toBe('347ef736-2359-48cc-a513-5b9fae487fb7')
})

it("finds assignment when it's in TaskHistory and status HAS NOT changed", () => {
  const bundle: SavedBundle = {
    resourceType: 'Bundle',
    type: 'document',
    entry: [
      {
        fullUrl:
          '/fhir/Task/00000000-0000-4000-8000-000000000000/_history/dd7a0728-575e-4592-bb87-28996f498ef8' as URLReference,
        resource: {
          id: '00000000-0000-4000-8000-000000000000' as UUID,
          resourceType: 'Task',
          extension: [
            {
              url: 'http://opencrvs.org/specs/extension/regViewed'
            },
            {
              url: 'http://opencrvs.org/specs/extension/regLastUser',
              valueReference: {
                reference: 'Practitioner/00000000-0000-4000-8000-000000000001'
              }
            },
            {
              url: 'http://opencrvs.org/specs/extension/regLastOffice',
              valueReference: {
                reference: 'Location/00000000-0000-4000-8000-000000000010'
              }
            }
          ],
          businessStatus: {
            coding: [
              {
                system: 'http://opencrvs.org/specs/reg-status',
                code: 'REGISTERED' // Note: status 'REGISTERED'
              }
            ]
          },
          lastModified: '2024-01-01T01:01:01.000Z'
        } as SavedTask
      },
      {
        fullUrl:
          '/fhir/Task/00000000-0000-4000-8000-000000000001/_history/dd7a0728-575e-4592-bb87-28996f498ef8' as URLReference,
        resource: {
          id: '00000000-0000-4000-8000-000000000001' as UUID,
          resourceType: 'TaskHistory',
          extension: [
            {
              url: 'http://opencrvs.org/specs/extension/regViewed'
            },
            {
              url: 'http://opencrvs.org/specs/extension/regLastUser',
              valueReference: {
                reference: 'Practitioner/00000000-0000-4000-8000-000000000002'
              }
            },
            {
              url: 'http://opencrvs.org/specs/extension/regLastOffice',
              valueReference: {
                reference: 'Location/00000000-0000-4000-8000-000000000010'
              }
            }
          ],
          businessStatus: {
            coding: [
              {
                system: 'http://opencrvs.org/specs/reg-status',
                code: 'REGISTERED' // Status stays same: 'REGISTERED'
              }
            ]
          }
        } as TaskHistory
      },
      {
        fullUrl:
          '/fhir/Task/00000000-0000-4000-8000-000000000002/_history/dd7a0728-575e-4592-bb87-28996f498ef8' as URLReference,
        resource: {
          id: '00000000-0000-4000-8000-000000000002' as UUID,
          resourceType: 'TaskHistory',
          extension: [
            {
              url: 'http://opencrvs.org/specs/extension/regAssigned'
            },
            {
              url: 'http://opencrvs.org/specs/extension/regLastUser',
              valueReference: {
                reference: 'Practitioner/93e34962-cef1-446a-985f-ad0e46732939'
              }
            },
            {
              url: 'http://opencrvs.org/specs/extension/regLastOffice',
              valueReference: {
                reference: 'Location/347ef736-2359-48cc-a513-5b9fae487fb7'
              }
            }
          ],
          businessStatus: {
            coding: [
              {
                system: 'http://opencrvs.org/specs/reg-status',
                code: 'REGISTERED' // Status stays same: 'REGISTERED'
              }
            ]
          }
        } as TaskHistory
      },
      {
        fullUrl:
          '/fhir/Practitioner/93e34962-cef1-446a-985f-ad0e46732939/_history/dd7a0728-575e-4592-bb87-28996f498ef8' as URLReference,
        resource: fixtures.savedPractitioner({
          id: '93e34962-cef1-446a-985f-ad0e46732939' as UUID
        })
      },
      {
        fullUrl:
          '/fhir/Location/347ef736-2359-48cc-a513-5b9fae487fb7/_history/dd7a0728-575e-4592-bb87-28996f498ef8' as URLReference,
        resource: fixtures.savedLocation({
          id: '347ef736-2359-48cc-a513-5b9fae487fb7' as UUID
        }) as any
      }
    ]
  }

  const { practitioner, office } = findAssignment(bundle) ?? {}
  expect(practitioner!.id).toBe('93e34962-cef1-446a-985f-ad0e46732939')
  expect(office!.id).toBe('347ef736-2359-48cc-a513-5b9fae487fb7')
})

it("does not find assignment when it's in TaskHistory and status HAS changed", () => {
  const bundle: SavedBundle = {
    resourceType: 'Bundle',
    type: 'document',
    entry: [
      {
        fullUrl:
          '/fhir/Task/00000000-0000-4000-8000-000000000000/_history/dd7a0728-575e-4592-bb87-28996f498ef8' as URLReference,
        resource: {
          id: '00000000-0000-4000-8000-000000000000' as UUID,
          resourceType: 'Task',
          extension: [
            {
              url: 'http://opencrvs.org/specs/extension/regViewed'
            },
            {
              url: 'http://opencrvs.org/specs/extension/regLastUser',
              valueReference: {
                reference: 'Practitioner/00000000-0000-4000-8000-000000000001'
              }
            },
            {
              url: 'http://opencrvs.org/specs/extension/regLastOffice',
              valueReference: {
                reference: 'Location/00000000-0000-4000-8000-000000000010'
              }
            }
          ],
          businessStatus: {
            coding: [
              {
                system: 'http://opencrvs.org/specs/reg-status',
                code: 'CERTIFIED' // Note: status 'CERTIFIED'
              }
            ]
          },
          lastModified: '2024-01-01T01:01:01.000Z'
        } as SavedTask
      },
      {
        fullUrl:
          '/fhir/Task/00000000-0000-4000-8000-000000000001/_history/dd7a0728-575e-4592-bb87-28996f498ef8' as URLReference,
        resource: {
          id: '00000000-0000-4000-8000-000000000001' as UUID,
          resourceType: 'TaskHistory',
          extension: [
            {
              url: 'http://opencrvs.org/specs/extension/regViewed'
            },
            {
              url: 'http://opencrvs.org/specs/extension/regLastUser',
              valueReference: {
                reference: 'Practitioner/00000000-0000-4000-8000-000000000002'
              }
            },
            {
              url: 'http://opencrvs.org/specs/extension/regLastOffice',
              valueReference: {
                reference: 'Location/00000000-0000-4000-8000-000000000010'
              }
            }
          ],
          businessStatus: {
            coding: [
              {
                system: 'http://opencrvs.org/specs/reg-status',
                code: 'REGISTERED' // !!! Status changes: 'REGISTERED'
              }
            ]
          }
        } as TaskHistory
      },
      {
        fullUrl:
          '/fhir/Task/00000000-0000-4000-8000-000000000002/_history/dd7a0728-575e-4592-bb87-28996f498ef8' as URLReference,
        resource: {
          id: '00000000-0000-4000-8000-000000000002' as UUID,
          resourceType: 'Task',
          extension: [
            {
              url: 'http://opencrvs.org/specs/extension/regAssigned'
            },
            {
              url: 'http://opencrvs.org/specs/extension/regLastUser',
              valueReference: {
                reference: 'Practitioner/93e34962-cef1-446a-985f-ad0e46732939'
              }
            },
            {
              url: 'http://opencrvs.org/specs/extension/regLastOffice',
              valueReference: {
                reference: 'Location/347ef736-2359-48cc-a513-5b9fae487fb7'
              }
            }
          ],
          businessStatus: {
            coding: [
              {
                system: 'http://opencrvs.org/specs/reg-status',
                code: 'REGISTERED' // Status stays same: 'REGISTERED'
              }
            ]
          }
        } as SavedTask
      },
      {
        fullUrl:
          '/fhir/Practitioner/93e34962-cef1-446a-985f-ad0e46732939/_history/dd7a0728-575e-4592-bb87-28996f498ef8' as URLReference,
        resource: fixtures.savedPractitioner({
          id: '93e34962-cef1-446a-985f-ad0e46732939' as UUID
        })
      },
      {
        fullUrl:
          '/fhir/Location/347ef736-2359-48cc-a513-5b9fae487fb7/_history/dd7a0728-575e-4592-bb87-28996f498ef8' as URLReference,
        resource: fixtures.savedLocation({
          id: '347ef736-2359-48cc-a513-5b9fae487fb7' as UUID
        }) as any
      }
    ]
  }

  const { practitioner, office } = findAssignment(bundle) ?? {}
  expect(practitioner?.id).toBeFalsy()
  expect(office?.id).toBeFalsy()
})

it("does not find assignment when it's in TaskHistory and status has afterwards changed to regUnassigned", () => {
  const bundle: SavedBundle = {
    resourceType: 'Bundle',
    type: 'document',
    entry: [
      {
        fullUrl:
          '/fhir/Task/00000000-0000-4000-8000-000000000000/_history/dd7a0728-575e-4592-bb87-28996f498ef8' as URLReference,
        resource: {
          id: '00000000-0000-4000-8000-000000000000' as UUID,
          resourceType: 'Task',
          extension: [
            {
              url: 'http://opencrvs.org/specs/extension/regViewed'
            },
            {
              url: 'http://opencrvs.org/specs/extension/regLastUser',
              valueReference: {
                reference: 'Practitioner/00000000-0000-4000-8000-000000000001'
              }
            },
            {
              url: 'http://opencrvs.org/specs/extension/regLastOffice',
              valueReference: {
                reference: 'Location/00000000-0000-4000-8000-000000000010'
              }
            }
          ],
          businessStatus: {
            coding: [
              {
                system: 'http://opencrvs.org/specs/reg-status',
                code: 'REGISTERED' // Note: status 'CERTIFIED'
              }
            ]
          },
          lastModified: '2024-01-01T01:01:01.000Z'
        } as SavedTask
      },
      {
        fullUrl:
          '/fhir/Task/00000000-0000-4000-8000-000000000001/_history/dd7a0728-575e-4592-bb87-28996f498ef8' as URLReference,
        resource: {
          id: '00000000-0000-4000-8000-000000000001' as UUID,
          resourceType: 'TaskHistory',
          extension: [
            {
              url: 'http://opencrvs.org/specs/extension/regUnassigned'
            },
            {
              url: 'http://opencrvs.org/specs/extension/regLastUser',
              valueReference: {
                reference: 'Practitioner/00000000-0000-4000-8000-000000000002'
              }
            },
            {
              url: 'http://opencrvs.org/specs/extension/regLastOffice',
              valueReference: {
                reference: 'Location/00000000-0000-4000-8000-000000000010'
              }
            }
          ],
          businessStatus: {
            coding: [
              {
                system: 'http://opencrvs.org/specs/reg-status',
                code: 'REGISTERED' // Status says the same
              }
            ]
          }
        } as TaskHistory
      },
      {
        fullUrl:
          '/fhir/Task/00000000-0000-4000-8000-000000000002/_history/dd7a0728-575e-4592-bb87-28996f498ef8' as URLReference,
        resource: {
          id: '00000000-0000-4000-8000-000000000002' as UUID,
          resourceType: 'Task',
          extension: [
            {
              url: 'http://opencrvs.org/specs/extension/regAssigned'
            },
            {
              url: 'http://opencrvs.org/specs/extension/regLastUser',
              valueReference: {
                reference: 'Practitioner/93e34962-cef1-446a-985f-ad0e46732939'
              }
            },
            {
              url: 'http://opencrvs.org/specs/extension/regLastOffice',
              valueReference: {
                reference: 'Location/347ef736-2359-48cc-a513-5b9fae487fb7'
              }
            }
          ],
          businessStatus: {
            coding: [
              {
                system: 'http://opencrvs.org/specs/reg-status',
                code: 'REGISTERED' // Status says the same
              }
            ]
          }
        } as SavedTask
      },
      {
        fullUrl:
          '/fhir/Practitioner/93e34962-cef1-446a-985f-ad0e46732939/_history/dd7a0728-575e-4592-bb87-28996f498ef8' as URLReference,
        resource: fixtures.savedPractitioner({
          id: '93e34962-cef1-446a-985f-ad0e46732939' as UUID
        })
      },
      {
        fullUrl:
          '/fhir/Location/347ef736-2359-48cc-a513-5b9fae487fb7/_history/dd7a0728-575e-4592-bb87-28996f498ef8' as URLReference,
        resource: fixtures.savedLocation({
          id: '347ef736-2359-48cc-a513-5b9fae487fb7' as UUID
        }) as any
      }
    ]
  }

  const { practitioner, office } = findAssignment(bundle) ?? {}
  expect(practitioner?.id).toBeFalsy()
  expect(office?.id).toBeFalsy()
})
