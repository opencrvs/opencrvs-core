import * as React from 'react'
import { Provider } from 'react-redux'
import { IntlProvider, injectIntl, defineMessages } from 'react-intl'
import { ConnectedRouter } from 'react-router-redux'
import ApolloClient from 'apollo-boost'
import { ApolloProvider, Query } from 'react-apollo'
import { resolve } from 'url'
import gql from 'graphql-tag'
import { Button } from '@opencrvs/components/lib/Button'
import './App.css'

import logo from './logo.svg'
import { store, history } from './store'
import { Route } from 'react-router'

const foo = () => alert('sdf')

const messages = defineMessages({
  welcome: {
    id: 'app.welcome',
    defaultMessage: 'Welcome',
    description: 'Test text'
  }
})

const Title = injectIntl(({ intl }) => (
  <h1 className="App-title">{intl.formatMessage(messages.welcome)}</h1>
))

const Declarations = () => (
  <Query
    query={gql`
      {
        listBirthRegistrations(status: "declared") {
          id
          mother {
            gender
            name {
              givenName
              familyName
            }
          }
          father {
            gender
            name {
              givenName
              familyName
            }
          }
          child {
            gender
            name {
              givenName
              familyName
            }
          }
          createdAt
        }
      }
    `}
  >
    {({ loading, error, data }) => {
      if (loading) {
        return <p>Loading...</p>
      }
      if (error) {
        return <p>Error :(</p>
      }

      return (
        <p>
          Mothers name:{' '}
          {data.listBirthRegistrations[0].mother.name[0].givenName}
        </p>
      )
    }}
  </Query>
)

const Home = () => (
  <div className="App">
    <header className="App-header">
      <img src={logo} className="App-logo" alt="logo" />
      <Title />
      <Button onClick={foo}>Hello</Button>
    </header>
    <p className="App-intro">
      To get started, edit <code>src/App.tsx</code> and save to reload.
    </p>
    <Declarations />
  </div>
)
const Other = () => (
  <div className="App">
    <h1>page 2</h1>
  </div>
)

const GRAPHQL_URL = `${process.env.REACT_APP_API_GATEWAY_IP}:${
  process.env.REACT_APP_API_GATEWAY_PORT
}/`

const client = new ApolloClient({
  uri: resolve(GRAPHQL_URL, 'graphql')
})

export class App extends React.Component<{ client?: ApolloClient<{}> }, {}> {
  public render() {
    return (
      <ApolloProvider client={this.props.client || client}>
        <Provider store={store}>
          <IntlProvider locale="en">
            <ConnectedRouter history={history}>
              <div>
                <Route exact path="/" component={Home} />
                <Route exact path="/other" component={Other} />
              </div>
            </ConnectedRouter>
          </IntlProvider>
        </Provider>
      </ApolloProvider>
    )
  }
}
