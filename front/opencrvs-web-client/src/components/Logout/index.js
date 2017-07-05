/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:18:58 
 * @Last Modified by:   Euan Millar 
 * @Last Modified time: 2017-07-05 01:18:58 
 */
import React from 'react';

const Logout = ({ onLogoutClick }) => (
  <button onClick={() => onLogoutClick()} className="pureButtonPrimary">
    Logout
  </button>
);
  
export default Logout;
