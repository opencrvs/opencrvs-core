import * as React from 'react'
import { InjectedIntlProps, injectIntl } from 'react-intl'
import { Event, Action } from 'src/forms'
import { getBirthQueryMappings } from './birth/queries'
import { getDeathQueryMappings } from './death/queries'
import { Query } from 'react-apollo'

interface IQueryProviderProps {
  event: Event
  action: Action
  payload?: any
}
type IProps = IQueryProviderProps & InjectedIntlProps
/* Need to add mappings for events here */
const QueryMapper = {
  [Event.BIRTH]: getBirthQueryMappings,
  [Event.DEATH]: getDeathQueryMappings
}

export const QueryContext = React.createContext({
  loading: false,
  error: undefined,
  data: undefined,
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
      >
        {({ loading, error, data }) => {
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
