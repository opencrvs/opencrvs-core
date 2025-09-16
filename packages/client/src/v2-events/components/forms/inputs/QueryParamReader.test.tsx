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
import { ReactWrapper } from 'enzyme'
import React from 'react'
import { createTestComponent } from '@client/tests/util'
import { AppStore, createStore } from '@client/store'
import { FormFieldGenerator } from '../FormFieldGenerator'

describe('QueryParamReader tests', () => {
  let component: ReactWrapper
  let store: AppStore
  const onChangeMock = vi.fn()

  describe('without map configuration', () => {
    beforeEach(async () => {
      ;({ store } = createStore())
      ;({ component } = await createTestComponent(
        <FormFieldGenerator
          fields={[
            {
              id: 'event.query-param-reader',
              type: 'QUERY_PARAM_READER',
              conditionals: [],
              label: {
                id: 'event.query-param-reader.label',
                defaultMessage: 'Query Param Reader',
                description: 'This is the label for the field'
              },
              configuration: {}
            }
          ]}
          id="event"
          onChange={onChangeMock}
        />,
        {
          store,
          path: '/',
          initialEntries: ['/?auth_token=123&client_session=abc']
        }
      ))
    })
    test('reads query params', () => {
      expect(onChangeMock).toBeCalledWith({
        'event.query-param-reader': { auth_token: '123', client_session: 'abc' }
      })
    })
  })
  describe('with map configuration', () => {
    beforeEach(async () => {
      ;({ store } = createStore())
      ;({ component } = await createTestComponent(
        <FormFieldGenerator
          fields={[
            {
              id: 'event.query-param-reader',
              type: 'QUERY_PARAM_READER',
              conditionals: [],
              label: {
                id: 'event.query-param-reader.label',
                defaultMessage: 'Query Param Reader',
                description: 'This is the label for the field'
              },
              configuration: {
                map: { token: 'auth_token', session: 'client_session' }
              }
            }
          ]}
          id="event"
          onChange={onChangeMock}
        />,
        {
          store,
          path: '/',
          initialEntries: ['/?auth_token=123&client_session=abc']
        }
      ))
    })
    test('reads query params with mapped properties', () => {
      expect(onChangeMock).toBeCalledWith({
        'event.query-param-reader': { token: '123', session: 'abc' }
      })
    })
  })
})
