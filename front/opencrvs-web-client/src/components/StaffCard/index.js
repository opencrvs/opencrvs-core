

import React from 'react';
import styles from './styles.css';

class StaffCard extends React.Component {
  constructor(props) {
    super(props);
  }

  randomGenderUrl = (gender) => {
    return `/static/img/avatars/staffcard/${gender}/${Math.floor(Math.random() * 5) + 1}.jpg`;
  }

  getAvatarUrl = (managerData) => {
    switch (managerData.given) {
      case 'Daniel':
        return '/static/img/avatars/staffcard/dm.jpg';
      case 'Janice':
        return '/static/img/avatars/staffcard/volta-rm.jpg';
      default:
        return this.randomGenderUrl(managerData.avatar);
    }
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
          <img className={styles.avatarImg} width="100%" height="100%" src={this.getAvatarUrl(managerData)} />
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
