/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:18:30 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-19 12:20:03
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


class WorkListItem extends React.Component {
  constructor(props) {
    super(props);
  }

  render = () => {
    const { onClick,
      code,
      given,
      family,
      gender,
      birthDate,
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
              <h1 className={styles.workItemTitle}>{  given ? given.toString().replace(/,/g, '')  + ' ' + family : '' }</h1>
              <h5 className={styles.workItemDesc}>
                {gender + ' - ' + birthDate}
              </h5>
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
