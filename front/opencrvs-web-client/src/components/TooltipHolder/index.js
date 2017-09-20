

import React from 'react';
import styles from './styles.css';

class TooltipHolder extends React.Component {
  constructor(props) {
    super(props);
  }

  render = () => {
    const { mapEvent,
            rolloverMapData } = this.props;
    return (
      <div className={styles.tooltipHolder}>
        <div className={styles.tooltip}>
          <div className={styles.tooltipText}>
            <p className={styles.title}>{ rolloverMapData.title }</p>
            <p className={styles.percentage}>
              Coverage {
                Math.round(( rolloverMapData.certs / rolloverMapData.kpi ) * 100)
              }%
            </p>
            <p className={styles.certification}>
              { mapEvent } registration rate: { rolloverMapData.certs } / { rolloverMapData.kpi }
            </p>
          </div>
        </div>
      </div>
    );
  }
}

export default TooltipHolder;
