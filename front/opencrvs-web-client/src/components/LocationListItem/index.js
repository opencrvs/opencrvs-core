/*
 * @Author: Euan Millar
 * @Date: 2017-07-05 01:18:30
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-10-18 13:38:38
 */
import React from 'react';
import styles from './styles.css';
import ReactStars from 'react-stars'

class LocationListItem extends React.Component {
  constructor(props) {
    super(props);
  }

  randomIntFromInterval = ( min, max ) => {
    return Math.floor(Math.random() * ( max - min + 1 ) + min);
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
            <p className={styles.title}><span className={styles.bold}>{ title }</span></p>
            <p className={styles.sub}>{ sub }</p>
          </div>
          <div className={'pure-u-1-2'}>
            <div className={styles.satisfaction}>Satisfaction:</div>
            <div className={styles.rating}>
            <ReactStars
              count="5"
              value={this.randomIntFromInterval(2, 5)}
              size={16}
              edit="false"
              color2={'#ffd700'} 
              color1={'gray'} />
            </div>
          </div>
          <div className={styles.listData + ' pure-u-1-1'}>
            <p className={styles.title}>
              Registration of all individuals: <strong>
                { Math.round((registrationsActual / registrationsKpi) * 100) }%</strong>
            </p>
            <p className={styles.title}>
              On time registrations: <span className={styles.bold}>{ this.randomIntFromInterval(60, 95) }%</span>
            </p>
          </div>
        </div>
    );
  }
}

export default LocationListItem;
