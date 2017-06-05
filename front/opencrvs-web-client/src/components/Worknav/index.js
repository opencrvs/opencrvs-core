import React from 'react';
import styles from './styles.css';

const Worknav = () => (
  <div className={styles.workNav + ' pure-u'}>
    <div className={styles.navInner}>

      <img
        width="64"
        height="64"
        alt="Ed Duffus&#x27;s avatar"
        className={styles.avatar}
        src="static/img/avatars/ed-duffus.jpg"
      />
      <h5 className={styles.userName}>Ed Duffus</h5>
      <h4 className={styles.menuHeading}>Ghana</h4>
      <button className={styles.primaryButton + ' pure-button'}>NEW</button>

      <div className={styles.menu}>
        <ul className="pure-menu-list">
          <li className={styles.menuHeading}>STATUS</li>
          <li className="pure-menu-item">
            <a href="#" className={styles.menuLink}>
              Unvalidated <span className={styles.itemCount}>(10)</span>
            </a>
          </li>
          <li className="pure-menu-item">
            <a href="#" className={styles.menuLink}>Validated</a>
          </li>
          <li className="pure-menu-item">
            <a href="#" className={styles.menuLink}>Rejected</a>
          </li>
          <li className="pure-menu-item">
            <a href="#" className={styles.menuLink}>Drafts</a>
          </li>
          <li className="pure-menu-item">
            <a href="#" className={styles.menuLink}>Trash</a>
          </li>
          <li className={styles.menuHeading}>LABELS</li>
          <li className="pure-menu-item">
            <a href="#" className={styles.menuLink}>
              <span className={styles.labelDeclaration}></span>Declarations
            </a>
          </li>
          <li className="pure-menu-item">
            <a href="#" className={styles.menuLink}>
              <span className={styles.labelValidation}></span>Validated
            </a>
          </li>
          <li className="pure-menu-item">
            <a href="#" className={styles.menuLink}>
              <span className={styles.labelRegistration}></span>Registered
            </a>
          </li>
        </ul>
      </div>
    </div>
  </div>
);
export default Worknav;
