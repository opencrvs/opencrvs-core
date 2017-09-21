/*
 * @Author: Euan Millar
 * @Date: 2017-07-05 01:18:30
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-08-10 17:07:14
 */
import React from 'react';
import styles from './styles.css';

class LocationListItem extends React.Component {
  constructor(props) {
    super(props);
  }

  render = () => {
    const { onClick,
      title,
      sub,
      rolloverMapData,
      rag,
      registrationsActual,
      registrationsKpi } = this.props;

    const ragStyle = {
      borderLeft: '6px solid ' + rag,
    };
    let defaultStyle = null;
    if (rolloverMapData) {
      if (rolloverMapData.title == title) {
        defaultStyle = styles.rolledOver;
      } else {
        defaultStyle = styles.locationItem;
      }
    } else {
      defaultStyle = styles.locationItem;
    }
    return (
        <div
          onClick={onClick}
          style={ragStyle}
          className={ defaultStyle + ' pure-g' }
        >

          <div className={'pure-u-1-2'}>
            <p className={styles.title}>{ title }</p>
            <p className={styles.sub}>{ sub }</p>
          </div>
          <div className={styles.pullRight + ' pure-u-1-2'}>
            <p className={styles.title}>
              Coverage { Math.round((registrationsActual / registrationsKpi) * 100) }%
            </p>
            <p className={styles.sub}>
              Registration rate {registrationsActual} / {registrationsKpi}
            </p>
          </div>
        </div>
    );
  }
}

export default LocationListItem;
