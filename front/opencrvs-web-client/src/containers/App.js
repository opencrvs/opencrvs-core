/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:17:32 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-28 17:58:17
 */
import React from 'react';
import { connect } from 'react-redux';
import HomeContainer from 'containers/HomeContainer';
import WorkContainer from 'containers/WorkContainer';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { Redirect } from 'react-router';

const App = props => (
  <BrowserRouter>
    <Switch>
      <Route exact path="/" component={HomeContainer} />
      <Route exact path="/tokenexpired" component={HomeContainer} />
      <PrivateRoute
        path="/work"
        redirectTo="/"
        isAuthenticated={props.isAuthenticated}
        component={WorkContainer}
      />
    </Switch>
  </BrowserRouter>
);

const mapStateToProps = ({ userReducer, declarationsReducer }) => {
  const { isAuthenticated } = userReducer;
  return {
    isAuthenticated,
  };
};

const renderMergedProps = (component, ...rest) => {
  const finalProps = Object.assign({}, ...rest);
  return React.createElement(component, finalProps);
};

const PrivateRoute = ({ component, redirectTo, isAuthenticated, ...rest }) => {
  return (
    <Route
      {...rest}
      render={routeProps => {
        return isAuthenticated
          ? renderMergedProps(component, routeProps, rest)
          : <Redirect
              to={{
                pathname: redirectTo,
                state: { from: routeProps.location },
              }}
            />;
      }}
    />
  );
};

export default connect(mapStateToProps, null)(App);
