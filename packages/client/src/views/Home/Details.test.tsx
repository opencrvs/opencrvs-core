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
import * as React from 'react'
import {
  createTestComponent,
  mockUserResponse,
  fieldAgentScopeToken,
  registerScopeToken
} from '@client/tests/util'

import { FETCH_REGISTRATION_BY_COMPOSITION } from '@client/views/Home/queries'
import { queries } from '@client/profile/queries'
import { merge } from 'lodash'
import { storage } from '@client/storage'
import { createStore } from '@client/store'
import { FIELD_AGENT_ROLES, REGISTRAR_ROLES } from '@client/utils/constants'
import { checkAuth } from '@client/profile/profileActions'
import { Details } from '@client/views/Home/Details'
import {
  createApplication,
  storeApplication,
  modifyApplication,
  SUBMISSION_STATUS,
  IApplication
} from '@client/applications'
import { Event } from '@client/forms'
import { GET_BIRTH_REGISTRATION_FOR_REVIEW } from '@client/views/DataProvider/birth/queries'
import { GET_DEATH_REGISTRATION_FOR_CERTIFICATION } from '@client/views/DataProvider/death/queries'

const getItem = window.localStorage.getItem as jest.Mock
const mockFetchUserDetails = jest.fn()

const registrarNameObj = {
  data: {
    getUser: {
      name: [
        {
          use: 'en',
          firstNames: 'Mohammad',
          familyName: 'Ashraful',
          __typename: 'HumanName'
        },
        { use: 'bn', firstNames: '', familyName: '', __typename: 'HumanName' }
      ],
      role: REGISTRAR_ROLES[0]
    }
  }
}

const nameObj = {
  data: {
    getUser: {
      name: [
        {
          use: 'en',
          firstNames: 'Sakib',
          familyName: 'Al Hasan',
          __typename: 'HumanName'
        },
        { use: 'bn', firstNames: '', familyName: '', __typename: 'HumanName' }
      ],
      role: FIELD_AGENT_ROLES[0],
      practitionerId: '43ac3486-7df1-4bd9-9b5e-728054ccd6ba'
    }
  }
}

const defaultStatus = {
  id: '17e9b24-b00f-4a0f-a5a4-9c84c6e64e98/_history/86c3044a-329f-418',
  timestamp: '2019-04-03T07:08:24.936Z',
  user: {
    id: '153f8364-96b3-4b90-8527-bf2ec4a367bd',
    name: [
      {
        use: 'en',
        firstNames: 'Sakib',
        familyName: 'Al Hasan'
      },
      {
        use: 'bn',
        firstNames: '',
        familyName: ''
      }
    ],
    role: FIELD_AGENT_ROLES[0]
  },
  location: {
    id: '123',
    name: 'Kaliganj Union Sub Center',
    alias: ['']
  },
  office: {
    id: '123',
    name: 'Kaliganj Union Sub Center',
    alias: [''],
    address: {
      district: '7876',
      state: 'iuyiuy'
    }
  },
  type: 'DECLARED',
  comments: null
}

const registrarDefaultStatus = {
  id: '17e9b24-b00f-4a0f-a5a4-9c84c6e64e98/_history/86c3044a-329f-418',
  timestamp: '2019-04-03T07:08:24.936Z',
  user: {
    id: '153f8364-96b3-4b90-8527-bf2ec4a367bd',
    name: [
      {
        use: 'en',
        firstNames: 'Sakib',
        familyName: 'Al Hasan'
      },
      {
        use: 'bn',
        firstNames: '',
        familyName: ''
      }
    ],
    role: FIELD_AGENT_ROLES[0]
  },
  location: {
    id: '123',
    name: 'Kaliganj Union Sub Center',
    alias: ['']
  },
  office: {
    id: '123',
    name: 'Kaliganj Union Sub Center',
    alias: [''],
    address: {
      district: '7876',
      state: 'iuyiuy'
    }
  },
  type: 'DECLARED',
  comments: null
}

storage.getItem = jest.fn()
storage.setItem = jest.fn()

