import React from 'react';
//import { connect } from 'react-redux';
//import LoginContainer from '../containers/LoginContainer';
import HeaderContainer from '../containers/HeaderContainer';
import HomeContainer from '../containers/HomeContainer';
//import Declarations from '../components/Declarations';
import WorkContainer from '../containers/WorkContainer';
import { BrowserRouter, Route, Switch } from 'react-router-dom';


const App = (props) => (
  <BrowserRouter>
      <Switch>
        <Route exact path="/" component={HomeContainer}/>
        <Route path="/work" component={WorkContainer} />
      </Switch>
  </BrowserRouter>
);

export default App;


/*
const App = ({ dispatch, declaration, isAuthenticated, errorMessage }) => (
  <div className={styles.app}>
    <HeaderContainer />
    <div className={styles.splashContainer}>
        <div className={styles.splash}>
            <h1 className={styles.splashHead}>Open CRVS</h1>
            <p className={styles.splashSubhead}>
                The free civil registration and vital statistics platform.
            </p>
            <div className="">
            { !isAuthenticated  ?
              <LoginContainer
                isAuthenticated={isAuthenticated}
                errorMessage={errorMessage}
                dispatch={dispatch}
              /> :
              <p>
                <a href="#" className={styles.loginButton}>Get Started</a>
              </p>
            }
            </div>
        </div>
    </div>
    
    {
      isAuthenticated ? 
      <div className="container">
        <Declarations
          onDeclarationClick={() => dispatch(fetchDeclaration())}
          declaration={declaration}
        />
      </div> :
      <div className="container">
      </div>
    }

    <HomeContainer />
  </div>
);

const mapStateToProps = ({ declarationsReducer, userReducer }) => {
  const { declaration, authenticated, isFetchingDeclaration } = declarationsReducer;
  const { isAuthenticated, isFetchingUser, errorMessage } = userReducer;

  return {
    declaration,
    authenticated,
    isAuthenticated,
    isFetchingUser,
    errorMessage,
    isFetchingDeclaration,
  };
};

export default connect(mapStateToProps, null)(App);
*/

