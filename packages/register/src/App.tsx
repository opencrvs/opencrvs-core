import { Button } from '@opencrvs/components/lib/Button';
import * as React from 'react';
import './App.css';

import logo from './logo.svg';

// tslint:disable
const foo = () => console.log('sdf');

class App extends React.Component {
  public render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
          <Button onPress={foo} title="Hello!" />
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.tsx</code> and save to reload.
        </p>
      </div>
    );
  }
}

export default App;
