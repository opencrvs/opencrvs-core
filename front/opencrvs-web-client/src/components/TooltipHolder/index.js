

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
            <h1 className={styles.percentage}>
              Coverage {
                Math.round(( rolloverMapData.certs / rolloverMapData.kpi ) * 100)
              }%
            </h1>
            <h1 className={styles.certification}>
              { mapEvent } registration rate: { rolloverMapData.certs } / { rolloverMapData.kpi }
            </h1>
          </div>
        </div>
      </div>
    );
  }
}

export default TooltipHolder;
