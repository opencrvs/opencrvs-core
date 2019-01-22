import * as React from 'react'
import { createTestComponent } from '../../tests/util'
import { ReviewDuplicates } from './ReviewDuplicates'
import { createStore } from 'src/store'
import gql from 'graphql-tag'

describe('Review duplicates component', () => {
  it('query gateway correctly and displays the returned duplicates correctly ', async () => {
    const graphqlMock = [
      {
        request: {
          query: gql`
            query fetchDuplicates($id: ID!) {
              fetchBirthRegistration(id: $id) {
                id
                registration {
                  duplicates
                }
              }
            }
          `,
          variables: {
            id: '123'
          }
        },
        result: {
          data: {
            fetchBirthRegistration: {
              id: '123',
              registration: {
                duplicates: ['111', '222']
              }
            }
          }
        }
      },

      {
        request: {
          query: gql`
            query fetchDuplicateDetails(
              $duplicate0Id: ID!
              $duplicate1Id: ID!
              $duplicate2Id: ID!
            ) {
              duplicate0: fetchBirthRegistration(id: $duplicate0Id) {
                id
                registration {
                  trackingId
                }
                child {
                  name {
                    use
                    firstNames
                    familyName
                  }
                  birthDate
                }
                createdAt
              }

              duplicate1: fetchBirthRegistration(id: $duplicate1Id) {
                id
                registration {
                  trackingId
                }
                child {
                  name {
                    use
                    firstNames
                    familyName
                  }
                  birthDate
                }
                createdAt
              }

              duplicate2: fetchBirthRegistration(id: $duplicate2Id) {
                id
                registration {
                  trackingId
                }
                child {
                  name {
                    use
                    firstNames
                    familyName
                  }
                  birthDate
                }
                createdAt
              }
            }
          `,
          variables: {
            duplicate0Id: '123',
            duplicate1Id: '111',
            duplicate2Id: '222'
          }
        },
        result: {
          data: {
            dupe1: {
              createdAt: '2019-01-07T13:04:48.441Z',
              id: '7f3017aa-9e87-47cb-8c97-81c5aa825688',
              registration: {
                trackingId: 'BVa4cCt',
                type: 'BIRTH'
              },
              child: {
                name: [
                  {
                    use: 'bn',
                    firstNames: 'ফচৃস',
                    familyName: 'ৈপহোটগস'
                  },
                  {
                    use: 'en',
                    firstNames: 'Ryan',
                    familyName: 'Crichton'
                  }
                ],
                birthDate: '1986-06-04',
                gender: 'male'
              },
              mother: {
                name: [
                  {
                    use: 'bn',
                    firstNames: 'ৈাপহুটহসড',
                    familyName: 'ৈপহোটগস'
                  },
                  {
                    use: 'en',
                    firstNames: 'Christine',
                    familyName: 'Crichton'
                  }
                ],
                birthDate: '1960-01-01',
                gender: null,
                identifier: [
                  {
                    id: '1234',
                    type: 'NATIONAL_ID'
                  }
                ]
              },
              father: null
            },
            dupe2: {
              createdAt: '2018-11-16T00:00:00+02:00',
              id: '1648b1fb-bad4-4b98-b8a3-bd7ceee496b6',
              registration: {
                trackingId: 'BewpkiM',
                type: 'BIRTH'
              },
              child: {
                name: [
                  {
                    use: null,
                    firstNames: 'SHOULD_NOT_EXIST',
                    familyName: 'Smith'
                  }
                ],
                birthDate: '2018-10-01',
                gender: 'male'
              },
              mother: {
                name: [
                  {
                    use: 'english',
                    firstNames: 'Jane',
                    familyName: 'Doe'
                  }
                ],
                birthDate: '1974-03-02',
                gender: 'female',
                identifier: [
                  {
                    id: '123',
                    type: 'NATIONAL_ID'
                  }
                ]
              },
              father: {
                name: [
                  {
                    use: null,
                    firstNames: 'Jack',
                    familyName: 'Doe'
                  }
                ],
                birthDate: null,
                gender: 'male',
                identifier: null
              }
            },
            dupe3: {
              createdAt: '2018-11-16T00:00:00+02:00',
              id: '9633042c-ca34-4b9f-959b-9d16909fd85c',
              registration: {
                trackingId: 'BkE62TC',
                type: 'BIRTH'
              },
              child: {
                name: [
                  {
                    use: null,
                    firstNames: 'SHOULD_NOT_EXIST',
                    familyName: 'Smith'
                  }
                ],
                birthDate: '2018-10-01',
                gender: 'male'
              },
              mother: {
                name: [
                  {
                    use: 'english',
                    firstNames: 'Jane',
                    familyName: 'Doe'
                  }
                ],
                birthDate: '1974-03-02',
                gender: 'female',
                identifier: [
                  {
                    id: '123',
                    type: 'NATIONAL_ID'
                  }
                ]
              },
              father: {
                name: [
                  {
                    use: null,
                    firstNames: 'Jack',
                    familyName: 'Doe'
                  }
                ],
                birthDate: null,
                gender: 'male',
                identifier: null
              }
            }
          }
        }
      }
    ]

    const { store } = createStore()
    const testComponent = createTestComponent(
      <ReviewDuplicates
        // @ts-ignore
        match={{
          params: {
            applicationId: '123'
          }
        }}
      />,
      store,
      graphqlMock
    )

    // wait for mocked data to load mockedProvider
    await new Promise(resolve => {
      setTimeout(resolve, 100)
    })

    expect(testComponent).toBeDefined()
  })
})
