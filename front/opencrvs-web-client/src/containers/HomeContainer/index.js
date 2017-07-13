/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:17:48 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-13 13:09:36
 */
import React from 'react';
import HeaderContainer from 'containers/HeaderContainer';
import FooterContainer from 'containers/FooterContainer';
import LoginContainer from 'containers/LoginContainer';
import UserAvatar from 'components/UserAvatar';
import { Button } from 'react-toolbox/lib/button';
import { connect } from 'react-redux';
import styles from './styles.css';
import theme from './getStartedButton.css';
import { updateUserDetails } from 'actions/user-actions';
import { deselctWorkView } from 'actions/declaration-actions';


class HomeContainer extends React.Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    let token = localStorage.getItem('token') || null;
    if (token) {
      this.props.fetchData(token);
      this.props.onHome();
    }
  }
  
  handleClick = (event) => {
    window.location.href = '/work';
  }

  render = () => {
    const { errorMessage,
      dispatch,
      isAuthenticated,
      given,
      family,
      avatar,
      workView,
    } = this.props;
  
    return (
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
              ? <LoginContainer />
              : <div className="pure-g">
                  <div className="pure-u-1-3"></div>
                  <div className="pure-u-1-3">
                  <Button theme={theme} onClick={this.handleClick} raised >
                    <UserAvatar 
                      isAuthenticated={isAuthenticated}
                      given={given}
                      family={family}
                      avatar={avatar}
                      workView={workView}
                    />
                     Get Started 

                  </Button> 
                  </div>
                  <div className="pure-u-1-3"></div>
                </div>
                }
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
                Phasellus eget enim eu lectus faucibus vestibulum. Suspendisse sodales pellentesque elementum
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
              src="static/img/common/file-icons.png"
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
  }
}

const mapStateToProps = ({ declarationsReducer, userReducer }) => {
  const {
    workView,
    authenticated,
    isFetchingDeclaration,
  } = declarationsReducer;
  const { isAuthenticated, isFetchingUser, errorMessage, given, family, avatar } = userReducer;

  return {
    workView,
    authenticated,
    isAuthenticated,
    isFetchingUser,
    errorMessage,
    isFetchingDeclaration,
    given,
    family,
    avatar,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchData: token => {dispatch(updateUserDetails(token));},
    onHome: () => {
      dispatch(deselctWorkView());
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(HomeContainer);
