/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:18:13 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-21 01:41:52
 */
import React from 'react';
import styles from './styles.css';
import UserAvatar from 'components/UserAvatar';

class Worknav extends React.Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
  }

  logout = (event) => {
    this.props.onLogout();
  }

  render = () => {

    const { role, given, family, avatar } = this.props;

    return (
      <div className="header">
        <div
          className={
            styles.homeMenu + ' pure-menu pure-menu-horizontal pure-menu-fixed pure-g'
          }
        >
          <div className="pure-u-1-2">
            <div className={styles.avatarString + ' pure-g'}>
              <div className="pure-u-1-1">
                <UserAvatar 
                  given={given}
                  family={family}
                  avatar={avatar}
                />
                <div className={styles.avatarName}>{given + ' ' + family + ' - ' + role}</div>
                <div className={styles.avatarLocation}>Central Region - Ghana</div>
              </div>
            </div>
          </div>

          <div className="pure-u-1-2">
            <ul className={
              styles.workIcons + ' pure-menu-list'}>
              <li className="pure-menu-item">
                <a href="#" className="pure-menu-link">
                  <svg className={styles.inboxIcon} 
                    fill="#FFFFFF"
                    viewBox="0 0 100 125"
                  >
                    <polygon points="76,6 61,6 61,12 72,12 93.3,61 69,61 58,72 42,72 31,61 6.7,61 28,12 39,12 39,6 24,6 0,61.4 0,100 100,100 
        100,61.4 " />
                    <polygon points="57,41 57,0 43,0 43,41 30,41 50,61 70,41 " />
                  </svg>
                  <div className={styles.itemCount}>(3)</div>
                </a>
              </li>
              <li className="pure-menu-item">
                <a href="#" className="pure-menu-link">
                  <svg className={styles.draftIcon} fill="#FFFFFF" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
                      <path d="M0 0h24v24H0z" fill="none"/>
                  </svg>
                  <span>(2)</span>
                </a>
              </li>
              <li className="pure-menu-item">
                <a href="#" className="pure-menu-link">
                  <svg className={styles.trashIcon} fill="#FFFFFF" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                      <path d="M0 0h24v24H0z" fill="none"/>
                  </svg>
                </a>
              </li>
              <li className="pure-menu-item">
                <a className="pure-menu-link"  onClick={this.logout}>
                  <svg className={styles.exitIcon} fill="#FFFFFF" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M0 0h24v24H0z" fill="none"/>
                      <path d="M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5c-1.11 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
                  </svg>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }
}
export default Worknav;
