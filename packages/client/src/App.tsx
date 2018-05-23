import * as React from 'react';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { Button } from '@opencrvs/components/lib/Button';
import './App.css';

import logo from './logo.svg';

// tslint:disable
const foo = () => console.log('sdf');

interface IAppProps {}

const welcomeMessage = {
  id: 'app.welcome',
  defaultMessage: 'Welcome',
  description: 'Test text'
}

class Component extends React.Component<IAppProps & InjectedIntlProps, {}> {
  public render() {
    const { intl } = this.props

    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">{intl.formatMessage(welcomeMessage)}</h1>
          <Button onClick={foo}>Hello</Button>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.tsx</code> and save to reload.
        </p>
      </div>
    );
  }
}

export const App = injectIntl<IAppProps>(Component);
