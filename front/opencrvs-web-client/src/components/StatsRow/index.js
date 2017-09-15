import Checkbox from 'react-toolbox/lib/checkbox';
import React from 'react';
import PropTypes from 'prop-types';
import styles from './styles.css';

function StatsRow({text, fromDate, toDate, checked, onChange}) {
  return (
    <div className={styles.statsRow + ' pure-g'}>
      <div className={styles.subjectTitle + ' pure-u-1-4'}>
        <p className={styles.itemText}>{text}</p>
      </div>
      <div className="pure-u-1-4">
        <p className={styles.itemText}>{fromDate}</p>
      </div>
      <div className="pure-u-1-4">
        <p className={styles.itemText}>{toDate}</p>
      </div>
      <div className="pure-u-1-4">
        <div className={styles.checkBoxes}>
          <Checkbox checked={checked} onChange={onChange} />
        </div>
      </div>
    </div>
  );
}

StatsRow.propTypes = {
  text: PropTypes.string.isRequired,
  fromDate: PropTypes.string.isRequired,
  toDate: PropTypes.string.isRequired,
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default StatsRow;
