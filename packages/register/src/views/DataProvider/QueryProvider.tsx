import * as React from 'react'
import { WrappedComponentProps as IntlShapeProps, injectIntl } from 'react-intl'
import { Event, Action } from '@register/forms'
import { getBirthQueryMappings } from '@register/views/DataProvider/birth/queries'
import { getDeathQueryMappings } from '@register/views/DataProvider/death/queries'
import { Query } from '@register/components/Query'
import { WatchQueryFetchPolicy } from 'apollo-client'

interface IQueryProviderProps {
  event: Event
  action: Action
  payload?: any
  fetchPolicy?: WatchQueryFetchPolicy
}
type IProps = IQueryProviderProps & IntlShapeProps
/* Need to add mappings for events here */
const QueryMapper = {
  [Event.BIRTH]: getBirthQueryMappings,
  [Event.DEATH]: getDeathQueryMappings
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
