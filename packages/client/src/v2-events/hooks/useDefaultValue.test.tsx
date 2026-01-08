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
import React, { PropsWithChildren } from 'react'
import superjson from 'superjson'
import { createTRPCMsw, httpLink } from '@vafanassieff/msw-trpc'
import { setupServer } from 'msw/node'
import { renderHook, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { AddressType, FieldConfig, user } from '@opencrvs/commons/client'
import { AppRouter, TRPCProvider, queryClient } from '../trpc'
import { testDataGenerator } from '../../tests/test-data-generators'
import { createTestStore } from '../../tests/util'
import { useSystemVariables } from './useSystemVariables'
import { useDefaultValues } from './useDefaultValues'

const fields: FieldConfig[] = [
  {
    id: 'child.name',
    label: {
      id: 'event.birth.action.declare.form.section.child.field.name.label',
      defaultMessage: "Child's name",
      description: 'This is the label for the field'
    },
    configuration: {
      name: {
        firstname: {
          required: true
        },
        surname: {
          required: true
        }
      },
      maxLength: 32
    },
    type: 'NAME',
    defaultValue: {
      firstname: 'John',
      surname: 'Doe'
    }
  },
  {
    id: 'child.gender',
    label: {
      id: 'event.birth.action.declare.form.section.child.field.gender.label',
      defaultMessage: 'Sex',
      description: 'This is the label for the field'
    },
    options: [
      {
        value: 'male',
        label: {
          id: 'form.field.label.sexMale',
          defaultMessage: 'Male',
          description: 'Label for option male'
        }
      },
      {
        value: 'female',
        label: {
          id: 'form.field.label.sexFemale',
          defaultMessage: 'Female',
          description: 'Label for option female'
        }
      },
      {
        value: 'unknown',
        label: {
          id: 'form.field.label.sexUnknown',
          defaultMessage: 'Unknown',
          description: 'Label for option unknown'
        }
      }
    ],
    type: 'SELECT',
    defaultValue: 'female'
  },
  {
    id: 'child.dob',
    label: {
      id: 'event.birth.action.declare.form.section.child.field.dob.label',
      defaultMessage: 'Date of birth',
      description: 'This is the label for the field'
    },
    type: 'DATE'
  },
  {
    id: 'child.birthLocation.privateHome',
    label: {
      id: 'event.birth.action.declare.form.section.child.field.birthLocation.label',
      defaultMessage: 'Child`s address',
      description: 'This is the label for the field'
    },
    configuration: {
      streetAddressForm: [
        {
          id: 'street',
          required: false,
          label: {
            id: 'field.address.street.label',
            defaultMessage: 'Street',
            description: 'This is the label for the field'
          },
          type: 'TEXT'
        },
        {
          id: 'state',
          required: {
            message: {
              id: 'field.address.state.label.required',
              defaultMessage: 'State is required',
              description: 'State required message'
            }
          },
          label: {
            id: 'field.address.state.label',
            defaultMessage: 'State',
            description: 'This is the label for the field'
          },
          type: 'TEXT'
        },
        {
          id: 'district2',
          required: {
            message: {
              id: 'field.address.district2.label.required',
              defaultMessage: 'District is required',
              description: 'District2 required message'
            }
          },
          label: {
            id: 'field.address.district2.label',
            defaultMessage: 'District',
            description: 'This is the label for the field'
          },
          type: 'TEXT'
        }
      ]
    },
    defaultValue: {
      country: 'FAR',
      addressType: AddressType.DOMESTIC,
      // @ts-ignore
      administrativeArea: user('primaryOfficeId').locationLevel('district')
    },
    type: 'ADDRESS'
  }
]

const tRPCMsw = createTRPCMsw<AppRouter>({
  links: [
    httpLink({
      url: '/api/events'
    })
  ],
  transformer: { input: superjson, output: superjson }
})

const server = setupServer(
  tRPCMsw.user.get.query((id: string) => {
    const generator = testDataGenerator()
    return generator.user.localRegistrar().v2
  })
)

beforeAll(() => server.listen())
afterEach(() => {
  server.resetHandlers()
  queryClient.clear()
})
afterAll(() => server.close())

test('defaultValue from field configs should be populated correctly', async () => {
  const { store } = await createTestStore()

  function wrapper({ children }: PropsWithChildren) {
    return (
      <Provider store={store}>
        <TRPCProvider waitForClientRestored={false}>{children}</TRPCProvider>
      </Provider>
    )
  }

  const { result } = renderHook(() => useDefaultValues(fields), { wrapper })

  await waitFor(() => expect(result.current).not.toBeNull(), {
    timeout: 3000
  })

  expect(result.current).toMatchObject({
    'child.name': { firstname: 'John', surname: 'Doe' },
    'child.gender': 'female',
    'child.dob': undefined,
    'child.birthLocation.privateHome': {
      country: 'FAR',
      addressType: 'DOMESTIC',
      administrativeArea: '62a0ccb4-880d-4f30-8882-f256007dfff9'
    }
  })
})
