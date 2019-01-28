import * as React from 'react'
import { createTestComponent } from 'src/tests/util'
import { MyRecords } from './MyRecords'
import { DataTable } from '@opencrvs/components/lib/interface'
import { createStore } from 'src/store'
import * as actions from 'src/records/actions'
import { storage } from 'src/storage'
import { GQLBirthRegistration } from '@opencrvs/gateway/src/graphql/schema'
import { transformData } from 'src/utils/transforListData'

storage.getItem = jest.fn()
storage.setItem = jest.fn()
const setItem = window.localStorage.setItem as jest.Mock
describe('MyRecords tests', async () => {
  const { store } = createStore()
  it('load MyRecords component', async () => {
    const records = {
      data: [
        {
          id: '5adbd1a1-806c-4abd-af9a-5844f6a005a0',
          name: 'নাইম ইসলাম',
          dob: '2012-01-01',
          date_of_application: '2019-01-22',
          registrationNumber: '',
          tracking_id: 'BXWQEK2',
          createdAt: '2019-01-22T03:31:05.948Z',
          status: [
            {
              type: 'APPLICATION',
              practitionerName: '',
              timestamp: '2019-01-22',
              practitionerRole: 'FIELD_AGENT',
              location: 'Moktarpur'
            }
          ],
          declaration_status: 'DECLARED',
          event: 'birth',
          duplicates: null,
          location: 'Moktarpur'
        },
        {
          id: '5adbd1a1-806c-4abd-af9a-5844f6a005a0',
          name: 'নাইম ইসলাম',
          dob: '2012-01-01',
          date_of_application: '2019-01-22',
          registrationNumber: '',
          tracking_id: 'BXWQEK2',
          createdAt: '2019-01-22T03:31:05.948Z',
          status: [
            {
              type: 'REGISTERED',
              practitionerName: '',
              timestamp: '2019-01-22',
              practitionerRole: 'FIELD_AGENT',
              location: 'Moktarpur'
            }
          ],
          declaration_status: 'DECLARED',
          event: 'birth',
          duplicates: null,
          location: 'Moktarpur'
        },
        {
          id: '5adbd1a1-806c-4abd-af9a-5844f6a005a0',
          name: 'নাইম ইসলাম',
          dob: '2012-01-01',
          date_of_application: '2019-01-22',
          registrationNumber: '',
          tracking_id: 'BXWQEK2',
          createdAt: '2019-01-22T03:31:05.948Z',
          status: [
            {
              type: 'COLLECTED',
              practitionerName: '',
              timestamp: '2019-01-22',
              practitionerRole: 'FIELD_AGENT',
              location: 'Moktarpur'
            }
          ],
          declaration_status: 'DECLARED',
          event: 'birth',
          duplicates: null,
          location: 'Moktarpur'
        },
        {
          id: '5adbd1a1-806c-4abd-af9a-5844f6a005a0',
          name: 'নাইম ইসলাম',
          dob: '2012-01-01',
          date_of_application: '2019-01-22',
          registrationNumber: '',
          tracking_id: 'BXWQEK2',
          createdAt: '2019-01-22T03:31:05.948Z',
          status: [
            {
              type: 'DECLARED',
              practitionerName: '',
              timestamp: '2019-01-22',
              practitionerRole: 'FIELD_AGENT',
              location: 'Moktarpur'
            }
          ],
          declaration_status: 'DECLARED',
          event: 'birth',
          duplicates: null,
          location: 'Moktarpur'
        },
        {
          id: '5adbd1a1-806c-4abd-af9a-5844f6a005a0',
          name: 'নাইম ইসলাম',
          dob: '2012-01-01',
          date_of_application: '2019-01-22',
          registrationNumber: '',
          tracking_id: 'BXWQEK2',
          createdAt: '2019-01-22T03:31:05.948Z',
          status: [
            {
              type: 'REJECTED',
              practitionerName: '',
              timestamp: '2019-01-22',
              practitionerRole: 'FIELD_AGENT',
              location: 'Moktarpur'
            }
          ],
          declaration_status: 'DECLARED',
          event: 'birth',
          duplicates: null,
          location: 'Moktarpur'
        }
      ]
    }
    setItem.mockClear()
    const action = {
      type: actions.MY_RECRODS_LOADED,
      payload: records.data
    }
    store.dispatch(action)
    const testComponent = createTestComponent(
      // @ts-ignore
      <MyRecords />,
      store
    )

    testComponent.component.update()
    console.log(testComponent.component)
    testComponent.component
      .find(DataTable)
      .find('button')
      .at(0)
      .hostNodes()
      .simulate('click')
    testComponent.component
      .find(DataTable)
      .find('button')
      .at(1)
      .hostNodes()
      .simulate('click')

    testComponent.component
      .find(DataTable)
      .find('button')
      .at(2)
      .hostNodes()
      .simulate('click')

    testComponent.component
      .find(DataTable)
      .find('button')
      .at(3)
      .hostNodes()
      .simulate('click')

    testComponent.component
      .find(DataTable)
      .find('button')
      .at(4)
      .hostNodes()
      .simulate('click')
    expect(
      testComponent.component.find('#myRecords').hostNodes().length
    ).toEqual(1)

    testComponent.component.unmount()
  })
  it('check transformed data', async () => {
    const records = [
      {
        id: '5adbd1a1-806c-4abd-af9a-5844f6a005a0',
        registration: {
          trackingId: 'BXWQEK2',
          registrationNumber: '234',
          status: [
            {
              user: {
                name: [
                  { use: 'en', firstNames: 'Shakib', familyName: 'Al Hasan' },
                  { use: 'bn', firstNames: '', familyName: '' }
                ],
                role: 'FIELD_AGENT'
              },
              location: { name: 'Moktarpur', alias: ['মোক্তারপুর'] },
              type: 'DECLARED',
              timestamp: '2019-01-22T03:31:05.948Z'
            }
          ]
        },
        child: {
          name: [
            {
              use: 'bn',
              firstNames: 'নাইম',
              familyName: 'ইসলাম'
            },
            {
              use: 'en',
              firstNames: '',
              familyName: ''
            }
          ],
          birthDate: '2012-01-01'
        },
        createdAt: '2019-01-22T03:31:05.948Z'
      }
    ]

    const transformed = transformData(records as GQLBirthRegistration[])
    expect(transformed.length).toEqual(1)
    expect(transformed[0].name).toEqual('নাইম ইসলাম')
  })
})