describe('Field Agnet tests', () => {
  const { store } = createStore()

  beforeAll(async () => {
    merge(mockUserResponse, nameObj)
    mockFetchUserDetails.mockReturnValue(mockUserResponse)
    queries.fetchUserDetails = mockFetchUserDetails
    getItem.mockReturnValue(fieldAgentScopeToken)
    await store.dispatch(checkAuth({ '?token': fieldAgentScopeToken }))
  })

  it('loads properly for draft application with create row', async () => {
    const draft: IApplication = createApplication(Event.BIRTH)
    draft.compositionId = draft.id
    store.dispatch(storeApplication(draft))
    const testComponent = await createTestComponent(
      // @ts-ignore
      <Details
        match={{
          params: {
            applicationId: draft.id
          },
          isExact: true,
          path: '',
          url: ''
        }}
        location={{
          pathname: '',
          search: '',
          hash: '',
          state: {
            forceDetailsQuery: false
          }
        }}
      />,
      store
    )

    expect(
      testComponent.component.find('#history_row_0_DRAFT_STARTED').hostNodes()
    ).toHaveLength(1)
    expect(
      testComponent.component.find('#history_row_1_DRAFT_MODIFIED').hostNodes()
    ).toHaveLength(0)
  })

  it('loads properly for draft application with create and update row', async () => {
    const draft: IApplication = createApplication(Event.DEATH)
    draft.compositionId = draft.id
    store.dispatch(storeApplication(draft))
    // @ts-ignore
    draft.data.deceased = {
      familyNameEng: 'Anik'
    }
    store.dispatch(modifyApplication(draft))
    const testComponent = await createTestComponent(
      // @ts-ignore
      <Details
        match={{
          params: {
            applicationId: draft.id
          },
          isExact: true,
          path: '',
          url: ''
        }}
        location={{
          pathname: '',
          search: '',
          hash: '',
          state: {
            forceDetailsQuery: false
          }
        }}
      />,
      store
    )

    expect(
      testComponent.component.find('#history_row_0_DRAFT_MODIFIED').hostNodes()
    ).toHaveLength(1)
    expect(
      testComponent.component.find('#history_row_1_DRAFT_STARTED').hostNodes()
    ).toHaveLength(1)
  })
  it('loads properly for submitted draft application', async () => {
    const draft: IApplication = {
      id: 'bfe0d0da-1328-4fd4-81b7-34666700c587',
      data: {
        registration: {
          contactPoint: {
            nestedFields: { registrationPhone: '+8801911111111' }
          }
        },
        deceased: {
          firstNamesEng: '',
          familyNameEng: 'Abdullah',
          firstNames: '',
          familyName: 'আব্দুল্লাহ'
        }
      },
      event: Event.DEATH,
      trackingId: 'D2CDBTD',
      submissionStatus: 'SUBMITTED',
      compositionId: 'bfe0d0da-1328-4fd4-81b7-34666700c587',
      operationHistories: [
        {
          operationType: 'DECLARED',
          operatedOn: '2020-01-22T08:23:56.942Z',
          operatorRole: 'FIELD_AGENT',
          operatorName: [
            {
              firstNames: 'Shakib',
              familyName: 'Al Hasan',
              use: 'en'
            },
            {
              firstNames: 'সাকিব',
              familyName: 'আল হাসান',
              use: 'bn'
            }
          ],
          operatorOfficeName: 'Baniajan Union Parishad',
          operatorOfficeAlias: ['বানিয়াজান ইউনিয়ন পরিষদ']
        }
      ]
    }
    store.dispatch(storeApplication(draft))
    const testComponent = await createTestComponent(
      // @ts-ignore
      <Details
        match={{
          params: {
            applicationId: draft.id
          },
          isExact: true,
          path: '',
          url: ''
        }}
        location={{
          pathname: '',
          search: '',
          hash: '',
          state: {
            forceDetailsQuery: false
          }
        }}
      />,
      store
    )

    expect(
      testComponent.component.find('#history_row_0_DECLARED').hostNodes()
    ).toHaveLength(1)
  })
  it('loads properly for failed application', async () => {
    const draft: IApplication = createApplication(Event.DEATH)
    draft.compositionId = draft.id
    store.dispatch(storeApplication(draft))
    // @ts-ignore
    draft.data.deceased = {
      familyNameEng: 'Anik'
    }
    draft.submissionStatus = SUBMISSION_STATUS[SUBMISSION_STATUS.FAILED]
    store.dispatch(modifyApplication(draft))
    const testComponent = await createTestComponent(
      // @ts-ignore
      <Details
        match={{
          params: {
            applicationId: draft.id
          },
          isExact: true,
          path: '',
          url: ''
        }}
        location={{
          pathname: '',
          search: '',
          hash: '',
          state: {
            forceDetailsQuery: false
          }
        }}
      />,
      store
    )

    expect(
      testComponent.component.find('#history_row_0_FAILED').hostNodes()
    ).toHaveLength(1)
    expect(
      testComponent.component.find('#failed_retry').hostNodes()
    ).toHaveLength(1)
  })
  it('loads properly for sent_for_review application', async () => {
    const graphqlMock = [
      {
        request: {
          query: FETCH_REGISTRATION_BY_COMPOSITION,
          variables: {
            id: '1'
          }
        },
        result: {
          data: {
            fetchRegistration: {
              id: '1',
              child: {
                id: 'FAKE_ID',
                name: [
                  {
                    use: 'en',
                    firstNames: '',
                    familyName: 'Anik'
                  },
                  {
                    use: 'bn',
                    firstNames: '',
                    familyName: 'অনিক'
                  }
                ]
              },
              // TODO: When fragmentMatching work is completed, remove unnecessary result objects
              // PR: https://github.com/opencrvs/opencrvs-core/pull/836/commits/6302fa8f015fe313cbce6197980f1300bf4eba32
              deceased: {
                name: []
              },
              informant: {
                individual: {
                  telecom: [
                    {
                      system: '',
                      use: '',
                      value: ''
                    }
                  ]
                }
              },
              registration: {
                id: '1',
                type: 'birth',
                trackingId: 'BQRZWDR',
                contactPhoneNumber: '01622688231',
                status: [
                  {
                    id: '17e9b24-b00f-4a0f-a5a4-9c84c6e64e98/_history/86c3044a-329f-418',
                    timestamp: '2019-04-03T07:08:24.936Z',
                    user: {
                      id: '153f8364-96b3-4b90-8527-bf2ec4a367bd',
                      name: [
                        {
                          use: 'en',
                          firstNames: 'Mohammad',
                          familyName: 'Ashraful'
                        },
                        {
                          use: 'bn',
                          firstNames: '',
                          familyName: ''
                        }
                      ],
                      role: 'LOCAL_REGISTRAR'
                    },
                    location: {
                      id: '123',
                      name: 'Kaliganj Union Sub Center',
                      alias: ['']
                    },
                    office: {
                      id: '123',
                      name: 'Kaliganj Union Sub Center',
                      alias: [''],
                      address: {
                        district: '7876',
                        state: 'iuyiuy'
                      }
                    },
                    type: 'DECLARED',
                    comments: null
                  }
                ]
              }
            }
          }
        }
      }
    ]
    const testComponent = await createTestComponent(
      // @ts-ignore
      <Details
        match={{
          params: {
            applicationId: '1'
          },
          isExact: true,
          path: '',
          url: ''
        }}
        location={{
          pathname: '',
          search: '',
          hash: '',
          state: {
            forceDetailsQuery: false
          }
        }}
      />,
      store,
      graphqlMock
    )
    // wait for mocked data to load mockedProvider
    await new Promise((resolve) => {
      setTimeout(resolve, 100)
    })

    testComponent.component.update()
    expect(
      testComponent.component.find('#history_row_0_DECLARED').hostNodes()
    ).toHaveLength(1)
  })
  it('loads properly for required update application, and does not show update button for a field agent', async () => {
    const graphqlMock = [
      {
        request: {
          query: FETCH_REGISTRATION_BY_COMPOSITION,
          variables: {
            id: '1'
          }
        },
        result: {
          data: {
            fetchRegistration: {
              id: '1',
              // TODO: When fragmentMatching work is completed, remove unnecessary result objects
              // PR: https://github.com/opencrvs/opencrvs-core/pull/836/commits/6302fa8f015fe313cbce6197980f1300bf4eba32
              child: {
                id: 'FAKE_ID',
                name: [
                  {
                    use: 'en',
                    firstNames: '',
                    familyName: 'Anik'
                  },
                  {
                    use: 'bn',
                    firstNames: '',
                    familyName: 'অনিক'
                  }
                ]
              },
              deceased: {
                name: [
                  {
                    use: 'en',
                    firstNames: '',
                    familyName: 'Anik'
                  },
                  {
                    use: 'bn',
                    firstNames: '',
                    familyName: 'অনিক'
                  }
                ]
              },
              informant: {
                individual: {
                  telecom: [
                    {
                      use: '',
                      system: 'phone',
                      value: '01622688231'
                    }
                  ]
                }
              },
              registration: {
                id: '1',
                type: 'death',
                trackingId: 'DQRZWDR',
                contactPhoneNumber: '',
                status: [
                  {
                    ...defaultStatus,
                    type: 'REJECTED',
                    comments: [
                      {
                        comment: 'reason=duplicate&comment=dup'
                      }
                    ]
                  },
                  { ...defaultStatus, type: 'APPLICATION' }
                ]
              }
            }
          }
        }
      }
    ]
    const testComponent = await createTestComponent(
      // @ts-ignore
      <Details
        match={{
          params: {
            applicationId: '1'
          },
          isExact: true,
          path: '',
          url: ''
        }}
        location={{
          pathname: '',
          search: '',
          hash: '',
          state: {
            forceDetailsQuery: false
          }
        }}
      />,
      store,
      graphqlMock
    )
    // wait for mocked data to load mockedProvider
    await new Promise((resolve) => {
      setTimeout(resolve, 100)
    })

    testComponent.component.update()
    expect(
      testComponent.component.find('#history_row_0_REJECTED').hostNodes()
    ).toHaveLength(1)
    expect(
      testComponent.component.find('#registrar_update').hostNodes()
    ).toHaveLength(0)
    expect(
      testComponent.component.find('#history_row_1_APPLICATION').hostNodes()
    ).toHaveLength(1)
  })
  it('loads history properly for all statuses of an application', async () => {
    const graphqlMock = [
      {
        request: {
          query: FETCH_REGISTRATION_BY_COMPOSITION,
          variables: {
            id: '1'
          }
        },
        result: {
          data: {
            fetchRegistration: {
              id: '1',
              deceased: {
                name: [
                  {
                    use: 'en',
                    firstNames: '',
                    familyName: 'Anik'
                  },
                  {
                    use: 'bn',
                    firstNames: '',
                    familyName: 'অনিক'
                  }
                ]
              },
              // TODO: When fragmentMatching work is completed, remove unnecessary result objects
              // PR: https://github.com/opencrvs/opencrvs-core/pull/836/commits/6302fa8f015fe313cbce6197980f1300bf4eba32
              child: {
                id: 'FAKE_ID',
                name: [
                  {
                    use: 'en',
                    firstNames: '',
                    familyName: 'Anik'
                  },
                  {
                    use: 'bn',
                    firstNames: '',
                    familyName: 'অনিক'
                  }
                ]
              },
              informant: {
                individual: {
                  telecom: [
                    {
                      use: '',
                      system: 'phone',
                      value: '01622688231'
                    }
                  ]
                }
              },
              registration: {
                id: '1',
                type: 'death',
                trackingId: 'DQRZWDR',
                contactPhoneNumber: '',
                status: [
                  {
                    ...defaultStatus,
                    type: 'CERTIFIED'
                  },
                  {
                    ...defaultStatus,
                    type: 'REGISTERED'
                  },
                  {
                    ...defaultStatus,
                    type: 'WAITING_VALIDATION'
                  },
                  {
                    ...defaultStatus,
                    type: 'VALIDATED'
                  },
                  defaultStatus
                ]
              }
            }
          }
        }
      }
    ]
    const testComponent = await createTestComponent(
      // @ts-ignore
      <Details
        match={{
          params: {
            applicationId: '1'
          },
          isExact: true,
          path: '',
          url: ''
        }}
        location={{
          pathname: '',
          search: '',
          hash: '',
          state: {
            forceDetailsQuery: false
          }
        }}
      />,
      store,
      graphqlMock
    )
    // wait for mocked data to load mockedProvider
    await new Promise((resolve) => {
      setTimeout(resolve, 100)
    })

    testComponent.component.update()
    expect(
      testComponent.component.find('#history_row_4_DECLARED').hostNodes()
    ).toHaveLength(1)
    expect(
      testComponent.component.find('#history_row_3_VALIDATED').hostNodes()
    ).toHaveLength(1)
    expect(
      testComponent.component
        .find('#history_row_2_WAITING_VALIDATION')
        .hostNodes()
    ).toHaveLength(1)
    expect(
      testComponent.component.find('#history_row_1_REGISTERED').hostNodes()
    ).toHaveLength(1)
    expect(
      testComponent.component.find('#history_row_0_CERTIFIED').hostNodes()
    ).toHaveLength(1)
  })
  it('loads successfuly with empty history ', async () => {
    const graphqlMock = [
      {
        request: {
          query: FETCH_REGISTRATION_BY_COMPOSITION,
          variables: {
            id: '1'
          }
        },
        result: {
          data: {
            fetchRegistration: {
              id: '1',
              registration: {
                id: '1',
                type: null,
                trackingId: null,
                contactPhoneNumber: null,
                status: [
                  {
                    id: '1',
                    timestamp: null,
                    user: null,
                    location: null,
                    office: null,
                    type: null,
                    comments: null
                  }
                ]
              }
            }
          }
        }
      }
    ]
    const testComponent = await createTestComponent(
      // @ts-ignore
      <Details
        match={{
          params: {
            applicationId: '1'
          },
          isExact: true,
          path: '',
          url: ''
        }}
        location={{
          pathname: '',
          search: '',
          hash: '',
          state: {
            forceDetailsQuery: true
          }
        }}
      />,
      store,
      graphqlMock
    )
    // wait for mocked data to load mockedProvider
    await new Promise((resolve) => {
      setTimeout(resolve, 100)
    })

    testComponent.component.update()
    expect(
      testComponent.component.find('#sub_page_back_button').hostNodes()
    ).toHaveLength(1)
  })
})

