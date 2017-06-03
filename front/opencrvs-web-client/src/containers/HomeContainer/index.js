import React from 'react';
import HeaderContainer from '../HeaderContainer';
import FooterContainer from '../FooterContainer';
import LoginContainer from '../LoginContainer';
import { connect } from 'react-redux';
import styles from './styles.css';

const HomeContainer = ({
  dispatch,
  isAuthenticated,
  errorMessage,
}) => (
  <div className={styles.app}>

    <HeaderContainer />
    <div className={styles.splashContainer}>
      <div className={styles.splash}>
        <h1 className={styles.splashHead}>Open CRVS</h1>
        <p className={styles.splashSubhead}>
          The free civil registration and vital statistics platform.
        </p>
        <div className="">
          {!isAuthenticated
            ? <LoginContainer
                isAuthenticated={isAuthenticated}
                errorMessage={errorMessage}
                dispatch={dispatch}
              />
            : <p>
                <a href="#" className={styles.loginButton}>Get Started</a>
              </p>}
        </div>
      </div>
    </div>
    <div className={styles.contentWrapper}>
      <div className={styles.content}>
        <h2 className={styles.contentHead}>
          No license costs ... Simple and accessible
        </h2>
        <div className="pure-g">
          <div
            className={styles.lBox + ' pure-u-1 pure-u-md-1-2 pure-u-lg-1-4'}
          >
            <h3 className={styles.contentSubhead}>
              <i className="fa fa-rocket" />
              Interoperable with health systems
            </h3>
            <p>
              Phasellus eget enim eu lectus faucibus vestibulum. Suspendisse sodales pellentesque elementum.
            </p>
          </div>
          <div
            className={styles.lBox + ' pure-u-1 pure-u-md-1-2 pure-u-lg-1-4'}
          >
            <h3 className={styles.contentSubhead}>
              <i className="fa fa-mobile" />
              Designed For Mobility
            </h3>
            <p>
              Phasellus eget enim eu lectus faucibus vestibulum. Suspendisse sodales pellentesque elementum.
            </p>
          </div>
          <div
            className={styles.lBox + ' pure-u-1 pure-u-md-1-2 pure-u-lg-1-4'}
          >
            <h3 className={styles.contentSubhead}>
              <i className="fa fa-th-large" />
              Easy to configure
            </h3>
            <p>
              Phasellus eget enim eu lectus faucibus vestibulum. Suspendisse sodales pellentesque elementum.
            </p>
          </div>
          <div
            className={styles.lBox + ' pure-u-1 pure-u-md-1-2 pure-u-lg-1-4'}
          >
            <h3 className={styles.contentSubhead}>
              <i className="fa fa-check-square-o" />
              Safe & Secure
            </h3>
            <p>
              Phasellus eget enim eu lectus faucibus vestibulum. Suspendisse sodales pellentesque elementum.
            </p>
          </div>
        </div>
      </div>

      <div className={styles.ribbon + ' ' + styles.lBoxLrg + ' pure-g'}>
        <div
          className={
            styles.downloadGuides +
              ' ' +
              styles.lBoxLrg +
              ' pure-u-1 pure-u-md-1-2 pure-u-lg-2-5'
          }
        >
          <img
            width="300"
            alt="File Icons"
            className="pure-img-responsive"
            src="img/common/file-icons.png"
          />
        </div>
        <div className="pure-u-1 pure-u-md-1-2 pure-u-lg-3-5">

          <h2 className={styles.contentHead + ' ' + styles.contentHeadRibbon}>
            Learn how Open CRVS can be configured
          </h2>

          <p>
            Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
            tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
            quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
            consequat. Duis aute irure dolor.
          </p>
        </div>
      </div>

      <div className={styles.contentAboveFooter}>
        <h2 className={styles.contentHead}>Leaving nobody behind</h2>
      </div>
      <FooterContainer />
    </div>
  </div>
);

const mapStateToProps = ({ declarationsReducer, userReducer }) => {
  const {
    declaration,
    authenticated,
    isFetchingDeclaration,
  } = declarationsReducer;
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

export default connect(mapStateToProps, null)(HomeContainer);
