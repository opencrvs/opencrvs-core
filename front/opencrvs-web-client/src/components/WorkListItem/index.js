/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:18:30 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-10-14 17:46:39
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
import RejectIcon from 'components/icons/RejectIcon';
import StopWatchIcon from 'components/icons/StopWatchIcon';
import { get, head, filter } from 'lodash';
const Moment = require('moment');


class WorkListItem extends React.Component {
  constructor(props) {
    super(props);
  }

  render = () => {
    const { onClick,
      code,
      tracking,
      created,
      id,
      selectedDeclaration,
      role,
      status,
      selectedCertification,
      patients,
      childDetails } = this.props;
    const category = code.slice(0, code.indexOf('-'));

    const given = get(head(filter(patients, function(patient) { return patient.patient.id == childDetails; })), 'patient.given');
    const family = get(head(filter(patients, function(patient) { return patient.patient.id == childDetails; })), 'patient.family');
    const address = get(head(filter(patients, function(patient) { return patient.patient.id == childDetails; })), 'patient.address');
    const birthDate = get(head(filter(patients, function(patient) { return patient.patient.id == childDetails; })), 'patient.birthDate');
    
    const location = get(head(address), 'county');
    //const location = address.county;
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
            id == selectedDeclaration.id || id == selectedCertification.id
              ? styles.openedWorkItem + ' ' + styles.workItem + ' pure-g'
              : styles.workItem + ' pure-g'
          }
        >
          <div className={`pure-u-1-6 ${styles.iconHolder}`}>{iconType}</div>
          
          <div className="pure-u-7-12">
           
            <h1 className={styles.workItemTitle}>{  given ? given.toString().replace(/,/g, '')  + ' ' + family : '' }</h1>
            <h5 className={styles.workItemDesc}>d.o.b:&nbsp;
              {Moment(birthDate).format('MMM Do YYYY')}
              <br />Created:&nbsp;

              {Moment(created).format('MMM Do YYYY')}
              <br />{location}
              <br /><span className={styles.tracking}>{ tracking }</span>
              
            </h5>
          </div>

          <div className={`pure-u-1-4 ${styles.iconHolder}`}>
            {
              Moment().diff(created, 'days') > 1 ? <StopWatchIcon /> : null
            }
            {
              role === 'field officer' && id === 1 ? <RejectIcon width={20} /> : null
            }
            {
              role === 'field officer' && status != 'notified-saved' && <div className={styles.newAlarm}><strong>NEW</strong></div>
            }
            {
              role === 'registrar' && status != 'declared-saved' && <div className={styles.newAlarm}><strong>NEW</strong></div>
            }
          </div>
        </div>
    );
  }
}


const mapStateToProps = ({ declarationsReducer, userReducer }) => {
  const { selectedDeclaration, selectedCertification } = declarationsReducer;
  const { role } = userReducer;
  return {
    selectedDeclaration,
    role,
    selectedCertification,
  };
};

export default connect(mapStateToProps, null)(WorkListItem);
