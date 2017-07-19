/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:18:48 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-18 22:08:18
 */
import React from 'react';
import styles from './styles.css';
import WorkingItemCanvas from 'components/WorkingItemCanvas';
import {connect} from 'react-redux';
import { Button } from 'react-toolbox/lib/button';
import { filter, get, head } from 'lodash';
import DocumentContainer from 'containers/DocumentContainer';
import AdoptionIcon from 'components/icons/AdoptionIcon';
import AnnulmentIcon from 'components/icons/AnnulmentIcon';
import BirthIcon from 'components/icons/BirthIcon';
import DeathIcon from 'components/icons/DeathIcon';
import FoetalIcon from 'components/icons/FoetalIcon';
import JudicialIcon from 'components/icons/JudicialIcon';
import LegitimationIcon from 'components/icons/LegitimationIcon';
import MarriageIcon from 'components/icons/MarriageIcon';
import RecognitionIcon from 'components/icons/RecognitionIcon';

class WorkingItem extends React.Component {
  constructor(props) {
    super(props);
  }
  
  openImageModal = (event) => {
    this.props.onModalOpenClick('image');
  }

  openSubmitModal = (event) => {
    this.props.onModalOpenClick('submit');
  }

  render = () => {
    const { selectedDeclaration, patients, role, category, newDeclaration, images } = this.props;
    const childPatient = head(filter(patients,
      function(patient) { return patient.patient.id == selectedDeclaration.childDetails; }));
    const childAddress = head(get(childPatient, 'patient.address'));
    let pageTitle = null;
    let birthDate = null;
    let address = null;
    if (selectedDeclaration) {
      pageTitle = get(childPatient, 'patient.given').toString().replace(/,/g, '') + ' ' + get(childPatient, 'patient.family');
      birthDate = get(childPatient, 'patient.birthDate');
      address = get(childAddress, 'county');
    } else {
      pageTitle = 'New ' + category + ' Declaration';
      birthDate = '';
      address = '';
    }
    let iconType = null;
    switch (category) {
      case 'Birth':
        iconType = <BirthIcon />;
        break;
      case 'Marriage':
        iconType = <MarriageIcon />;
        break;
      case 'Adoption':
        iconType = <AdoptionIcon />;
        break;
      case 'Annulment':
        iconType = <AnnulmentIcon />;
        break;
      case 'Legitimation':
        iconType = <LegitimationIcon />;
        break;
      case 'Recognition':
        iconType = <RecognitionIcon />;
        break;
      case 'Separation':
        iconType = <JudicialIcon />;
        break;
      case 'Death':
        iconType = <DeathIcon />;
        break;
      case 'Foetal Death':
        iconType = <FoetalIcon />;
        break;
      default:
        iconType = <BirthIcon />;
        break;
    }

    const pixelHeight = (images.length * 750) + 'px';
    return (
      <div className={styles.workingItemContainer + ' pure-u-1'}>
        {
        selectedDeclaration || newDeclaration == true 
          ? 
          <div className={styles.wiContentHeader + ' pure-g'}>
            <div className="pure-u-1 pure-u-md-1-2">
              <div className={styles.iconHolder}>{iconType}</div>
              <div className={styles.titleText}>
                <h1 className={
                      newDeclaration == true
                        ? styles.newWorkItem + ' ' + styles.wiContentTitle
                        : styles.wiContentTitle
                    }
                >{ pageTitle }</h1>
                <p className={styles.wiContentSubtitle}>
                  <span>{' ' + birthDate }</span>{' ' + address }
                </p>
              </div>
            </div>
            <div className={styles.wiContentControls + ' pure-u-1 pure-u-md-1-2'}>
              <div className="pure-g">
                <div className="pure-u-2 pure-u-md-1-4">
                  <Button icon="save" label="Save" flat />
                </div>
                <div className="pure-u-2 pure-u-md-1-4">
                  <Button icon="image" label="Upload" flat onClick={this.openImageModal} />
                </div>
                <div className="pure-u-2 pure-u-md-1-4">
                  <Button icon="delete" label="Trash" flat />
                </div>
                <div className="pure-u-2 pure-u-md-1-4">
                  <Button icon="send" label="Submit" flat onClick={this.openSubmitModal} />
                </div>
              </div>
            </div>
          </div> 
          : 
            ''
        }
        <div className={ !selectedDeclaration && newDeclaration == false 
                ? styles.noSelectedDeclaration + ' pure-g'
                : styles.formOpen + ' pure-g'}>
          {
            !selectedDeclaration && newDeclaration == false
            ?
              <div className={'pure-u-1 pure-u-md-1-1 ' + styles.noSelectedMessage}>
                <h1 className={styles.wiContentTitle}>
                  {
                    role == 'validator' 
                      ? 
                        <div><p>Select a declaration to validate,</p><p>or create a new declaration</p></div>
                      : 
                        <div><p>Select a notification to declare,</p><p>'or create a new declaration</p></div>
                  }
                
                </h1>
              </div>
            :
            <div className={
              images.length > 0 && (selectedDeclaration || newDeclaration == true)
              ? 'pure-u-1 pure-u-md-1-2 ' + styles.wiContentBody
              : 'pure-u-1 pure-u-md-1-1 ' + styles.wiContentBody
              }>
              <WorkingItemCanvas 
                selectedDeclaration={selectedDeclaration} 
                newDeclaration={newDeclaration} 
                patients={patients} 
                category={category} 
              />
            </div>
          }
          {
            images.length > 0 && (selectedDeclaration || newDeclaration == true)
            ? 
              <div className={'pure-u-1 pure-u-md-1-2 ' + styles.wiContentBody} style={{ height: pixelHeight }}>
                <div className="pure-g">
                  <div className="pure-u-1">
                    <DocumentContainer 
                      selectedDeclaration={selectedDeclaration} 
                      newDeclaration={newDeclaration}
                      images={images}
                    />
                  </div>
                </div>
              </div>
            : ''
          }
        </div>
      </div>
    );
  }
}

const mapStateToProps = ({ declarationsReducer, imageReducer }) => {
  const {
    selectedDeclaration,
    newDeclaration,
  } = declarationsReducer;
  const {
    images,
  } = imageReducer;
  return {
    selectedDeclaration,
    newDeclaration,
    images,
  };
};

export default connect(
  mapStateToProps,
  null
)(WorkingItem);