describe('Registrar tests', () => {
  const { store, history } = createStore()

  const graphqlMock = [
    {
      request: {
        query: FETCH_REGISTRATION_BY_COMPOSITION,
        variables: {
          id: '9a55d213-ad9f-4dcd-9418-340f3a7f6269'
        }
      },
      result: {
        data: {
          fetchRegistration: {
            id: '9a55d213-ad9f-4dcd-9418-340f3a7f6269',
            registration: {
              id: '345678',
              type: 'BIRTH',
              certificates: null,
              status: [
                {
                  id: '17e9b24-b00f-4a0f-a5a4-9c84c6e64e98/_history/86c3044a-329f-418',
                  timestamp: '2019-04-03T07:08:24.936Z',
                  user: {
                    id: '153f8364-96b3-4b90-8527-bf2ec4a367bd',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Mohammad',
                        familyName: 'Ashraful'
                      },
                      {
                        use: 'bn',
                        firstNames: '',
                        familyName: ''
                      }
                    ],
                    role: 'LOCAL_REGISTRAR'
                  },
                  location: {
                    id: '123',
                    name: 'Kaliganj Union Sub Center',
                    alias: ['']
                  },
                  office: {
                    id: '123',
                    name: 'Kaliganj Union Sub Center',
                    alias: [''],
                    address: {
                      district: '7876',
                      state: 'iuyiuy'
                    }
                  },
                  type: 'IN_PROGRESS',
                  comments: [
                    {
                      comment: 'reason=duplicate&comment=dup'
                    }
                  ]
                }
              ],
              contact: 'MOTHER',
              contactPhoneNumber: '01622688231'
            },
            child: {
              id: 'FAKE_ID',
              name: [
                {
                  use: 'en',
                  firstNames: 'Mushraful',
                  familyName: 'Hoque'
                }
              ],
              birthDate: '2001-01-01'
            }
          }
        }
      }
    },
    {
      request: {
        query: GET_BIRTH_REGISTRATION_FOR_REVIEW,
        variables: { id: '9a55d213-ad9f-4dcd-9418-340f3a7f6269' }
      },
      result: {
        data: {
          fetchBirthRegistration: {
            id: '9a55d213-ad9f-4dcd-9418-340f3a7f6269',
            _fhirIDMap: {
              composition: '9a55d213-ad9f-4dcd-9418-340f3a7f6269',
              encounter: 'dba420af-3d3a-46e3-817d-2fa5c37b7439',
              observation: {
                birthType: '16643bcf-457a-4a5b-a7d2-328d57182476',
                weightAtBirth: '13a75fdf-54d3-476e-ab0e-68fca7286686',
                attendantAtBirth: 'add45cfa-8390-4792-a857-a1df587e45a6',
                presentAtBirthRegistration:
                  'd43f9c01-bd4f-4df6-b38f-91f7a978a232'
              }
            },
            child: null,
            informant: null,
            primaryCaregiver: null,
            mother: {
              name: [
                {
                  use: 'bn',
                  firstNames: '',
                  familyName: 'ময়না'
                },
                {
                  use: 'en',
                  firstNames: '',
                  familyName: 'Moyna'
                }
              ],
              birthDate: '2001-01-01',
              maritalStatus: 'MARRIED',
              occupation: 'Mother Occupation',
              dateOfMarriage: '2001-01-01',
              educationalAttainment: 'PRIMARY_ISCED_1',
              nationality: ['BGD'],
              identifier: [{ id: '1233', type: 'PASSPORT', otherType: '' }],
              multipleBirth: 1,
              address: [
                {
                  type: 'PERMANENT',
                  line: ['12', '', 'union1', 'upazila10'],
                  district: 'district2',
                  state: 'state2',
                  city: '',
                  postalCode: '',
                  country: 'BGD'
                },
                {
                  type: 'CURRENT',
                  line: ['12', '', 'union1', 'upazila10'],
                  district: 'district2',
                  state: 'state2',
                  city: '',
                  postalCode: '',
                  country: 'BGD'
                }
              ],
              telecom: [
                {
                  system: 'phone',
                  value: '01711111111'
                }
              ],
              id: '20e9a8d0-907b-4fbd-a318-ec46662bf608'
            },
            father: null,
            registration: {
              id: 'c8dbe751-5916-4e2a-ba95-1733ccf699b6',
              contact: 'MOTHER',
              contactRelationship: 'Contact Relation',
              contactPhoneNumber: '01733333333',
              attachments: null,
              status: [
                {
                  comments: [
                    {
                      comment: 'This is a note'
                    }
                  ],
                  type: 'DECLARED',
                  timestamp: null
                }
              ],
              trackingId: 'B123456',
              registrationNumber: null,
              type: 'BIRTH'
            },
            attendantAtBirth: 'NURSE',
            weightAtBirth: 2,
            birthType: 'SINGLE',
            eventLocation: {
              address: {
                country: 'BGD',
                state: 'state4',
                city: '',
                district: 'district2',
                postalCode: '',
                line: ['Rd #10', '', 'Akua', 'union1', '', 'upazila10'],
                postCode: '1020'
              },
              type: 'PRIVATE_HOME',
              partOf: 'Location/upazila10'
            },
            presentAtBirthRegistration: 'MOTHER_ONLY'
          }
        }
      }
    }
  ]

  const graphqlErrorMock = [
    {
      request: {
        query: FETCH_REGISTRATION_BY_COMPOSITION,
        variables: {
          id: '9a55d213-ad9f-4dcd-9418-340f3a7f6269'
        }
      },
      result: {
        data: {
          fetchRegistration: {
            id: '9a55d213-ad9f-4dcd-9418-340f3a7f6269',
            registration: {
              id: '345678',
              type: 'BIRTH',
              certificates: null,
              status: [
                {
                  id: '17e9b24-b00f-4a0f-a5a4-9c84c6e64e98/_history/86c3044a-329f-418',
                  timestamp: '2019-04-03T07:08:24.936Z',
                  user: {
                    id: '153f8364-96b3-4b90-8527-bf2ec4a367bd',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Mohammad',
                        familyName: 'Ashraful'
                      },
                      {
                        use: 'bn',
                        firstNames: '',
                        familyName: ''
                      }
                    ],
                    role: 'LOCAL_REGISTRAR'
                  },
                  location: {
                    id: '123',
                    name: 'Kaliganj Union Sub Center',
                    alias: ['']
                  },
                  office: {
                    id: '123',
                    name: 'Kaliganj Union Sub Center',
                    alias: [''],
                    address: {
                      district: '7876',
                      state: 'iuyiuy'
                    }
                  },
                  type: 'IN_PROGRESS',
                  comments: [
                    {
                      comment: 'reason=duplicate&comment=dup'
                    }
                  ]
                }
              ],
              contact: 'MOTHER',
              contactPhoneNumber: '01622688231'
            },
            child: {
              id: 'FAKE_ID',
              name: [
                {
                  use: 'en',
                  firstNames: 'Mushraful',
                  familyName: 'Hoque'
                }
              ],
              birthDate: '2001-01-01'
            }
          }
        }
      }
    },
    {
      request: {
        query: GET_BIRTH_REGISTRATION_FOR_REVIEW,
        variables: {
          id: '9a55d213-ad9f-4dcd-9418-340f3a7f6269'
        }
      },
      result: {
        errors: [new Error('boom')]
      }
    }
  ]

  beforeAll(() => {
    merge(mockUserResponse, registrarNameObj)
    mockFetchUserDetails.mockReturnValue(mockUserResponse)
    queries.fetchUserDetails = mockFetchUserDetails
  })

  it('Downloads a rejected application if the user is a registrar', async () => {
    const testComponent = await createTestComponent(
      // @ts-ignore
      <Details
        match={{
          params: {
            applicationId: '9a55d213-ad9f-4dcd-9418-340f3a7f6269'
          },
          isExact: true,
          path: '',
          url: ''
        }}
        location={{
          pathname: '',
          search: '',
          hash: '',
          state: {
            forceDetailsQuery: false
          }
        }}
      />,
      store,
      graphqlMock
    )
    // wait for mocked data to load mockedProvider
    await new Promise((resolve) => {
      setTimeout(resolve, 100)
    })
    // wait for mocked data to load mockedProvider
    await new Promise((resolve) => {
      setTimeout(resolve, 100)
    })
    getItem.mockReturnValue(registerScopeToken)
    testComponent.store.dispatch(checkAuth({ '?token': registerScopeToken }))

    // wait for mocked data to load mockedProvider
    await new Promise((resolve) => {
      setTimeout(resolve, 100)
    })
    testComponent.component.update()
    const downloadButton = testComponent.component.find('#reviewDownload-icon')
    expect(downloadButton.hostNodes()).toHaveLength(1)
    downloadButton.hostNodes().simulate('click')

    testComponent.component.update()
    expect(
      testComponent.component.find('#action-loading-reviewDownload').hostNodes()
    ).toHaveLength(1)

    // wait for mocked data to load mockedProvider
    await new Promise((resolve) => {
      setTimeout(resolve, 100)
    })
    testComponent.component.update()

    expect(
      testComponent.component.find('#registrar_update').hostNodes()
    ).toHaveLength(1)
  })

  it('Shows error icon if download fails', async () => {
    const testComponent = await createTestComponent(
      // @ts-ignore
      <Details
        match={{
          params: {
            applicationId: '9a55d213-ad9f-4dcd-9418-340f3a7f6269'
          },
          isExact: true,
          path: '',
          url: ''
        }}
        location={{
          pathname: '',
          search: '',
          hash: '',
          state: {
            forceDetailsQuery: false
          }
        }}
      />,
      store,
      graphqlErrorMock
    )
    // wait for mocked data to load mockedProvider
    await new Promise((resolve) => {
      setTimeout(resolve, 100)
    })
    // wait for mocked data to load mockedProvider
    await new Promise((resolve) => {
      setTimeout(resolve, 100)
    })
    getItem.mockReturnValue(registerScopeToken)
    testComponent.store.dispatch(checkAuth({ '?token': registerScopeToken }))

    // wait for mocked data to load mockedProvider
    await new Promise((resolve) => {
      setTimeout(resolve, 100)
    })
    testComponent.component.update()
    const downloadButton = testComponent.component.find('#reviewDownload-icon')
    expect(downloadButton.hostNodes()).toHaveLength(1)
    downloadButton.hostNodes().simulate('click')

    testComponent.component.update()
    expect(
      testComponent.component.find('#action-loading-reviewDownload').hostNodes()
    ).toHaveLength(1)

    // wait for mocked data to load mockedProvider
    await new Promise((resolve) => {
      setTimeout(resolve, 100)
    })
    testComponent.component.update()

    expect(
      testComponent.component.find('#action-error-reviewDownload').hostNodes()
    ).toHaveLength(1)
  })

  it('Downloads a printable application if the user is a registrar', async () => {
    const graphqlMock = [
      {
        request: {
          query: FETCH_REGISTRATION_BY_COMPOSITION,
          variables: {
            id: '956281c9-1f47-4c26-948a-970dd23c4094'
          }
        },
        result: {
          data: {
            fetchRegistration: {
              id: '956281c9-1f47-4c26-948a-970dd23c4094',
              // TODO: When fragmentMatching work is completed, remove unnecessary result objects
              // PR: https://github.com/opencrvs/opencrvs-core/pull/836/commits/6302fa8f015fe313cbce6197980f1300bf4eba32
              child: {
                id: 'FAKE_ID',
                name: [
                  {
                    use: 'en',
                    firstNames: '',
                    familyName: 'Anik'
                  },
                  {
                    use: 'bn',
                    firstNames: '',
                    familyName: 'অনিক'
                  }
                ]
              },
              deceased: {
                name: [
                  {
                    use: 'en',
                    firstNames: '',
                    familyName: 'Anik'
                  },
                  {
                    use: 'bn',
                    firstNames: '',
                    familyName: 'অনিক'
                  }
                ]
              },
              informant: {
                individual: {
                  telecom: [
                    {
                      use: '',
                      system: 'phone',
                      value: '01622688231'
                    }
                  ]
                }
              },
              father: {
                id: '7ac8d0a6-a391-42f9-add4-dec27279589',
                name: [
                  {
                    use: 'bn',
                    firstNames: 'মোক্তার',
                    familyName: 'আলী'
                  },
                  {
                    use: 'en',
                    firstNames: 'Moktar',
                    familyName: 'Ali'
                  }
                ]
              },
              mother: {
                id: '7ac8d0a6-a391-42f9-add4-dec2727',
                name: [
                  {
                    use: 'bn',
                    firstNames: 'মরিউম',
                    familyName: 'আলী'
                  },
                  {
                    use: 'en',
                    firstNames: 'Morium',
                    familyName: 'Ali'
                  }
                ]
              },
              spouse: {
                id: '7ac8d0a6-a391-42f9-add4-dec27asdf89',
                name: [
                  {
                    use: 'bn',
                    firstNames: 'রেহানা',
                    familyName: 'আলী'
                  },
                  {
                    use: 'en',
                    firstNames: 'Rehana',
                    familyName: 'Ali'
                  }
                ]
              },
              registration: {
                id: '1',
                type: 'death',
                trackingId: 'DQRZWDR',
                contactPhoneNumber: '',
                status: [
                  {
                    ...registrarDefaultStatus,
                    type: 'REGISTERED',
                    comments: [
                      {
                        comment: 'reason=duplicate&comment=dup'
                      }
                    ]
                  },
                  { ...registrarDefaultStatus, type: 'APPLICATION' }
                ]
              }
            }
          }
        }
      },
      {
        request: {
          query: GET_DEATH_REGISTRATION_FOR_CERTIFICATION,
          variables: { id: '956281c9-1f47-4c26-948a-970dd23c4094' }
        },
        result: {
          data: {
            fetchDeathRegistration: {
              _fhirIDMap: {
                composition: '956281c9-1f47-4c26-948a-970dd23c4094'
              },
              id: '956281c9-1f47-4c26-948a-970dd23c4094',
              deceased: {
                id: 'a6cce2e1-10df-42d0-bbc9-8e037b0bf14e',
                name: [
                  {
                    use: 'bn',
                    firstNames: 'ক ম আব্দুল্লাহ আল আমিন ',
                    familyName: 'খান'
                  },
                  {
                    use: 'en',
                    firstNames: 'K M Abdullah al amin',
                    familyName: 'Khan'
                  }
                ],
                birthDate: '1988-06-16',
                gender: 'male',
                maritalStatus: 'MARRIED',
                nationality: ['BGD'],
                identifier: [
                  {
                    id: '1020617910288',
                    type: 'NATIONAL_ID',
                    otherType: null
                  }
                ],
                deceased: {
                  deathDate: '2019-01-18'
                },
                address: [
                  {
                    type: 'PERMANENT',
                    line: [
                      '40 Ward',
                      '',
                      'Bahadur street',
                      'f4d236c5-6328-4e8e-a45b-e307720b7cdf',
                      '',
                      '2612765c-f5a7-4291-9191-7625dd76fa82'
                    ],
                    district: '18dd420e-daec-4d35-9a44-fb58b5185923',
                    state: 'e93b10bc-1318-4dcb-b8b6-35c7532a0a90',
                    city: null,
                    postalCode: '1024',
                    country: 'BGD'
                  },
                  {
                    type: 'CURRENT',
                    line: [
                      '40',
                      '',
                      'My street',
                      'f4d236c5-6328-4e8e-a45b-e307720b7cdf',
                      '',
                      '2612765c-f5a7-4291-9191-7625dd76fa82'
                    ],
                    district: '18dd420e-daec-4d35-9a44-fb58b5185923',
                    state: 'e93b10bc-1318-4dcb-b8b6-35c7532a0a90',
                    city: null,
                    postalCode: '1024',
                    country: 'BGD'
                  }
                ]
              },
              informant: {
                id: 'c7e17721-bccf-4dfb-8f85-d6311d1da1bc',
                relationship: 'OTHER',
                otherRelationship: 'Friend',
                individual: {
                  id: '7ac8d0a6-a391-42f9-add4-dec27279474d',
                  identifier: [
                    {
                      id: '1020607917288',
                      type: 'NATIONAL_ID',
                      otherType: null
                    }
                  ],
                  name: [
                    {
                      use: 'bn',
                      firstNames: 'জামাল উদ্দিন খান',
                      familyName: 'খান'
                    },
                    {
                      use: 'en',
                      firstNames: 'Jamal Uddin Khan',
                      familyName: 'Khan'
                    }
                  ],
                  nationality: ['BGD'],
                  birthDate: '1956-10-17',
                  telecom: null,
                  address: [
                    {
                      type: 'CURRENT',
                      line: [
                        '48',
                        '',
                        'My street',
                        'f4d236c5-6328-4e8e-a45b-e307720b7cdf',
                        '',
                        '2612765c-f5a7-4291-9191-7625dd76fa82'
                      ],
                      district: '18dd420e-daec-4d35-9a44-fb58b5185923',
                      state: 'e93b10bc-1318-4dcb-b8b6-35c7532a0a90',
                      city: null,
                      postalCode: '1024',
                      country: 'BGD'
                    },
                    {
                      type: 'PERMANENT',
                      line: [
                        '40 Ward',
                        '',
                        'Bahadur street',
                        'f4d236c5-6328-4e8e-a45b-e307720b7cdf',
                        '',
                        '2612765c-f5a7-4291-9191-7625dd76fa82'
                      ],
                      district: '18dd420e-daec-4d35-9a44-fb58b5185923',
                      state: 'e93b10bc-1318-4dcb-b8b6-35c7532a0a90',
                      city: null,
                      postalCode: '1024',
                      country: 'BGD'
                    }
                  ]
                }
              },
              father: {
                id: '7ac8d0a6-a391-42f9-add4-dec27279589',
                name: [
                  {
                    use: 'bn',
                    firstNames: 'মোক্তার',
                    familyName: 'আলী'
                  },
                  {
                    use: 'en',
                    firstNames: 'Moktar',
                    familyName: 'Ali'
                  }
                ]
              },
              mother: {
                id: '7ac8d0a6-a391-42f9-add4-dec272asfd',
                name: [
                  {
                    use: 'bn',
                    firstNames: 'মরিউম',
                    familyName: 'আলী'
                  },
                  {
                    use: 'en',
                    firstNames: 'Morium',
                    familyName: 'Ali'
                  }
                ]
              },
              spouse: {
                id: '7ac8d0a6-a391-42f9-add4-dec',
                name: [
                  {
                    use: 'bn',
                    firstNames: 'রেহানা',
                    familyName: 'আলী'
                  },
                  {
                    use: 'en',
                    firstNames: 'Rehana',
                    familyName: 'Ali'
                  }
                ]
              },
              registration: {
                id: 'ba1cb210-b98f-46e1-a185-4c8df2971064',
                contact: 'OTHER',
                contactRelationship: 'Colleague',
                contactPhoneNumber: '+8801678945638',
                attachments: null,
                status: [
                  {
                    comments: null,
                    type: 'REGISTERED',
                    location: {
                      name: 'Alokbali',
                      alias: ['আলো্কবালী']
                    },
                    office: {
                      name: 'Alokbali Union Parishad',
                      alias: ['আলোকবালী  ইউনিয়ন পরিষদ'],
                      address: {
                        district: 'Narsingdi',
                        state: 'Dhaka'
                      }
                    },
                    timestamp: null
                  },
                  {
                    comments: null,
                    type: 'DECLARED',
                    location: {
                      name: 'Alokbali',
                      alias: ['আলো্কবালী']
                    },
                    office: {
                      name: 'Alokbali Union Parishad',
                      alias: ['আলোকবালী  ইউনিয়ন পরিষদ'],
                      address: {
                        district: 'Narsingdi',
                        state: 'Dhaka'
                      }
                    },
                    timestamp: null
                  }
                ],
                type: 'DEATH',
                trackingId: 'DG6PECX',
                registrationNumber: '20196816020000113'
              },
              eventLocation: {
                id: '7a503721-a258-49ef-9fb9-aa77c970d19b',
                type: 'PRIVATE_HOME',
                address: {
                  type: null,
                  line: [
                    '40',
                    '',
                    'My street',
                    'f4d236c5-6328-4e8e-a45b-e307720b7cdf',
                    '',
                    '2612765c-f5a7-4291-9191-7625dd76fa82'
                  ],
                  district: '18dd420e-daec-4d35-9a44-fb58b5185923',
                  state: 'e93b10bc-1318-4dcb-b8b6-35c7532a0a90',
                  city: null,
                  postalCode: '1024',
                  country: 'BGD'
                }
              },
              mannerOfDeath: 'HOMICIDE',
              causeOfDeathMethod: null,
              causeOfDeath: 'Chronic Obstructive Pulmonary Disease'
            }
          }
        }
      }
    ]
    const testComponent = await createTestComponent(
      // @ts-ignore
      <Details
        match={{
          params: {
            applicationId: '956281c9-1f47-4c26-948a-970dd23c4094'
          },
          isExact: true,
          path: '',
          url: ''
        }}
        location={{
          pathname: '',
          search: '',
          hash: '',
          state: {
            forceDetailsQuery: false
          }
        }}
      />,
      store,
      graphqlMock
    )
    // wait for mocked data to load mockedProvider
    await new Promise((resolve) => {
      setTimeout(resolve, 100)
    })
    // wait for mocked data to load mockedProvider
    await new Promise((resolve) => {
      setTimeout(resolve, 100)
    })
    getItem.mockReturnValue(registerScopeToken)
    await testComponent.store.dispatch(
      checkAuth({ '?token': registerScopeToken })
    )

    // wait for mocked data to load mockedProvider
    await new Promise((resolve) => {
      setTimeout(resolve, 100)
    })

    testComponent.component.update()
    const downloadButton = testComponent.component.find('#printDownload-icon')
    expect(downloadButton.hostNodes()).toHaveLength(1)
    downloadButton.hostNodes().simulate('click')

    testComponent.component.update()
    expect(
      testComponent.component.find('#action-loading-printDownload').hostNodes()
    ).toHaveLength(1)

    // wait for mocked data to load mockedProvider
    await new Promise((resolve) => {
      setTimeout(resolve, 100)
    })

    testComponent.component.update()
    expect(
      testComponent.component.find('#registrar_print').hostNodes()
    ).toHaveLength(1)

    testComponent.component
      .find('#registrar_print')
      .hostNodes()
      .simulate('click')
    expect(history.location.pathname).toContain('cert')
  })

  it('Renders error page in-case of any network error', async () => {
    const graphqlMock = [
      {
        request: {
          query: FETCH_REGISTRATION_BY_COMPOSITION,
          variables: {
            id: '1'
          }
        },
        error: new Error('boom')
      }
    ]
    try {
      await createTestComponent(
        // @ts-ignore
        <Details
          match={{
            params: {
              applicationId: '1'
            },
            isExact: true,
            path: '',
            url: ''
          }}
          location={{
            pathname: '',
            search: '',
            hash: '',
            state: {}
          }}
        />,
        store,
        graphqlMock
      )
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }
  })
})
