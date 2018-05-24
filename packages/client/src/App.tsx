import * as React from 'react'
import { IntlProvider, injectIntl, defineMessages } from 'react-intl'

import { Button } from '@opencrvs/components/lib/Button'
import './App.css'

import logo from './logo.svg'

// tslint:disable
const foo = () => console.log('sdf')

interface IAppProps {}

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

export class App extends React.Component<IAppProps, {}> {
  public render() {
    return (
      <IntlProvider locale="en">
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
      </IntlProvider>
    )
  }
}
