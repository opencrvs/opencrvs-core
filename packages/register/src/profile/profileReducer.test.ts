import * as actions from './profileActions'
import { initialState } from './profileReducer'
import { createStore, AppStore } from '../store'

describe('profileReducer tests', () => {
  let store: AppStore
  beforeEach(() => {
    store = createStore().store
  })

  it('sets user as logged out on bad token', async () => {
    const expectedState = {
      ...initialState,
      authenticated: false
    }

    const action = {
      type: actions.CHECK_AUTH,
      payload: {
        badToken: '12345'
      }
    }
    store.dispatch(action)
    expect(store.getState().profile).toEqual(expectedState)
  })

  it('sets user details', async () => {
    const action = {
      type: actions.SET_USER_DETAILS,
      payload: {
        data: {
          getUser: {
            catchmentArea: [
              {
                id: 'ddab090d-040e-4bef-9475-314a448a576a',
                name: 'Dhaka',
                status: 'active',
                __typename: 'Location'
              },
              {
                id: 'f9ec1fdb-086c-4b3d-ba9f-5257f3638286',
                name: 'GAZIPUR',
                status: 'active',
                __typename: 'Location'
              },
              {
                id: '825b17fb-4308-48cb-b77c-2f2cee4f14b9',
                name: 'KALIGANJ',
                status: 'active',
                __typename: 'Location'
              },
              {
                id: '6a87dcd8-d784-4607-808b-50a45e62e405',
                name: 'BAKTARPUR',
                status: 'active',
                __typename: 'Location'
              }
            ],
            primaryOffice: {
              id: '2a83cf14-b959-47f4-8097-f75a75d1867f',
              name: 'Kaliganj Union Sub Center',
              status: 'active',
              __typename: 'Location'
            },
            __typename: 'User'
          }
        }
      }
    }
    store.dispatch(action)
    expect(store.getState().profile.userDetailsFetched).toEqual(true)
  })
})
