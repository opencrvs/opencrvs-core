import * as React from 'react'
import { createTestComponent } from '../../tests/util'
import {
  ReviewDuplicates,
  FETCH_DUPLICATES,
  createDuplicateDetailsQuery
} from './ReviewDuplicates'
import { createStore } from 'src/store'
import { DuplicateDetails } from 'src/components/DuplicateDetails'

describe('Review duplicates component', () => {
  it('query gateway correctly and displays the returned duplicates correctly', async () => {
    const graphqlMock = [
      {
        request: {
          query: FETCH_DUPLICATES,
          variables: {
            id: '123'
          }
        },
        result: {
          data: {
            fetchBirthRegistration: {
              id: '123',
              registration: {
                duplicates: ['111']
              }
            }
          }
        }
      },

      {
        request: {
          query: createDuplicateDetailsQuery(['123', '111']),
          variables: {
            duplicate0Id: '123',
            duplicate1Id: '111'
          }
        },
        result: {
          data: {
            duplicate0: {
              createdAt: '2019-01-22T09:46:02.547Z',
              id: '450ce5e3-b495-4868-bb6a-1183ffd0fdd1',
              registration: {
                trackingId: 'BFCJ02U',
                type: 'BIRTH',
                status: [
                  {
                    type: 'DECLARED',
                    timestamp: '2019-01-22T09:46:02.547Z',
                    user: {
                      name: [
                        {
                          use: 'en',
                          firstNames: 'Shakib',
                          familyName: 'Al Hasan'
                        },
                        {
                          use: 'bn',
                          firstNames: '',
                          familyName: ''
                        }
                      ],
                      role: 'FIELD_AGENT'
                    },
                    office: {
                      name: 'Moktarpur Union Parishad'
                    }
                  }
                ]
              },
              child: {
                name: [
                  {
                    use: 'bn',
                    firstNames: 'গায়ত্রী',
                    familyName: 'স্পিভক'
                  },
                  {
                    use: 'en',
                    firstNames: 'Gayatri',
                    familyName: 'Spivak'
                  }
                ],
                birthDate: '2018-08-01',
                gender: 'female'
              },
              mother: {
                name: [
                  {
                    use: 'bn',
                    firstNames: 'গায়ত্রী',
                    familyName: 'স্পিভক'
                  },
                  {
                    use: 'en',
                    firstNames: 'Gayatri',
                    familyName: 'Spivak'
                  }
                ],
                birthDate: null,
                gender: null,
                identifier: [
                  {
                    id: '1',
                    type: 'NATIONAL_ID'
                  }
                ]
              },
              father: {
                name: [
                  {
                    use: 'bn',
                    firstNames: 'গায়ত্রী',
                    familyName: 'স্পিভক'
                  },
                  {
                    use: 'en',
                    firstNames: 'Gayatri',
                    familyName: 'Spivak'
                  }
                ],
                birthDate: '2018-08-01',
                gender: null,
                identifier: [
                  {
                    id: '1',
                    type: 'NATIONAL_ID'
                  }
                ]
              }
            },
            duplicate1: {
              createdAt: '2019-01-22T09:46:02.547Z',
              id: '450ce5e3-b495-4868-bb6a-1183ffd0fdd1',
              registration: {
                trackingId: 'BFCJ02U',
                type: 'BIRTH',
                status: [
                  {
                    type: 'DECLARED',
                    timestamp: '2019-01-22T09:46:02.547Z',
                    user: {
                      name: [
                        {
                          use: 'en',
                          firstNames: 'Shakib',
                          familyName: 'Al Hasan'
                        },
                        {
                          use: 'bn',
                          firstNames: '',
                          familyName: ''
                        }
                      ],
                      role: 'FIELD_AGENT'
                    },
                    office: {
                      name: 'Moktarpur Union Parishad'
                    }
                  }
                ]
              },
              child: {
                name: [
                  {
                    use: 'bn',
                    firstNames: 'গায়ত্রী',
                    familyName: 'স্পিভক'
                  },
                  {
                    use: 'en',
                    firstNames: 'Gayatri',
                    familyName: 'Spivak'
                  }
                ],
                birthDate: '2018-08-01',
                gender: 'female'
              },
              mother: {
                name: [
                  {
                    use: 'bn',
                    firstNames: 'গায়ত্রী',
                    familyName: 'স্পিভক'
                  },
                  {
                    use: 'en',
                    firstNames: 'Gayatri',
                    familyName: 'Spivak'
                  }
                ],
                birthDate: null,
                gender: null,
                identifier: [
                  {
                    id: '1',
                    type: 'NATIONAL_ID'
                  }
                ]
              },
              father: {
                name: [
                  {
                    use: 'bn',
                    firstNames: 'গায়ত্রী',
                    familyName: 'স্পিভক'
                  },
                  {
                    use: 'en',
                    firstNames: 'Gayatri',
                    familyName: 'Spivak'
                  }
                ],
                birthDate: '2018-08-01',
                gender: null,
                identifier: [
                  {
                    id: '1',
                    type: 'NATIONAL_ID'
                  }
                ]
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

    testComponent.component.update()

    expect(testComponent.component.find(DuplicateDetails)).toHaveLength(2)
  })

  it('displays error text when the query to fetch duplicates fails', async () => {
    const graphqlMock = [
      {
        request: {
          query: FETCH_DUPLICATES,
          variables: {
            id: '123'
          }
        },
        result: {
          data: {
            fetchBirthRegistration: {
              id: '123',
              registration: {
                duplicates: ['111']
              }
            }
          }
        }
      },

      {
        request: {
          query: createDuplicateDetailsQuery(['123', '111']),
          variables: {
            duplicate0Id: '123',
            duplicate1Id: '111'
          }
        },
        error: new Error('boom!')
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

    testComponent.component.update()

    expect(
      testComponent.component
        .find('#duplicates-error-text')
        .children()
        .text()
    ).toBe('An error occurred while fetching data')
  })

  it('displays error text when the query to fetch the duplicates DETAILS fails', async () => {
    const graphqlMock = [
      {
        request: {
          query: FETCH_DUPLICATES,
          variables: {
            id: '123'
          }
        },
        error: new Error('boom!')
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

    testComponent.component.update()

    expect(
      testComponent.component
        .find('#duplicates-error-text')
        .children()
        .text()
    ).toBe('An error occurred while fetching data')
  })
})
