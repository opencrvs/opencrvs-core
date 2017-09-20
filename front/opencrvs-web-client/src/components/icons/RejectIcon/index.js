import React from 'react';
import PropTypes from 'prop-types';

const RejectIcon = ({width, height}) => (
  <svg width={width} height={height} viewBox="0 0 284 277">
    <g>
      <g>
        <g>
          <path d="M143.5,67.8H94.8l36.1-36.1c6.3-6.3,6.3-15.7,0-22s-15.7-6.3-22,0L46.1,72.5c-6.3,6.3-6.3,15.7,0,22l62.8,62.8
            c6.3,6.3,15.7,6.3,22,0s6.3-15.7,0-22L94.8,99.2h48.7c39.3,0,70.7,31.4,70.7,70.7s-31.4,70.7-70.7,70.7
            c-9.4,0-15.7,6.3-15.7,15.7s6.3,15.7,15.7,15.7c56.5,0,102.1-45.5,102.1-102.1S200,67.8,143.5,67.8z" />
        </g>
      </g>
    </g>
  </svg>
);

RejectIcon.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
};

RejectIcon.defaultProps = {
  width: 30,
  height: 30,
};

export default RejectIcon;
