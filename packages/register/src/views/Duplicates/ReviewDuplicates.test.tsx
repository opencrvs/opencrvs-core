import * as React from 'react'
import { createTestComponent } from '@register/tests/util'
import {
  ReviewDuplicates,
  rejectMutation,
  notADuplicateMutation,
  FETCH_DUPLICATES,
  createDuplicateDetailsQuery
} from '@register/views/Duplicates/ReviewDuplicates'
import { createStore } from '@register/store'
import { ReactWrapper } from 'enzyme'
import { DuplicateDetails } from '@register/components/DuplicateDetails'
import { clone } from 'lodash'
import { SEARCH_RESULT } from '@register/navigation/routes'

const assign = window.location.assign as jest.Mock

describe('Review Duplicates component', () => {
  const graphqlMock = [
    {
      request: {
        query: FETCH_DUPLICATES,
        variables: {
          id: '450ce5e3-b495-4868-bb6a-1183ffd0fee1'
        }
      },
      result: {
        data: {
          fetchBirthRegistration: {
            id: '450ce5e3-b495-4868-bb6a-1183ffd0fee1',
            registration: {
              id: '123',
              duplicates: ['450ce5e3-b495-4868-bb6a-1183ffd0fff1']
            }
          }
        }
      }
    },

    {
      request: {
        query: FETCH_DUPLICATES,
        variables: {
          id: '460ce5e3-b495-4868-bb6a-1183ffd0fee1'
        }
      },
      result: {
        data: {
          fetchBirthRegistration: {
            id: '460ce5e3-b495-4868-bb6a-1183ffd0fee1',
            registration: {
              id: '123',
              duplicates: []
            }
          }
        }
      }
    },

    {
      request: {
        query: createDuplicateDetailsQuery([
          '450ce5e3-b495-4868-bb6a-1183ffd0fee1',
          '450ce5e3-b495-4868-bb6a-1183ffd0fff1'
        ]),
        variables: {
          duplicate0Id: '450ce5e3-b495-4868-bb6a-1183ffd0fee1',
          duplicate1Id: '450ce5e3-b495-4868-bb6a-1183ffd0fff1'
        }
      },
      result: {
        data: {
          duplicate0: {
            createdAt: '2019-01-22T09:46:02.547Z',
            id: '450ce5e3-b495-4868-bb6a-1183ffd0fee1',
            registration: {
              id: '123',
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
                  },
                  comments: [{ comment: 'note' }]
                }
              ]
            },
            child: {
              id: '123',
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
              id: '123',
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
            },
            father: {
              id: '123',
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
            id: '450ce5e3-b495-4868-bb6a-1183ffd0fff1',
            registration: {
              id: 'hghgjhg',
              trackingId: 'BFCJ02U',
              type: 'BIRTH',
              status: [
                {
                  type: 'REGISTERED',
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
                  },
                  comments: [{ comment: 'note' }]
                }
              ]
            },
            child: {
              id: '123',
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
              id: '123',
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
            },
            father: {
              id: '123',
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

  const graphqlMockMinimal = [
    {
      request: {
        query: FETCH_DUPLICATES,
        variables: {
          id: '450ce5e3-b495-4868-bb6a-1183ffd0fee1'
        }
      },
      result: {
        data: {
          fetchBirthRegistration: {
            id: '450ce5e3-b495-4868-bb6a-1183ffd0fee1',
            registration: {
              id: '123',
              duplicates: ['450ce5e3-b495-4868-bb6a-1183ffd0fff1']
            }
          }
        }
      }
    },

    {
      request: {
        query: FETCH_DUPLICATES,
        variables: {
          id: '460ce5e3-b495-4868-bb6a-1183ffd0fee1'
        }
      },
      result: {
        data: {
          fetchBirthRegistration: {
            id: '460ce5e3-b495-4868-bb6a-1183ffd0fee1',
            registration: {
              id: '123',
              duplicates: []
            }
          }
        }
      }
    },

    {
      request: {
        query: createDuplicateDetailsQuery([
          '450ce5e3-b495-4868-bb6a-1183ffd0fee1',
          '450ce5e3-b495-4868-bb6a-1183ffd0fff1'
        ]),
        variables: {
          duplicate0Id: '450ce5e3-b495-4868-bb6a-1183ffd0fee1',
          duplicate1Id: '450ce5e3-b495-4868-bb6a-1183ffd0fff1'
        }
      },
      result: {
        data: {
          duplicate0: {
            createdAt: '2019-01-22T09:46:02.547Z',
            id: '450ce5e3-b495-4868-bb6a-1183ffd0fee1',
            registration: {
              id: '123',
              trackingId: 'BFCJ02U',
              type: 'BIRTH',
              status: [
                {
                  type: 'DECLARED',
                  timestamp: '2019-01-22T09:46:02.547Z',
                  user: null,
                  office: {
                    name: null
                  },
                  comments: [{ comment: 'note' }]
                }
              ]
            },
            child: {
              id: '123',
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
              gender: 'female'
            },
            mother: {
              id: '123',
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
              id: '123',
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
              identifier: null
            }
          },
          duplicate1: {
            createdAt: '2019-01-22T09:46:02.547Z',
            id: '450ce5e3-b495-4868-bb6a-1183ffd0fff1',
            registration: {
              id: 'hghgjhg',
              trackingId: 'BFCJ02U',
              type: 'BIRTH',
              status: [
                {
                  type: 'REGISTERED',
                  timestamp: '2019-01-22T09:46:02.547Z',
                  user: null,
                  office: {
                    name: null
                  },
                  comments: [{ comment: 'note' }]
                }
              ]
            },
            child: {
              id: '123',
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
              gender: 'female'
            },
            mother: {
              id: '123',
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
              id: '123',
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
              identifier: null
            }
          }
        }
      }
    }
  ]

  it('query gateway correctly and displays the returned duplicates correctly', async () => {
    const { store } = createStore()
    const testComponent = createTestComponent(
      <ReviewDuplicates
        // @ts-ignore
        match={{
          params: {
            applicationId: '450ce5e3-b495-4868-bb6a-1183ffd0fee1'
          }
        }}
      />,
      store,
      graphqlMock
    )

    // wait for mocked data to load mockedProvider
    await new Promise(resolve => {
      setTimeout(resolve, 200)
    })

    testComponent.component.update()

    expect(testComponent.component.find(DuplicateDetails)).toHaveLength(2)
  })

  it('query gateway correctly and displays the returned duplicates correctly in case of minimal data', async () => {
    const { store } = createStore()
    const testComponent = createTestComponent(
      <ReviewDuplicates
        // @ts-ignore
        match={{
          params: {
            applicationId: '450ce5e3-b495-4868-bb6a-1183ffd0fee1'
          }
        }}
      />,
      store,
      graphqlMockMinimal
    )

    // wait for mocked data to load mockedProvider
    await new Promise(resolve => {
      setTimeout(resolve, 200)
    })

    testComponent.component.update()

    expect(testComponent.component.find(DuplicateDetails)).toHaveLength(2)
  })

  it('displays error text when the query to fetch duplicates fails', async () => {
    const graphqlErrorMock = [
      {
        request: {
          query: FETCH_DUPLICATES,
          variables: {
            id: '450ce5e3-b495-4868-bb6a-1183ffd0fee1'
          }
        },
        result: {
          data: {
            fetchBirthRegistration: {
              id: '450ce5e3-b495-4868-bb6a-1183ffd0fee1',
              registration: {
                duplicates: ['450ce5e3-b495-4868-bb6a-1183ffd0fff1']
              }
            }
          }
        }
      },

      {
        request: {
          query: createDuplicateDetailsQuery([
            '450ce5e3-b495-4868-bb6a-1183ffd0fee1',
            '450ce5e3-b495-4868-bb6a-1183ffd0fff1'
          ]),
          variables: {
            duplicate0Id: '450ce5e3-b495-4868-bb6a-1183ffd0fee1',
            duplicate1Id: '450ce5e3-b495-4868-bb6a-1183ffd0fff1'
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
            applicationId: '450ce5e3-b495-4868-bb6a-1183ffd0fee1'
          }
        }}
      />,
      store,
      graphqlErrorMock
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
    const graphqlErrorMock = [
      {
        request: {
          query: FETCH_DUPLICATES,
          variables: {
            id: '450ce5e3-b495-4868-bb6a-1183ffd0fee1'
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
            applicationId: '450ce5e3-b495-4868-bb6a-1183ffd0fee1'
          }
        }}
      />,
      store,
      graphqlErrorMock
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
  describe('reject for duplication', () => {
    let component: ReactWrapper<{}, {}>
    beforeEach(async () => {
      const { store } = createStore()
      const testComponent = createTestComponent(
        <ReviewDuplicates
          // @ts-ignore
          match={{
            params: {
              applicationId: '450ce5e3-b495-4868-bb6a-1183ffd0fee1'
            }
          }}
        />,
        store,
        graphqlMock
      )
      component = testComponent.component
      // wait for mocked data to load mockedProvider
      await new Promise(resolve => {
        setTimeout(resolve, 100)
      })
      component.update()
    })
    it('detail boxes are loaded properly', () => {
      expect(
        component
          .find('#detail_box_450ce5e3-b495-4868-bb6a-1183ffd0fee1')
          .hostNodes()
      ).toHaveLength(1)
      expect(
        component
          .find('#detail_box_450ce5e3-b495-4868-bb6a-1183ffd0fff1')
          .hostNodes()
      ).toHaveLength(1)
    })
    it('reject confirmation shows up if reject link is clicked', () => {
      component
        .find('#reject_link_450ce5e3-b495-4868-bb6a-1183ffd0fee1')
        .hostNodes()
        .simulate('click')

      component.update()
      expect(component.find('#reject_confirm').hostNodes()).toHaveLength(1)
    })
    it('back link on reject confirm modal hides the confirm modal', () => {
      component
        .find('#reject_link_450ce5e3-b495-4868-bb6a-1183ffd0fee1')
        .hostNodes()
        .simulate('click')

      component
        .find('#back_link')
        .hostNodes()
        .simulate('click')

      component.update()

      expect(component.find('#reject_confirm').hostNodes()).toHaveLength(0)
    })

    it('successfuly rejects the application', async () => {
      const mock = clone(graphqlMock)
      mock.push({
        request: {
          query: rejectMutation,
          variables: {
            id: '450ce5e3-b495-4868-bb6a-1183ffd0fee1',
            // @ts-ignore
            reason: 'duplicate'
          }
        },
        result: {
          data: {
            // @ts-ignore
            markEventAsVoided: '450ce5e3-b495-4868-bb6a-1183ffd0fee1'
          }
        }
      })
      const { store } = createStore()
      const testComponent = createTestComponent(
        <ReviewDuplicates
          // @ts-ignore
          match={{
            params: {
              applicationId: '450ce5e3-b495-4868-bb6a-1183ffd0fee1'
            }
          }}
        />,
        store,
        mock
      )
      await new Promise(resolve => {
        setTimeout(resolve, 100)
      })
      testComponent.component.update()

      testComponent.component
        .find('#reject_link_450ce5e3-b495-4868-bb6a-1183ffd0fee1')
        .hostNodes()
        .simulate('click')
      testComponent.component.update()

      testComponent.component
        .find('#reject_confirm')
        .hostNodes()
        .simulate('click')

      // wait for mocked data to load mockedProvider
      await new Promise(resolve => {
        setTimeout(resolve, 100)
      })
      testComponent.component.update()

      expect(
        testComponent.component.find('#reject_confirm').hostNodes()
      ).toHaveLength(0)
    })
  })
  describe('remove duplication mark', () => {
    let component: ReactWrapper<{}, {}>
    beforeEach(async () => {
      const { store } = createStore()
      const testComponent = createTestComponent(
        <ReviewDuplicates
          // @ts-ignore
          match={{
            params: {
              applicationId: '450ce5e3-b495-4868-bb6a-1183ffd0fee1'
            }
          }}
        />,
        store,
        graphqlMock
      )
      component = testComponent.component
      // wait for mocked data to load mockedProvider
      await new Promise(resolve => {
        setTimeout(resolve, 100)
      })
      component.update()
    })

    it('reject confirmation shows up if reject link is clicked', () => {
      component
        .find('#not_duplicate_link_450ce5e3-b495-4868-bb6a-1183ffd0fee1')
        .hostNodes()
        .simulate('click')

      component.update()
      expect(component.find('#not_duplicate_confirm').hostNodes()).toHaveLength(
        1
      )
    })
    it('back link on reject confirm modal hides the confirm modal', () => {
      component
        .find('#not_duplicate_link_450ce5e3-b495-4868-bb6a-1183ffd0fee1')
        .hostNodes()
        .simulate('click')

      component
        .find('#not_duplicate_close')
        .hostNodes()
        .simulate('click')

      component.update()

      expect(component.find('#not_duplicate_confirm').hostNodes()).toHaveLength(
        0
      )
    })

    it('successfully removes duplicate from application', async () => {
      const mock = clone(graphqlMock)
      // @ts-ignore
      mock.push({
        request: {
          query: notADuplicateMutation,
          variables: {
            id: '450ce5e3-b495-4868-bb6a-1183ffd0fee1',
            // @ts-ignore
            duplicateId: '450ce5e3-b495-4868-bb6a-1183ffd0fee1'
          }
        },
        result: {
          data: {
            // @ts-ignore
            notADuplicate: '450ce5e3-b495-4868-bb6a-1183ffd0fee1'
          }
        }
      })
      const { store } = createStore()
      const testComponent = createTestComponent(
        <ReviewDuplicates
          // @ts-ignore
          match={{
            params: {
              applicationId: '450ce5e3-b495-4868-bb6a-1183ffd0fee1'
            }
          }}
        />,
        store,
        mock
      )
      await new Promise(resolve => {
        setTimeout(resolve, 100)
      })
      testComponent.component.update()

      testComponent.component
        .find('#not_duplicate_link_450ce5e3-b495-4868-bb6a-1183ffd0fee1')
        .hostNodes()
        .simulate('click')
      testComponent.component.update()

      testComponent.component
        .find('#not_duplicate_confirm')
        .hostNodes()
        .simulate('click')

      // wait for mocked data to load mockedProvider
      await new Promise(resolve => {
        setTimeout(resolve, 100)
      })
      testComponent.component.update()

      expect(
        testComponent.component.find('#not_duplicate_confirm').hostNodes()
      ).toHaveLength(0)
    })

    it('successfully redirects to work queue if all duplicates removed', async () => {
      const mock = clone(graphqlMock)
      // @ts-ignore
      mock.push({
        request: {
          query: notADuplicateMutation,
          variables: {
            id: '450ce5e3-b495-4868-bb6a-1183ffd0fee1',
            // @ts-ignore
            duplicateId: '450ce5e3-b495-4868-bb6a-1183ffd0fff1'
          }
        },
        result: {
          data: {
            // @ts-ignore
            notADuplicate: '450ce5e3-b495-4868-bb6a-1183ffd0fee1'
          }
        }
      })
      const { store } = createStore()
      const testComponent = createTestComponent(
        <ReviewDuplicates
          // @ts-ignore
          match={{
            params: {
              applicationId: '450ce5e3-b495-4868-bb6a-1183ffd0fee1'
            }
          }}
        />,
        store,
        mock
      )
      await new Promise(resolve => {
        setTimeout(resolve, 100)
      })
      testComponent.component.update()

      testComponent.component
        .find('#not_duplicate_link_450ce5e3-b495-4868-bb6a-1183ffd0fff1')
        .hostNodes()
        .simulate('click')
      testComponent.component.update()

      testComponent.component
        .find('#not_duplicate_confirm')
        .hostNodes()
        .simulate('click')

      // wait for mocked data to load mockedProvider
      await new Promise(resolve => {
        setTimeout(resolve, 100)
      })
      testComponent.component.update()

      expect(assign).toBeCalledWith(SEARCH_RESULT)
    })

    it('successfully redirects to work queue if no duplicates returned from fetch query', async () => {
      const { store } = createStore()
      const testComponent = createTestComponent(
        <ReviewDuplicates
          // @ts-ignore
          match={{
            params: {
              applicationId: '460ce5e3-b495-4868-bb6a-1183ffd0fee1'
            }
          }}
        />,
        store,
        graphqlMock
      )
      await new Promise(resolve => {
        setTimeout(resolve, 100)
      })
      testComponent.component.update()

      // wait for mocked data to load mockedProvider
      await new Promise(resolve => {
        setTimeout(resolve, 100)
      })
      testComponent.component.update()

      expect(assign).toBeCalledWith(SEARCH_RESULT)
    })
  })

  it('takes user back to work queue page when back button is pressed', async () => {
    const { store } = createStore()
    const testComponent = createTestComponent(
      <ReviewDuplicates
        // @ts-ignore
        match={{
          params: {
            applicationId: '450ce5e3-b495-4868-bb6a-1183ffd0fee1'
          }
        }}
      />,
      store,
      graphqlMock
    )

    // wait for mocked data to load mockedProvider
    await new Promise(resolve => {
      setTimeout(resolve, 200)
    })

    testComponent.component.update()

    testComponent.component
      .find('#action_page_back_button')
      .hostNodes()
      .simulate('click')
    testComponent.component.update()

    expect(assign).toBeCalledWith(SEARCH_RESULT)
  })
})
