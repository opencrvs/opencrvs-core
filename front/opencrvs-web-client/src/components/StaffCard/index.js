

import React from 'react';
import styles from './styles.css';

class StaffCard extends React.Component {
  constructor(props) {
    super(props);
  }

  render = () => {
    const { cardType,
           managerData } = this.props;
    let cardStyle = null;
    let svgStyle = null;
    let textStyle = null;
    switch (cardType) {
      case 'L':
        svgStyle = styles.largeSvg;
        cardStyle = styles.largeCard;
        textStyle = styles.largeText;
        break;
      case 'M':
        svgStyle = styles.mediumSvg;
        cardStyle = styles.mediumCard;
        textStyle = styles.mediumText;
        break;
      case 'S':
        svgStyle = styles.smallSvg;
        cardStyle = styles.smallCard;
        textStyle = styles.smallText;
        break;
      case 'T':
        svgStyle = styles.invisibleSvg;
        cardStyle = styles.tinyCard;
        textStyle = styles.tinyText;
        break;
      case 'I':
        cardStyle = styles.invisibleCard;
        break;
    }
    return (
      <div className={cardStyle}>
        <div className={svgStyle}>
          {
            managerData && managerData.avatar && managerData.avatar == 'male'
            ? <svg viewBox="0 0 512 509">
              <path d="M483,426.7c0.1-14.6-7.5-25.6-20.7-34.5c-37.9-25.6-89.7-48.1-132.5-66.9c-4.6-2-6.5-4.4-6.3-8.9c0.4-8.1-0.1-16.2,0.2-24.3
                c0.1-3.8,1.4-8,2.1-11c-0.1,0-0.3,0-0.4,0c0.6-1,1.2-2.1,1.7-3.2c0,0,0-0.2,0-0.2c5.4-11.5,12.1-22.4,18.5-33.6
                c1.1-2,2.8-3.7,4.2-5.6c13.4-18.2,19.9-38.1,18.3-59.9c-0.2-3.1-0.9-6.6-2.8-9c-5.4-6.6-3.7-13.6-2.6-20.6c2.3-15,3.4-30-0.6-44.9
                c-4.9-18.3-15.3-32-36.9-37c-2-0.5-4-2.4-5-4.2c-12-21.5-36.9-32.9-64-32.5c-26.5-0.4-52,11-63.9,32.5c-1,1.7-3,3.7-5,4.2
                c-21.6,5-32,18.7-36.9,37c-4,14.9-2.9,29.9-0.6,44.9c1.1,7,2.8,14-2.6,20.6c-1.9,2.4-2.6,5.9-2.8,9c-1.6,21.8,4.9,41.7,18.3,59.9
                c1.4,1.9,3,3.6,4.2,5.5c6.3,11.2,13.1,22,18.5,33.5c0,0,0,0.3,0,0.3c0.5,1,1,2.2,1.7,3.2c-0.4,0-0.7,0-1.1,0c0.7,3,2,7.3,2.1,11
                c0.3,8.1-0.2,16.2,0.2,24.4c0.2,4.5-1.7,6.8-6.3,8.9c-42.9,18.8-94.7,41.3-132.5,66.9c-13.2,8.9-20.8,19.9-20.7,34.5
                c0.1,10.3-0.2,20.6,0.1,30.9c0.5,14.6,10.9,23.9,27.7,24c61.6,0.2,135,0.1,196.6,0c0.9,0,2.8-0.1,2.8-0.4c0,0.2,1.8,0.4,2.6,0.4
                c61.6,0.1,134.9,0.2,196.6,0c16.8-0.1,27.2-9.4,27.6-24C483.3,447.3,483,437,483,426.7z"/>
              </svg>
            : managerData && managerData.avatar && managerData.avatar == 'female'
            ? <svg viewBox="0 0 512 519">
              <g>
                <path d="M454.3,388.4c-34.8-28.1-72.6-51.5-112.3-71.9c-6.4-3.3-22.3-18.7-22.1-21.1c10.2-2.6,20.9-4.7,31.3-8.1
                  c10.4-3.3,20.7-7.3,30.6-11.8c10-4.6,10.8-11.9,3.5-20.2c-14.6-16.6-21.2-36.8-23.9-58c-2.8-21.5-3.4-43.3-4.6-64.9
                  c-1.2-22-3.1-43.8-11.8-64.5c-7.5-18-19.6-29.9-40.1-31.1c-1.9-0.1-4.4-0.1-5.6-1.3C288.9,25.4,275.8,22,262,20c-4,0-8,0-12,0
                  c-16.9,3-32.7,8.8-46.8,18.8c-29.1,20.6-44.7,49.4-49.2,84.1c-2.2,16.8-1.8,33.9-3.2,50.8c-2.3,27.3-6.9,54-23.3,77.1
                  c-0.1,0.2-0.3,0.4-0.4,0.6c-12.3,16-11.6,20.1,7.7,27.6c15.3,5.9,31.3,9.8,47,14.6c2.6,0.8,5.2,1.2,7.4,1.8
                  c0.2,2.5-11.3,16.7-16.9,19.8c-19.2,10.6-39.2,20.3-57.4,32.5c-24,16.1-46.6,34.2-69.6,51.9C36.8,406,34,415.7,32,426.1
                  c0,22,0,42.9,0,65.9c148,0,300,0,448,0c0-23,0-43.8,0-65.9C478,408.7,466.8,398.5,454.3,388.4z"/>
              </g>
              </svg>
            : null
          }
        </div>
        <div className={textStyle + ' pure-u-1-2'}>
          {managerData && <p className={styles.name}>{managerData.given} {managerData.family}</p>}
          {managerData && <p className={styles.title}>{managerData.title}</p>}
          {managerData && <p className={styles.email}>{managerData.email}</p>}
          {managerData && <p className={styles.phone}>{managerData.phone}</p>}
        </div>
      </div>
    );
  }
}

   

export default StaffCard;
