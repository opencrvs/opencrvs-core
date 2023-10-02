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
import * as React from 'react'
import { WrappedComponentProps as IntlShapeProps, injectIntl } from 'react-intl'
import { Action } from '@client/forms'
import { Event } from '@client/utils/gateway'
import { getBirthQueryMappings } from '@client/views/DataProvider/birth/queries'
import { getDeathQueryMappings } from '@client/views/DataProvider/death/queries'
import { getMarriageQueryMappings } from '@client/views/DataProvider/marriage/queries'
import { Query } from '@client/components/Query'
import { WatchQueryFetchPolicy } from '@apollo/client'

interface IQueryProviderProps {
  event: Event
  action: Action
  payload?: any
  fetchPolicy?: WatchQueryFetchPolicy
  children?: React.ReactNode
}
type IProps = IQueryProviderProps & IntlShapeProps
/* Need to add mappings for events here */
const QueryMapper = {
  [Event.Birth]: getBirthQueryMappings,
  [Event.Death]: getDeathQueryMappings,
  [Event.Marriage]: getMarriageQueryMappings
}
export const getQueryMapping = (event: Event, action: Action) => {
  return QueryMapper[event] && QueryMapper[event](action)
}

export const QueryContext = React.createContext({
  loading: false,
  error: {},
  data: {},
  dataKey: ''
})
class QueryProviderComponent extends React.Component<IProps> {
  getMapping() {
    const { event, action } = this.props
    return QueryMapper[event] && QueryMapper[event](action)
  }

  render() {
    const eventQueryMapping = this.getMapping()
    if (!eventQueryMapping) {
      return null
    }
    return (
      <Query
        query={eventQueryMapping.query}
        variables={this.props.payload || {}}
        fetchPolicy={this.props.fetchPolicy || 'cache-first'} // By default, Apollo Client's fetch policy is cache-first
      >
        {({
          loading,
          error,
          data
        }: {
          loading: any
          error?: any
          data: any
        }) => {
          return (
            <QueryContext.Provider
              value={{
                loading,
                // @ts-ignore
                error,
                data,
                dataKey: eventQueryMapping.dataKey
              }}
            >
              {this.props.children}
            </QueryContext.Provider>
          )
        }}
      </Query>
    )
  }
}

export const QueryProvider = injectIntl(QueryProviderComponent)
