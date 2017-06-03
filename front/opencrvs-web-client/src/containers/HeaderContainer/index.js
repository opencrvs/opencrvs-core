import React from 'react';
import styles from './styles.css';

const HeaderContainer = () => (
  <div className="header">
    <div className={styles.homeMenu + ' pure-menu pure-menu-horizontal pure-menu-fixed'}>
        <a className="pure-menu-heading" href="">OpenCRVS</a>

        <ul className="pure-menu-list">
            <li className={styles.pureMenuSelected + ' pure-menu-item'}><a href="#" className="pure-menu-link">Home</a></li>
            <li className="pure-menu-item"><a href="#" className="pure-menu-link">Tour</a></li>
            <li className="pure-menu-item"><a href="#" className="pure-menu-link">Sign Up</a></li>
        </ul>
    </div>
</div>
);
  
export default HeaderContainer;
