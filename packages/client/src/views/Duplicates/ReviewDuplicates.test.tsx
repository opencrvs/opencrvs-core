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
import { createTestComponent } from '@client/tests/util'
import {
  ReviewDuplicates,
  rejectMutation,
  notADuplicateMutation,
  FETCH_DUPLICATES,
  createDuplicateDetailsQuery
} from '@client/views/Duplicates/ReviewDuplicates'
import { createStore } from '@client/store'
import { ReactWrapper } from 'enzyme'
import { DuplicateDetails } from '@client/components/DuplicateDetails'
import { clone } from 'lodash'
import { REGISTRAR_HOME } from '@client/navigation/routes'
import { waitForElement, waitFor } from '@client/tests/wait-for-element'

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
    },

    {
      request: {
        query: notADuplicateMutation,
        variables: {
          id: '450ce5e3-b495-4868-bb6a-1183ffd0fee1',
          duplicateId: '450ce5e3-b495-4868-bb6a-1183ffd0fff1'
        }
      },
      result: {
        data: {
          notADuplicate: 'ec9e0fae-8342-4fb9-803a-07b7c71325a1'
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
    const { store, history } = createStore()
    const testComponent = await createTestComponent(
      <ReviewDuplicates
        // @ts-ignore
        match={{
          params: {
            declarationId: '450ce5e3-b495-4868-bb6a-1183ffd0fee1'
          }
        }}
      />,
      { store, history, graphqlMocks: graphqlMock }
    )

    const details = await waitForElement(testComponent, DuplicateDetails)
    expect(details).toHaveLength(2)
  })

  it('query gateway correctly and displays the returned duplicates correctly in case of minimal data', async () => {
    const { store, history } = createStore()
    const testComponent = await createTestComponent(
      <ReviewDuplicates
        // @ts-ignore
        match={{
          params: {
            declarationId: '450ce5e3-b495-4868-bb6a-1183ffd0fee1'
          }
        }}
      />,
      { store, history, graphqlMocks: graphqlMockMinimal }
    )

    const details = await waitForElement(testComponent, DuplicateDetails)

    expect(details).toHaveLength(2)
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

    const { store, history } = createStore()
    const testComponent = await createTestComponent(
      <ReviewDuplicates
        // @ts-ignore
        match={{
          params: {
            declarationId: '450ce5e3-b495-4868-bb6a-1183ffd0fee1'
          }
        }}
      />,
      { store, history, graphqlMocks: graphqlErrorMock }
    )

    const error = await waitForElement(testComponent, '#duplicates-error-text')

    expect(error.children().hostNodes().text()).toBe(
      'An error occurred while fetching data'
    )
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

    const { store, history } = createStore()
    const testComponent = await createTestComponent(
      <ReviewDuplicates
        // @ts-ignore
        match={{
          params: {
            declarationId: '450ce5e3-b495-4868-bb6a-1183ffd0fee1'
          }
        }}
      />,
      { store, history, graphqlMocks: graphqlErrorMock }
    )

    const error = await waitForElement(testComponent, '#duplicates-error-text')

    expect(error.children().hostNodes().text()).toBe(
      'An error occurred while fetching data'
    )
  })
  describe('reject for duplication', () => {
    let component: ReactWrapper<{}, {}>
    beforeEach(async () => {
      const { store, history } = createStore()
      const testComponent = await createTestComponent(
        <ReviewDuplicates
          // @ts-ignore
          match={{
            params: {
              declarationId: '450ce5e3-b495-4868-bb6a-1183ffd0fee1'
            }
          }}
        />,
        { store, history, graphqlMocks: graphqlMock }
      )
      component = testComponent
      await waitForElement(component, '#review-duplicates-grid')
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

      component.find('#back_link').hostNodes().simulate('click')

      component.update()

      expect(component.find('#reject_confirm').hostNodes()).toHaveLength(0)
    })

    it('successfuly rejects the declaration', async () => {
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
      const { store, history } = createStore()
      const testComponent = await createTestComponent(
        <ReviewDuplicates
          // @ts-ignore
          match={{
            params: {
              declarationId: '450ce5e3-b495-4868-bb6a-1183ffd0fee1'
            }
          }}
        />,
        { store, history, graphqlMocks: mock }
      )
      await new Promise((resolve) => {
        setTimeout(resolve, 100)
      })
      testComponent.update()

      testComponent
        .find('#reject_link_450ce5e3-b495-4868-bb6a-1183ffd0fee1')
        .hostNodes()
        .simulate('click')
      testComponent.update()

      testComponent.find('#reject_confirm').hostNodes().simulate('click')

      // wait for mocked data to load mockedProvider
      await new Promise((resolve) => {
        setTimeout(resolve, 100)
      })
      testComponent.update()

      expect(testComponent.find('#reject_confirm').hostNodes()).toHaveLength(0)
    })
  })
  describe('remove duplication mark', () => {
    let component: ReactWrapper<{}, {}>
    beforeEach(async () => {
      const { store, history } = createStore()
      const testComponent = await createTestComponent(
        <ReviewDuplicates
          // @ts-ignore
          match={{
            params: {
              declarationId: '450ce5e3-b495-4868-bb6a-1183ffd0fee1'
            }
          }}
        />,
        { store, history, graphqlMocks: graphqlMock }
      )
      component = testComponent
      // wait for mocked data to load mockedProvider
      await new Promise((resolve) => {
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

      component.find('#not_duplicate_close').hostNodes().simulate('click')

      component.update()

      expect(component.find('#not_duplicate_confirm').hostNodes()).toHaveLength(
        0
      )
    })

    it('successfully removes duplicate from declaration', async () => {
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
      const { store, history } = createStore()
      const testComponent = await createTestComponent(
        <ReviewDuplicates
          // @ts-ignore
          match={{
            params: {
              declarationId: '450ce5e3-b495-4868-bb6a-1183ffd0fee1'
            }
          }}
        />,
        { store, history, graphqlMocks: mock }
      )
      await new Promise((resolve) => {
        setTimeout(resolve, 100)
      })
      testComponent.update()

      testComponent
        .find('#not_duplicate_link_450ce5e3-b495-4868-bb6a-1183ffd0fee1')
        .hostNodes()
        .simulate('click')
      testComponent.update()

      testComponent.find('#not_duplicate_confirm').hostNodes().simulate('click')

      // wait for mocked data to load mockedProvider
      await new Promise((resolve) => {
        setTimeout(resolve, 100)
      })
      testComponent.update()

      expect(
        testComponent.find('#not_duplicate_confirm').hostNodes()
      ).toHaveLength(0)
    })
    describe('redirects', () => {
      const originalLocation = window.location
      beforeEach(() => {
        delete (window as { location?: Location }).location
        window.location = {
          ...originalLocation,
          assign: jest.fn()
        }
      })

      afterEach(() => {
        window.location = originalLocation
      })

      it('successfully redirects to Registration-Home if all duplicates removed', async () => {
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
        const { store, history } = createStore()
        const testComponent = await createTestComponent(
          <ReviewDuplicates
            // @ts-ignore
            match={{
              params: {
                declarationId: '450ce5e3-b495-4868-bb6a-1183ffd0fee1'
              }
            }}
          />,
          { store, history, graphqlMocks: mock }
        )

        const link = await waitForElement(
          testComponent,
          '#not_duplicate_link_450ce5e3-b495-4868-bb6a-1183ffd0fee1'
        )

        link.hostNodes().simulate('click')

        const confirm = await waitForElement(
          testComponent,
          '#not_duplicate_confirm'
        )

        confirm.hostNodes().simulate('click')

        await waitFor(
          () => (window.location.assign as jest.Mock).mock.calls.length > 0
        )

        expect(window.location.assign).toBeCalledWith(REGISTRAR_HOME)
      })

      it('successfully redirects to Registration-Home if no duplicates returned from fetch query', async () => {
        const { store, history } = createStore()
        const testComponent = await createTestComponent(
          <ReviewDuplicates
            // @ts-ignore
            match={{
              params: {
                declarationId: '460ce5e3-b495-4868-bb6a-1183ffd0fee1'
              }
            }}
          />,
          { store, history, graphqlMocks: graphqlMock }
        )
        await new Promise((resolve) => {
          setTimeout(resolve, 100)
        })
        testComponent.update()

        // wait for mocked data to load mockedProvider
        await new Promise((resolve) => {
          setTimeout(resolve, 100)
        })
        testComponent.update()

        expect(window.location.assign).toBeCalledWith(REGISTRAR_HOME)
      })
    })
  })
})
