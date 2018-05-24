import * as React from 'react'
import { Provider } from 'react-redux'
import { IntlProvider, injectIntl, defineMessages } from 'react-intl'
import { ConnectedRouter } from 'react-router-redux'

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
  </div>
)
const Other = () => (
  <div className="App">
    <h1>page 2</h1>
  </div>
)

export class App extends React.Component<{}, {}> {
  public render() {
    return (
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
    )
  }
}
