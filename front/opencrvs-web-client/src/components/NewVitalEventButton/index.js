/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:19:02 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-14 09:53:48
 */
import React from 'react';
import styles from './styles.css';
import { Button } from 'react-toolbox/lib/button';
import AdoptionIcon from 'components/icons/AdoptionIcon';
import AnnulmentIcon from 'components/icons/AnnulmentIcon';
import BirthIcon from 'components/icons/BirthIcon';
import DeathIcon from 'components/icons/DeathIcon';
import FoetalIcon from 'components/icons/FoetalIcon';
import JudicialIcon from 'components/icons/JudicialIcon';
import LegitimationIcon from 'components/icons/LegitimationIcon';
import MarriageIcon from 'components/icons/MarriageIcon';
import RecognitionIcon from 'components/icons/RecognitionIcon';

class NewVitalEventButton extends React.Component {
  constructor(props) {
    super(props);
  }

  render = () => {
    const { action, onClick } = this.props;
    let iconButton = null;
    switch (action) {
      case 'Birth':
        iconButton = <BirthIcon />;
        break;
      case 'Marriage':
        iconButton = <MarriageIcon />;
        break;
      case 'Adoption':
        iconButton = <AdoptionIcon />;
        break;
      case 'Annulment':
        iconButton = <AnnulmentIcon />;
        break;
      case 'Legitimation':
        iconButton = <LegitimationIcon />;
        break;
      case 'Recognition':
        iconButton = <RecognitionIcon />;
        break;
      case 'Separation':
        iconButton = <JudicialIcon />;
        break;
      case 'Death':
        iconButton = <DeathIcon />;
        break;
      case 'Foetal Death':
        iconButton = <FoetalIcon />;
        break;
      default:
        iconButton = <BirthIcon />;
        break;
    }

    return (
      <div className={styles.newDeclCard + ' pure-u-1 pure-u-md-1-3'}>
        <Button raised onClick={onClick}>
          <div>
        <div className="pure-g">
          <div className="pure-u-1">
            {iconButton}              
          </div>
        </div>
        <div className="pure-g">
          <div className="pure-u-1">
              <h5>{action}</h5>
          </div>
        </div> 
        </div>
        </Button> 
      </div>
    );
  }
}


export default NewVitalEventButton;