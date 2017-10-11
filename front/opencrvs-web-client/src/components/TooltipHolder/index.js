

import React from 'react';
import styles from './styles.css';

class TooltipHolder extends React.Component {
  constructor(props) {
    super(props);
  }

  render = () => {
    const { rolloverMapData,
            countryLevel } = this.props;
    let areaMessage = '';
    if (countryLevel) {
      areaMessage = 'Region: ';
    } else {
      areaMessage = 'District: ';
    }
    return (
      <div className={styles.tooltipHolder}>
        <div className={styles.tooltipText}>
          <p>{areaMessage}<span className={styles.bold}>{ rolloverMapData.title }</span></p>
          <p>Coverage: <span className={styles.bold}>{
            Math.round(( rolloverMapData.certs / rolloverMapData.kpi ) * 100)
          }%</span></p>
        </div>
      </div>
    );
  }
}

export default TooltipHolder;
