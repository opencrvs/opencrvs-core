/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:17:32 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-10-08 17:38:15
 */
import React from 'react';
import { connect } from 'react-redux';
import HomeContainer from 'containers/HomeContainer';
import WorkContainer from 'containers/WorkContainer';
import ReportsContainer from 'containers/ReportsContainer';
import SettingsContainer from 'containers/SettingsContainer';
import StatsContainer from 'containers/StatsContainer';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { Redirect } from 'react-router';

// Combine React router with redux and add paths

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
      <PrivateRoute
        path="/reports"
        redirectTo="/"
        isAuthenticated={props.isAuthenticated}
        component={ReportsContainer}
      />
      <PrivateRoute
        path="/statistics"
        redirectTo="/"
        isAuthenticated={props.isAuthenticated}
        component={StatsContainer}
      />
      <PrivateRoute
        path="/settings"
        redirectTo="/"
        isAuthenticated={props.isAuthenticated}
        component={SettingsContainer}
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

const renderMergedProps = (component, ...restProps) => React.createElement(component, ...restProps);

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
