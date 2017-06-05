import React from 'react';
import { connect } from 'react-redux';
//import HeaderContainer from 'containers/HeaderContainer';
import HomeContainer from 'containers/HomeContainer';
import WorkContainer from 'containers/WorkContainer';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { Redirect } from 'react-router';


const App = (props) => (
  <BrowserRouter>
      <Switch>
        <Route exact path="/" component={HomeContainer}/>
        <PrivateRoute path="/work" redirectTo="/" isAuthenticated={props.isAuthenticated} component={WorkContainer} />
      </Switch>
  </BrowserRouter>
);

const mapStateToProps = ({ userReducer }) => {
  const { isAuthenticated } = userReducer;
  return {
    isAuthenticated,
  };
};

const renderMergedProps = (component, ...rest) => {
  const finalProps = Object.assign({}, ...rest);
  return (
    React.createElement(component, finalProps)
  );
}

const PrivateRoute = ({ component, redirectTo, isAuthenticated, ...rest }) => {
  return (
    <Route {...rest} render={routeProps => {
      console.log('IS AUTHENTICATED: ' + isAuthenticated);
      return isAuthenticated ? (
        renderMergedProps(component, routeProps, rest)
      ) : (
        <Redirect to={{
          pathname: redirectTo,
          state: { from: routeProps.location }
        }}/>
      );
    }}/>
  );
};


export default connect(mapStateToProps, null)(App);

