import React from 'react';

const Logout = ({ onLogoutClick }) => (
  <button onClick={() => onLogoutClick()} className="pureButtonPrimary">
    Logout
  </button>
);
  
export default Logout;
