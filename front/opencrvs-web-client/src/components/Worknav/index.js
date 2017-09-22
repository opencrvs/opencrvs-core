/*
 * @Author: Euan Millar
 * @Date: 2017-07-05 01:18:13
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-09-05 15:58:52
 */
import React from 'react';
import styles from './styles.css';
import UserAvatar from 'components/UserAvatar';
import ReactTooltip from 'react-tooltip';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

class Worknav extends React.Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
  }

  logout = (event) => {
    this.props.onLogout();
  }

  settings = (event) => {
    window.location.href = '/settings';
  }

  stats = (event) => {
    window.location.href = '/statistics';
  }

  reports = (event) => {
    window.location.href = '/reports';
  }

  toggleMobileMenu = (event) => {
    this.props.toggleMobileMenu();
  }

  render = () => {

    const { role, given, family, avatar, menuOpened, workView, location } = this.props;
    let headerClassString = '';
    if (workView == null) {
      headerClassString = ' ' + styles.homeHeader;
    }

    return (
      <div className="header">
        <div
          className={
            menuOpened == 0
            ? styles.homeMenu + ' ' + styles.menuClosed + ' pure-menu pure-menu-fixed pure-g' + headerClassString
            : styles.homeMenu + ' ' + styles.menuOpened + ' pure-menu pure-menu-fixed pure-g' + headerClassString
          }
        >
          <div className={styles.burgerMenuHolder} onClick={this.toggleMobileMenu}>
            <div className={styles.burgerMenu}></div>
          </div>
          <div className={
              workView == null
                ? styles.splashSubhead + ' pure-u-1'
                : styles.homeHide
              }>
            The <strong>free</strong> civil registration and vital statistics platform
          </div>
          <div className="pure-u-1 pure-u-md-1-2">


            <div className={
                workView == null
                  ? styles.homeHide + ' pure-g'
                  : styles.avatarString + ' pure-g'
                }>
              <div className="pure-u-1-1">
                <UserAvatar
                  given={given}
                  family={family}
                  avatar={avatar}
                />
                <div className={styles.avatarName}>{given + ' ' + family + ' - ' + role}</div>
                <div className={styles.avatarLocation}>{location || ''}</div>
              </div>
            </div>
          </div>

          <div className="pure-u-1  pure-u-md-1-2">
            {
              role == 'field officer' || role == 'certification clerk' || role == 'registrar'
              ? <ul className={
                  workView == null
                    ? styles.homeHide + ' pure-menu-list'
                    : styles.workIcons + ' pure-menu-list'
                  }>
                  <li className={styles.menuItem + ' pure-menu-item ' + styles.inboxItem}>
                    <ReactTooltip place="top" type="dark" effect="float"/>
                    <a href="#" className="pure-menu-link"
                        data-tip="Inbox">
                      <svg className={styles.inboxIcon}
                        fill="#FFFFFF"
                        viewBox="0 0 60 60"
                        height="30"
                        width="30"
                      >
                        <g>
                          <g>
                            <path d="M52.7,30l-6-17.3c-0.6-1.7-2.2-2.8-4-2.8L17,9.9c0,0,0,0-0.1,0c-1.8,0-3.3,1.1-3.9,2.8L7.1,30l0,0c0,0.1-0.1,0.2-0.1,0.3
                              l0,16.1c0,1.2,0.6,1.9,1.2,2.1c0.5,0.2,1.2,0.4,2.2,0.4l38.9,0l0.1,0c0.9,0,1.5-0.1,2.1-0.5c0.5-0.3,1.2-0.9,1.2-2.1l0-16.1
                              C52.7,30.2,52.7,30.1,52.7,30L52.7,30z M14.7,13.3c0.3-1,1.3-1.6,2.3-1.6l25.7,0c1.1,0,2,0.7,2.4,1.7l5.5,16.1l-14,0
                              c-0.2,0-0.4,0.1-0.6,0.3c-0.2,0.2-0.2,0.3-0.2,0.6c0,1.6-0.6,3.1-1.7,4.2c-1.1,1.1-2.6,1.7-4.2,1.7c-3.3,0-6-2.6-5.9-5.9
                              c0-0.5-0.3-0.8-0.9-0.8l-14-0.1L14.7,13.3z M51,46.3c0,0.4,0,0.8-1.6,0.9l-0.1,0l-38.9,0c-0.7,0-1.1-0.1-1.4-0.2
                              c-0.2-0.1-0.3-0.2-0.3-0.6l0-15.2l13.6,0c0.4,3.8,3.6,6.8,7.5,6.8l0.1,0c2,0,3.9-0.8,5.3-2.3c1.3-1.2,2-2.8,2.1-4.5l13.6,0
                              L51,46.3z"/>
                          </g>
                          <g>
                            <circle cx={50} cy={50} r={10} fill="rgb(255, 64, 129)" />
                            <text textAnchor="middle" x={50} y={57} style={{fontSize: 20, fontWeight: 'bold'}}>{this.props.workQueueItems}</text>
                          </g>
                        </g>
                      </svg>
                      <div className={styles.menuText}>Inbox (3)</div>
                    </a>
                  </li>
                  <li className={styles.menuItem + ' pure-menu-item'}>
                    <ReactTooltip place="top" type="dark" effect="float"/>
                    <a href="#" className="pure-menu-link" data-tip="Drafts">
                      <svg className={styles.draftIcon} fill="#FFFFFF" height="30" viewBox="0 0 96 91" width="30" xmlns="http://www.w3.org/2000/svg">
                          <g>
                            <path d="M18.8,78h58.4c3.7,0,6.7-3,6.7-6.7V35.7c0-3.7-3-6.7-6.7-6.7H50.8c-0.9,0-1.7-0.3-2.3-0.9l-9.7-8.4
                              C37.5,18.5,36,18,34.4,18H18.8c-3.7,0-6.7,3-6.7,6.7v46.6C12.1,75,15.1,78,18.8,78z M15.2,24.7c0-2,1.6-3.6,3.6-3.6h15.6
                              c0.9,0,1.7,0.3,2.3,0.9l9.7,8.4c1.2,1.1,2.8,1.6,4.4,1.6h26.4c2,0,3.6,1.6,3.6,3.6v35.6c0,2-1.6,3.6-3.6,3.6H18.8
                              c-2,0-3.6-1.6-3.6-3.6C15.2,71.3,15.2,24.7,15.2,24.7z"/>
                          </g>
                      </svg>
                      <div className={styles.menuText}>Drafts</div>
                    </a>
                  </li>
                  <li className={styles.menuItem + ' pure-menu-item'}>
                    <ReactTooltip place="top" type="dark" effect="float"/>
                    <a href="#" className="pure-menu-link"  data-tip="Trash">
                      <svg className={styles.trashIcon} fill="#FFFFFF" height="25" viewBox="0 0 100 106" width="25" xmlns="http://www.w3.org/2000/svg">
                          <path d="M42.7,85.5C42.7,85.5,42.7,85.5,42.7,85.5c1.1,0,2-0.9,2-2l-1-56.8c0-1.1-0.9-2-2-2c-1.1,0-2,0.9-2,2l1,56.8
                            C40.7,84.6,41.6,85.5,42.7,85.5z M57.3,85.5c1.1,0,2-0.9,2-2l1-56.8c0-1.1-0.9-2-2-2c0,0,0,0,0,0c-1.1,0-2,0.9-2,2l-1,56.8
                            C55.3,84.6,56.2,85.5,57.3,85.5C57.3,85.5,57.3,85.5,57.3,85.5z M77,24.7c-1.2,0-2,0.8-2.1,1.9l-2,62.2c0,2-1.6,3.6-3.6,3.6H30.7
                            c-2,0-3.6-1.6-3.6-3.6l-2-62.1c0-1.1-0.9-1.9-2-1.9c0,0,0,0-0.1,0c-1.1,0-2,1-1.9,2.1l2,62.1c0,4.2,3.4,7.6,7.6,7.6h38.6
                            c4.2,0,7.6-3.4,7.6-7.5l2-62.1C78.9,25.7,78.1,24.8,77,24.7z M82,14.7H18c-1.1,0-2,0.9-2,2s0.9,2,2,2h64c1.1,0,2-0.9,2-2
                            S83.1,14.7,82,14.7z M34.5,11.6c1.1,0,2-0.9,2-2c0-1.1,0.9-2,2-2h23.1c1.1,0,2,0.9,2,2c0,1.1,0.9,2,2,2s2-0.9,2-2c0-3.3-2.7-6-6-6
                            H38.5c-3.3,0-6,2.7-6,6C32.5,10.7,33.4,11.6,34.5,11.6z"/>
                      </svg>
                      <div className={styles.menuText}>Trash</div>
                    </a>
                  </li>
                  <li className={styles.menuItem + ' pure-menu-item'}>
                    <ReactTooltip place="top" type="dark" effect="float"/>
                    <a href="#" className="pure-menu-link" data-tip="Settings">
                      <svg
                        className={styles.settingIcon}
                        fill="#FFFFFF"
                        height="25"
                        viewBox="0 0 100 104"
                        width="25"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g transform="translate(0,-952.36218)">
                          <path d="M42,957.4c-1.1,0-1.7,0.9-1.9,1.5l-2.5,10.8c-0.6,0.2-1.3,0.5-1.9,0.8l-9.4-5.9c-0.8-0.5-1.8-0.3-2.5,0.3l-11.3,11.3
                            c-0.6,0.6-0.8,1.7-0.3,2.5l5.8,9.4c-0.3,0.6-0.5,1.2-0.8,1.9l-10.8,2.5c-0.9,0.2-1.6,1.1-1.6,2v16c0,0.9,0.7,1.7,1.6,1.9l10.8,2.5
                            c0.2,0.6,0.5,1.3,0.8,1.9l-5.9,9.4c-0.5,0.8-0.3,1.8,0.3,2.5l11.3,11.3c0.6,0.6,1.7,0.8,2.5,0.3l9.4-5.9c0.6,0.3,1.2,0.5,1.9,0.8
                            l2.5,10.8c0.2,0.9,1,1.6,1.9,1.6h16c0.9,0,1.7-0.7,1.9-1.6l2.5-10.8c0.6-0.2,1.3-0.5,1.9-0.8l9.4,5.9c0.8,0.5,1.8,0.3,2.5-0.3
                            l11.3-11.3c0.6-0.6,0.8-1.7,0.3-2.5l-5.9-9.4c0.3-0.6,0.6-1.3,0.8-1.9l10.8-2.5c0.9-0.2,1.6-1,1.6-1.9v-16c0-0.9-0.7-1.8-1.6-2
                            l-10.8-2.5c-0.2-0.6-0.5-1.3-0.8-1.9l5.8-9.4c0.5-0.8,0.4-1.9-0.3-2.5l-11.3-11.3c-0.6-0.6-1.7-0.8-2.5-0.3l-9.4,5.9
                            c-0.6-0.3-1.2-0.5-1.9-0.8l-2.5-10.8c-0.2-0.9-1.1-1.5-1.9-1.5L42,957.4L42,957.4z M43.6,961.4h12.9l2.3,10.2
                            c0.1,0.7,0.7,1.2,1.3,1.4c1.2,0.4,2.4,0.9,3.6,1.5c0.6,0.3,1.4,0.3,1.9-0.1l8.9-5.6l9.1,9.1l-5.6,8.9c-0.4,0.6-0.4,1.3-0.1,1.9
                            c0.6,1.1,1,2.3,1.4,3.5c0.2,0.7,0.8,1.2,1.5,1.3l10.2,2.3v12.8l-10.2,2.3c-0.7,0.1-1.2,0.7-1.5,1.3c-0.4,1.2-0.9,2.4-1.4,3.5
                            c-0.3,0.6-0.3,1.4,0.1,2l5.6,8.9l-9.1,9.1l-8.9-5.6c-0.6-0.4-1.3-0.4-1.9-0.1c-1.1,0.6-2.3,1-3.6,1.5c-0.6,0.2-1.1,0.8-1.3,1.4
                            l-2.4,10.2H43.6l-2.4-10.2c-0.1-0.7-0.7-1.2-1.3-1.4c-1.2-0.4-2.4-0.9-3.6-1.5c-0.6-0.3-1.4-0.3-1.9,0.1l-8.9,5.6l-9.1-9.1l5.6-8.9
                            c0.4-0.6,0.4-1.4,0.1-2c-0.6-1.1-1-2.3-1.4-3.5c-0.2-0.7-0.8-1.2-1.5-1.3L9,1008.8v-12.8l10.2-2.3c0.7-0.1,1.2-0.7,1.5-1.3
                            c0.4-1.2,0.9-2.4,1.4-3.5c0.3-0.6,0.3-1.4-0.1-1.9l-5.6-8.9l9.1-9.1l8.9,5.6c0.6,0.4,1.3,0.4,1.9,0.1c1.1-0.6,2.3-1,3.6-1.5
                            c0.6-0.2,1.1-0.8,1.3-1.4L43.6,961.4L43.6,961.4z M50,980.4c-12.1,0-22,9.9-22,22c0,12.1,9.9,22,22,22s22-9.9,22-22
                            C72,990.2,62.1,980.4,50,980.4L50,980.4z M50,984.4c10,0,18,8,18,18c0,10-8,18-18,18s-18-8-18-18C32,992.4,40,984.4,50,984.4z"/>
                        </g>
                        </svg>
                      <div className={styles.menuText}>Settings</div>
                    </a>
                  </li>
                  <li className={styles.menuItem + ' pure-menu-item'}>
                    <ReactTooltip place="top" type="dark" effect="float"/>
                    <a className="pure-menu-link"  onClick={this.logout} data-tip="Sign out">
                      <svg className={styles.exitIcon} fill="#FFFFFF" height="25" viewBox="0 0 100 103" width="40" xmlns="http://www.w3.org/2000/svg">
                        <path d="M97.2,50c0-0.2,0-0.3,0-0.5c0-0.1,0-0.2-0.1-0.2c0-0.1,0-0.1-0.1-0.2c0-0.1-0.1-0.2-0.2-0.3c0,0,0-0.1-0.1-0.1
                          c-0.1-0.1-0.2-0.3-0.3-0.4L79.7,31.4c-1-1-2.6-1-3.5,0c-1,1-1,2.6,0,3.5l12.6,12.6H44.6c-1.4,0-2.5,1.1-2.5,2.5s1.1,2.5,2.5,2.5
                          h44.1L76.1,65.1c-1,1-1,2.6,0,3.5c0.5,0.5,1.1,0.7,1.8,0.7s1.3-0.2,1.8-0.7l16.9-16.9c0,0,0,0,0,0c0.1-0.1,0.2-0.2,0.3-0.3
                          c0-0.1,0.1-0.1,0.1-0.2c0-0.1,0.1-0.1,0.1-0.2c0-0.1,0.1-0.2,0.1-0.3c0-0.1,0-0.1,0.1-0.2C97.2,50.3,97.3,50.2,97.2,50
                          C97.3,50,97.3,50,97.2,50C97.2,50,97.2,50,97.2,50z M66.4,61c-1.4,0-2.5,1.1-2.5,2.5v22.9c0,1.4-1.1,2.5-2.5,2.5H23.8
                          c-1.4,0-2.5-1.1-2.5-2.5V13.6c0-1.4,1.1-2.5,2.5-2.5h37.6c1.4,0,2.5,1.1,2.5,2.5v22.2c0,1.4,1.1,2.5,2.5,2.5s2.5-1.1,2.5-2.5V13.6
                          c0-4.1-3.4-7.5-7.5-7.5H23.8c-4.1,0-7.5,3.4-7.5,7.5v72.7c0,4.1,3.4,7.5,7.5,7.5h37.6c4.1,0,7.5-3.4,7.5-7.5V63.5
                          C68.9,62.1,67.8,61,66.4,61z"/>
                      </svg>
                      <div className={styles.menuText}>Sign out</div>
                    </a>
                  </li>
                </ul>
              :
                <ul className={
                  workView == null
                    ? styles.homeHide + ' pure-menu-list'
                    : styles.workIcons + ' pure-menu-list'
                  }>
                 <li className={styles.menuItem + ' pure-menu-item ' + styles.reportsItem}>
                    <ReactTooltip place="top" type="dark" effect="float"/>
                    <a href="#" className="pure-menu-link" onClick={this.reports} data-tip="Reporting">
                      <svg
                        className={styles.reportsIcon}
                        fill="#FFFFFF"
                        height="35"
                        viewBox="0 0 50 57"
                        width="35">
                        <path d="M35.9,48.8H15.3c-2.3,0-4.2-1.8-4.2-4v-28c0-2.2,1.9-4,4.2-4h20.6c2.3,0,4.2,1.8,4.2,4v28C40.1,47,38.3,48.8,35.9,48.8z
                          M15.3,14.4c-1.4,0-2.6,1.1-2.6,2.4v28c0,1.3,1.1,2.4,2.6,2.4h20.6c1.4,0,2.6-1.1,2.6-2.4v-28c0-1.3-1.1-2.4-2.6-2.4H15.3z"/>
                        <path d="M34.6,21.8c0,0.5-0.4,0.8-0.8,0.8H15.4c-0.5,0-0.8-0.4-0.8-0.8l0,0c0-0.5,0.4-0.8,0.8-0.8h18.3
                          C34.2,20.9,34.6,21.3,34.6,21.8L34.6,21.8z"/>
                        <path d="M26.4,25.3c0,0.5-0.3,0.8-0.8,0.8H15.3c-0.4,0-0.8-0.4-0.8-0.8l0,0c0-0.5,0.3-0.8,0.8-0.8h10.3C26,24.5,26.4,24.8,26.4,25.3
                          L26.4,25.3z"/>
                        <path d="M27.6,29.1c0,0.5-0.4,0.8-0.8,0.8H15.4c-0.5,0-0.8-0.4-0.8-0.8l0,0c0-0.5,0.4-0.8,0.8-0.8h11.4
                          C27.2,28.3,27.6,28.7,27.6,29.1L27.6,29.1z"/>
                        <path d="M29.3,32.8c0,0.5-0.4,0.8-0.8,0.8h-13c-0.5,0-0.8-0.4-0.8-0.8l0,0c0-0.5,0.4-0.8,0.8-0.8h13C28.9,31.9,29.3,32.3,29.3,32.8
                          L29.3,32.8z"/>
                        <path d="M33.5,36.4c0,0.5-0.4,0.8-0.8,0.8H15.4c-0.5,0-0.8-0.4-0.8-0.8l0,0c0-0.5,0.4-0.8,0.8-0.8h17.3
                          C33.1,35.5,33.5,35.9,33.5,36.4L33.5,36.4z"/>
                        <path d="M24.4,39.7c0,0.5-0.4,0.8-0.9,0.8h-8.1c-0.5,0-0.9-0.4-0.9-0.8l0,0c0-0.5,0.4-0.8,0.9-0.8h8.1C24,38.9,24.4,39.3,24.4,39.7
                          L24.4,39.7z"/>
                        <path d="M15.8,13.9c0.2-0.1,0.3-0.1,0.5-0.1c0.3,0,0.6,0,1,0v-1.9c0-1,0.8-1.7,1.7-1.7c1,0,1.7,0.8,1.7,1.7v1.8c0.3,0,0.5,0,0.8-0.1
                          c0.1,0,0.2,0,0.3,0c0.2,0,0.4,0,0.6,0.1v-1.9c0-1.9-1.5-3.4-3.4-3.4c-1.9,0-3.4,1.5-3.4,3.4v2c0,0,0.1,0,0.1,0
                          C15.7,13.9,15.7,13.9,15.8,13.9z"/>
                        <path d="M34,14.1c0.2-0.2,0.5-0.3,0.8-0.3c0.4,0,0.7,0.1,0.9,0.4v-2.2c0-1.9-1.5-3.4-3.4-3.4s-3.4,1.5-3.4,3.4v2
                          c0.3-0.3,0.8-0.4,1.2-0.2c0,0,0,0,0,0c0.2,0.1,0.3,0.1,0.5,0.2v-2c0-1,0.8-1.7,1.7-1.7c1,0,1.7,0.8,1.7,1.7L34,14.1L34,14.1z"/>
                      </svg>
                      <div className={styles.menuText}>Reports</div>
                    </a>
                  </li>
                  <li className={styles.menuItem + ' pure-menu-item'}>
                    <ReactTooltip place="top" type="dark" effect="float"/>
                    <a href="#" className="pure-menu-link" onClick={this.stats} data-tip="Download statistics">
                      <svg
                        className={styles.statsIcon}
                        fill="#FFFFFF"
                        height="40"
                        viewBox="0 0 52 65"
                        width="40">
                        <g>
                          <g>
                            <polygon points="9.9,22.1 9.9,20.6 16.3,20.6 16.3,14.7 17.8,14.7 17.8,22.1 		"/>
                          </g>
                          <g>
                            <path d="M31.7,49.2H9V21l3.2-3.7l3-3.3h20.2v13.6l-0.9-0.1c-0.7-0.1-1.4-0.2-2.1-0.2c-5.6,0-10.3,4.6-10.3,10.3
                              c0,5.4,4.2,9.9,9.6,10.3L31.7,49.2z M10.5,47.7h16.3c-3.6-2.1-6-5.9-6-10.3c0-6.5,5.3-11.7,11.7-11.7c0.5,0,1,0,1.5,0.1V15.5h-18
                              l-2.6,2.8l-2.9,3.4V47.7z"/>
                          </g>
                          <g>
                            <path d="M31.7,49.2c-6.2-0.4-11-5.6-11-11.7c0-6.5,5.3-11.7,11.7-11.7c0.8,0,1.5,0.1,2.3,0.2l0,0c5.5,1.1,9.5,5.9,9.5,11.5
                              s-4,10.4-9.4,11.5c-0.5,0.1-1,0.1-1.5,0.2H31.7z M32.5,27.2c-5.6,0-10.3,4.6-10.3,10.3c0,5.4,4.2,9.9,9.6,10.3h1.5
                              c0.4,0,0.9-0.1,1.3-0.1c4.7-1,8.1-5.2,8.1-10.1c0-4.8-3.4-9.1-8.2-10.1C33.9,27.3,33.1,27.2,32.5,27.2z"/>
                          </g>
                          <g>
                            <rect x="31.7" y="30.1" width="1.5" height="12.4"/>
                          </g>
                          <g>
                            <polygon points="32.5,44.4 27.3,39.2 28.4,38.1 32.5,42.3 36.6,38.1 37.6,39.2 		"/>
                          </g>
                          <g>
                            <rect x="20.7" y="18.4" width="10.3" height="1.5"/>
                          </g>
                          <g>
                            <rect x="20.7" y="21.3" width="10.3" height="1.5"/>
                          </g>
                          <g>
                            <rect x="12.7" y="24.3" width="13.9" height="1.5"/>
                          </g>
                          <g>
                            <rect x="12.7" y="27.2" width="10.3" height="1.5"/>
                          </g>
                          <g>
                            <rect x="12.7" y="30.1" width="8.1" height="1.5"/>
                          </g>
                          <g>
                            <rect x="12.7" y="33.1" width="7.3" height="1.5"/>
                          </g>
                          <g>
                            <rect x="12.7" y="36" width="7.3" height="1.5"/>
                          </g>
                        </g>

                      </svg>
                      <div className={styles.menuText}>Statistics</div>
                    </a>
                  </li>
                  <li className={styles.menuItem + ' pure-menu-item'}>
                    <ReactTooltip place="top" type="dark" effect="float"/>
                    <a href="#" className="pure-menu-link" data-tip="Manage teams">
                      <svg
                        className={styles.teamIcon}
                        fill="#FFFFFF"
                        height="40"
                        viewBox="0 0 100 92"
                        width="40">
                          <g transform="translate(0,-952.36218)">
                            <path d="M50,973.2c-7.7,0-14.1,6.3-14.1,14c0,3.4,1.2,6.4,3.2,8.8c-1.9,0.9-3.7,2.2-5.3,3.7c-0.9-0.7-1.8-1.4-2.8-1.9
                              c1.3-1.7,2.1-3.8,2.1-6.2c0-5.7-4.6-10.2-10.3-10.2s-10.3,4.5-10.3,10.2c0,2.3,0.8,4.5,2.2,6.2c-4.5,2.3-7.9,6.7-7.9,13.1v6
                              c0,0.6,0.3,0.8,0.6,1.1c6.7,4.6,13.5,6.3,20.3,4.8v0.2c0,0.5,0.3,0.7,0.6,0.9c14.4,10.1,29.1,10,43.3,0c0.5-0.4,0.5-0.6,0.6-1.2
                              c6.8,1.5,13.6-0.1,20.3-4.8c0.5-0.4,0.7-0.6,0.7-1.2v-5.9c0-6.4-3.4-10.9-7.9-13.2c1.3-1.7,2.1-3.8,2.1-6.2
                              c0-5.7-4.6-10.2-10.3-10.2c-5.6,0-10.2,4.5-10.2,10.2c0,2.3,0.8,4.4,2.1,6.2c-1,0.5-2,1.2-2.9,1.9c-1.6-1.5-3.3-2.7-5.3-3.6
                              c2-2.4,3.2-5.5,3.2-8.9C64.1,979.4,57.8,973.2,50,973.2L50,973.2z M50,975.2c6.7,0,12.1,5.3,12.1,12c0,6.6-5.4,12-12.1,12
                              c-6.7,0-12.1-5.4-12.1-12C37.9,980.5,43.3,975.2,50,975.2z M22.8,983.4c4.6,0,8.3,3.6,8.3,8.2c0,4.5-3.7,8.2-8.3,8.2
                              c-2.2,0-4.3-0.9-5.8-2.3c0,0-0.1-0.1-0.1-0.1c-1.5-1.5-2.4-3.5-2.4-5.8C14.5,987,18.2,983.4,22.8,983.4L22.8,983.4z M77.2,983.4
                              c4.6,0,8.3,3.6,8.3,8.2c0,4.5-3.7,8.2-8.3,8.2c-4.6,0-8.2-3.6-8.2-8.2C68.9,987,72.6,983.4,77.2,983.4z M40.6,997.6
                              c2.5,2.2,5.8,3.6,9.4,3.6c3.6,0,6.9-1.4,9.4-3.6c6.2,2.7,10.8,8.2,10.8,16.9v8.1c-13.5,9.4-26.8,9.5-40.5,0v-8.1
                              C29.8,1005.8,34.4,1000.3,40.6,997.6L40.6,997.6z M29.5,999.3c1.1,0.5,2.1,1.1,2.9,1.8c-2.9,3.3-4.7,7.8-4.7,13.3v6.3
                              c-6.3,1.6-12.6,0.2-19-4.2v-5.6c0-5.9,3.1-9.7,7.3-11.6c1.8,1.5,4.1,2.4,6.7,2.4C25.4,1001.8,27.7,1000.8,29.5,999.3z M70.5,999.3
                              c1.8,1.5,4.1,2.5,6.7,2.5c2.5,0,4.9-0.9,6.7-2.5c4.2,1.9,7.3,5.7,7.3,11.6v5.6c-6.4,4.4-12.7,5.7-19,4.2v-6.3
                              c0-5.5-1.8-10-4.7-13.3C68.4,1000.4,69.4,999.8,70.5,999.3z"/>
                          </g>

                      </svg>
                      <div className={styles.menuText}>Teams</div>
                    </a>
                  </li>
                  <li className={styles.menuItem + ' pure-menu-item'}>
                    <ReactTooltip place="top" type="dark" effect="float"/>
                    <a href="#" className="pure-menu-link" onClick={this.settings} data-tip="Settings">
                      <svg
                        className={styles.settingIcon}
                        fill="#FFFFFF"
                        height="25"
                        viewBox="0 0 100 104"
                        width="25"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g transform="translate(0,-952.36218)">
                          <path d="M42,957.4c-1.1,0-1.7,0.9-1.9,1.5l-2.5,10.8c-0.6,0.2-1.3,0.5-1.9,0.8l-9.4-5.9c-0.8-0.5-1.8-0.3-2.5,0.3l-11.3,11.3
                            c-0.6,0.6-0.8,1.7-0.3,2.5l5.8,9.4c-0.3,0.6-0.5,1.2-0.8,1.9l-10.8,2.5c-0.9,0.2-1.6,1.1-1.6,2v16c0,0.9,0.7,1.7,1.6,1.9l10.8,2.5
                            c0.2,0.6,0.5,1.3,0.8,1.9l-5.9,9.4c-0.5,0.8-0.3,1.8,0.3,2.5l11.3,11.3c0.6,0.6,1.7,0.8,2.5,0.3l9.4-5.9c0.6,0.3,1.2,0.5,1.9,0.8
                            l2.5,10.8c0.2,0.9,1,1.6,1.9,1.6h16c0.9,0,1.7-0.7,1.9-1.6l2.5-10.8c0.6-0.2,1.3-0.5,1.9-0.8l9.4,5.9c0.8,0.5,1.8,0.3,2.5-0.3
                            l11.3-11.3c0.6-0.6,0.8-1.7,0.3-2.5l-5.9-9.4c0.3-0.6,0.6-1.3,0.8-1.9l10.8-2.5c0.9-0.2,1.6-1,1.6-1.9v-16c0-0.9-0.7-1.8-1.6-2
                            l-10.8-2.5c-0.2-0.6-0.5-1.3-0.8-1.9l5.8-9.4c0.5-0.8,0.4-1.9-0.3-2.5l-11.3-11.3c-0.6-0.6-1.7-0.8-2.5-0.3l-9.4,5.9
                            c-0.6-0.3-1.2-0.5-1.9-0.8l-2.5-10.8c-0.2-0.9-1.1-1.5-1.9-1.5L42,957.4L42,957.4z M43.6,961.4h12.9l2.3,10.2
                            c0.1,0.7,0.7,1.2,1.3,1.4c1.2,0.4,2.4,0.9,3.6,1.5c0.6,0.3,1.4,0.3,1.9-0.1l8.9-5.6l9.1,9.1l-5.6,8.9c-0.4,0.6-0.4,1.3-0.1,1.9
                            c0.6,1.1,1,2.3,1.4,3.5c0.2,0.7,0.8,1.2,1.5,1.3l10.2,2.3v12.8l-10.2,2.3c-0.7,0.1-1.2,0.7-1.5,1.3c-0.4,1.2-0.9,2.4-1.4,3.5
                            c-0.3,0.6-0.3,1.4,0.1,2l5.6,8.9l-9.1,9.1l-8.9-5.6c-0.6-0.4-1.3-0.4-1.9-0.1c-1.1,0.6-2.3,1-3.6,1.5c-0.6,0.2-1.1,0.8-1.3,1.4
                            l-2.4,10.2H43.6l-2.4-10.2c-0.1-0.7-0.7-1.2-1.3-1.4c-1.2-0.4-2.4-0.9-3.6-1.5c-0.6-0.3-1.4-0.3-1.9,0.1l-8.9,5.6l-9.1-9.1l5.6-8.9
                            c0.4-0.6,0.4-1.4,0.1-2c-0.6-1.1-1-2.3-1.4-3.5c-0.2-0.7-0.8-1.2-1.5-1.3L9,1008.8v-12.8l10.2-2.3c0.7-0.1,1.2-0.7,1.5-1.3
                            c0.4-1.2,0.9-2.4,1.4-3.5c0.3-0.6,0.3-1.4-0.1-1.9l-5.6-8.9l9.1-9.1l8.9,5.6c0.6,0.4,1.3,0.4,1.9,0.1c1.1-0.6,2.3-1,3.6-1.5
                            c0.6-0.2,1.1-0.8,1.3-1.4L43.6,961.4L43.6,961.4z M50,980.4c-12.1,0-22,9.9-22,22c0,12.1,9.9,22,22,22s22-9.9,22-22
                            C72,990.2,62.1,980.4,50,980.4L50,980.4z M50,984.4c10,0,18,8,18,18c0,10-8,18-18,18s-18-8-18-18C32,992.4,40,984.4,50,984.4z"/>
                        </g>
                        </svg>
                      <div className={styles.menuText}>Settings</div>
                    </a>
                  </li>
                  <li className={styles.menuItem + ' pure-menu-item ' + styles.logoutItem}>
                    <ReactTooltip place="top" type="dark" effect="float"/>
                    <a className="pure-menu-link"  onClick={this.logout} data-tip="Sign out">
                      <svg className={styles.exitIcon} fill="#FFFFFF" height="25" viewBox="0 0 100 103" width="40" xmlns="http://www.w3.org/2000/svg">
                        <path d="M97.2,50c0-0.2,0-0.3,0-0.5c0-0.1,0-0.2-0.1-0.2c0-0.1,0-0.1-0.1-0.2c0-0.1-0.1-0.2-0.2-0.3c0,0,0-0.1-0.1-0.1
                          c-0.1-0.1-0.2-0.3-0.3-0.4L79.7,31.4c-1-1-2.6-1-3.5,0c-1,1-1,2.6,0,3.5l12.6,12.6H44.6c-1.4,0-2.5,1.1-2.5,2.5s1.1,2.5,2.5,2.5
                          h44.1L76.1,65.1c-1,1-1,2.6,0,3.5c0.5,0.5,1.1,0.7,1.8,0.7s1.3-0.2,1.8-0.7l16.9-16.9c0,0,0,0,0,0c0.1-0.1,0.2-0.2,0.3-0.3
                          c0-0.1,0.1-0.1,0.1-0.2c0-0.1,0.1-0.1,0.1-0.2c0-0.1,0.1-0.2,0.1-0.3c0-0.1,0-0.1,0.1-0.2C97.2,50.3,97.3,50.2,97.2,50
                          C97.3,50,97.3,50,97.2,50C97.2,50,97.2,50,97.2,50z M66.4,61c-1.4,0-2.5,1.1-2.5,2.5v22.9c0,1.4-1.1,2.5-2.5,2.5H23.8
                          c-1.4,0-2.5-1.1-2.5-2.5V13.6c0-1.4,1.1-2.5,2.5-2.5h37.6c1.4,0,2.5,1.1,2.5,2.5v22.2c0,1.4,1.1,2.5,2.5,2.5s2.5-1.1,2.5-2.5V13.6
                          c0-4.1-3.4-7.5-7.5-7.5H23.8c-4.1,0-7.5,3.4-7.5,7.5v72.7c0,4.1,3.4,7.5,7.5,7.5h37.6c4.1,0,7.5-3.4,7.5-7.5V63.5
                          C68.9,62.1,67.8,61,66.4,61z"/>
                      </svg>
                      <div className={styles.menuText}>Sign out</div>
                    </a>
                  </li>
                </ul>
              }

          </div>
        </div>
      </div>
    );
  }
}

Worknav.propTypes = {
  workView: PropTypes.string,
  given: PropTypes.string.isRequired,
  family: PropTypes.string.isRequired,
  avatar: PropTypes.string.isRequired,
  menuOpened: PropTypes.number.isRequired,
  role: PropTypes.string.isRequired,
  workQueueItems: PropTypes.number,
};

Worknav.defaultProps = {
  workQueueItems: 0,
};

const mapStateToProps = ({ userReducer, globalReducer, declarationsReducer }) => {

  const { menuOpened, workView } = globalReducer;
  const { given, family, avatar, role } = userReducer;
  const { declarationsList = [] } = declarationsReducer;

  return {
    workView,
    given,
    family,
    avatar,
    menuOpened,
    role,
    workQueueItems: declarationsList.length,
  };
};

export default connect(mapStateToProps, null)(Worknav);
