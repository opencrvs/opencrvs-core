/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:18:30 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-27 11:54:35
 */
import React from 'react';
import styles from './styles.css';
import { connect } from 'react-redux';
import AdoptionIcon from 'components/icons/AdoptionIcon';
import AnnulmentIcon from 'components/icons/AnnulmentIcon';
import BirthIcon from 'components/icons/BirthIcon';
import DeathIcon from 'components/icons/DeathIcon';
import FoetalIcon from 'components/icons/FoetalIcon';
import JudicialIcon from 'components/icons/JudicialIcon';
import LegitimationIcon from 'components/icons/LegitimationIcon';
import MarriageIcon from 'components/icons/MarriageIcon';
import RecognitionIcon from 'components/icons/RecognitionIcon';
const Moment = require('moment');


class WorkListItem extends React.Component {
  constructor(props) {
    super(props);
  }

  render = () => {
    const { onClick,
      code,
      given,
      family,
      birthDate,
      tracking,
      created,
      id,
      selectedDeclaration } = this.props;
      const category = code.slice(0, code.indexOf('-'));
      let iconType = null;
      switch (category) {
        case 'birth':
          iconType = <BirthIcon />;
          break;
        case 'marriage':
          iconType = <MarriageIcon />;
          break;
        case 'adoption':
          iconType = <AdoptionIcon />;
          break;
        case 'annulment':
          iconType = <AnnulmentIcon />;
          break;
        case 'legitimation':
          iconType = <LegitimationIcon />;
          break;
        case 'recognition':
          iconType = <RecognitionIcon />;
          break;
        case 'separation':
          iconType = <JudicialIcon />;
          break;
        case 'death':
          iconType = <DeathIcon />;
          break;
        case 'foetal-death':
          iconType = <FoetalIcon />;
          break;
        default:
          iconType = <BirthIcon />;
          break;
      }
    return (
        <div
          onClick={onClick}
          className={
            id == selectedDeclaration.id
              ? styles.openedWorkItem + ' ' + styles.workItem + ' pure-g'
              : styles.workItem + ' pure-g'
          }
        >
          
          <div className={styles.iconHolder + ' pure-u-1-4'}>{iconType}</div>
          
            <div className="pure-u-3-4">
              <div className={styles.tracking}>{ tracking }</div>
              <h1 className={styles.workItemTitle}>{  given ? given.toString().replace(/,/g, '')  + ' ' + family : '' }</h1>
              <h5 className={styles.workItemDesc}>d.o.b:&nbsp;
                {Moment(birthDate).format('MMM Do YY')}
                <br />Created:&nbsp;

                {Moment(created).format('MMM Do YY')}
              </h5>
              <div className={
                  Moment().diff(created, 'days') > 1
                  ?
                    styles.stopWatch
                  :
                    styles.stopWatchHidden
              }>
              
                <svg
                  fill="#ff4081"
                  viewBox="0 0 100 101"
                  height="30"
                  width="30"
                >
                  <g>
                    <g>
                      <path d="M61.7,57.1h-13c-0.6,0-1-0.4-1-1V39.7c0-0.6,0.4-1,1-1s1,0.4,1,1v15.4h12c0.6,0,1,0.4,1,1S62.3,57.1,61.7,57.1z"/>
                    </g>
                    <g>
                      <path d="M54,16.8H43.4c-0.6,0-1-0.4-1-1s0.4-1,1-1H54c0.6,0,1,0.4,1,1S54.5,16.8,54,16.8z"/>
                    </g>
                    <g>
                      <path d="M80.3,32.6c-0.3,0-0.5-0.1-0.7-0.3l-6.8-6.8c-0.4-0.4-0.4-1,0-1.4s1-0.4,1.4,0l6.8,6.8c0.4,0.4,0.4,1,0,1.4
                        C80.8,32.5,80.6,32.6,80.3,32.6z"/>
                    </g>
                    <g>
                      <path d="M48.7,85.2c-16.5,0-30-13.5-30-30s13.5-30,30-30s30,13.5,30,30S65.2,85.2,48.7,85.2z M48.7,27.2c-15.4,0-28,12.6-28,28
                        s12.6,28,28,28s28-12.6,28-28S64.1,27.2,48.7,27.2z"/>
                    </g>
                  </g>
                </svg>
              </div>
            </div>
        </div>
    );
  }
}


const mapStateToProps = ({ declarationsReducer }) => {
  const { selectedDeclaration } = declarationsReducer;
  return {
    selectedDeclaration,
  };
};

export default connect(mapStateToProps, null)(WorkListItem);
