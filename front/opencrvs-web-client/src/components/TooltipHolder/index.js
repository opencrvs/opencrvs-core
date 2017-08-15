

import React from 'react';
import styles from './styles.css';

class TooltipHolder extends React.Component {
  constructor(props) {
    super(props);
  }

  render = () => {
    
    const { originX,
            originY,
            mapEvent,
            rolloverMapData } = this.props;
    return (
      <div style={{top: originY - 250 + 'px', left: originX + 170  + 'px' }} className={ rolloverMapData
          ? styles.tooltipHolder
          : styles.tooltipHolderHide }>
        <div className={styles.tooltip}>
          <div className={styles.tooltipText}>
            <p className={styles.title}>{ rolloverMapData.title }</p>
            <p className={styles.percentage}>{ Math.round(( rolloverMapData.certs / rolloverMapData.kpi ) * 100) }%</p>
              <p className={styles.certification}>
                { mapEvent } certs: { rolloverMapData.certs } / { rolloverMapData.kpi }
              </p>
          </div>
        </div>
      </div>
    );
  }
}

   

export default TooltipHolder;
