/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:18:48 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-28 16:34:07
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
const Moment = require('moment');

class WorkingItem extends React.Component {
  constructor(props) {
    super(props);
  }
  
  openImageModal = (event) => {
    this.props.onModalOpenClick('image');
  }

  openSubmit = (event) => {
    if (this.props.newDeclaration) {
      if (this.props.tempImages.length == 0) {
        this.props.onModalOpenClick('req');
      } else {
        this.props.onNavSubmitClick();
      }
    } else if (this.props.selectedDeclaration) {
      if (this.props.selectedDeclaration.documents.length == 0) {
        if (this.props.tempImages.length == 0) {
          this.props.onModalOpenClick('req');
        } else {
          this.props.onNavSubmitClick();
        }
      } else {
        this.props.onNavSubmitClick();
      }
    } 
  }

  render = () => {
    const { selectedDeclaration, patients, role, category, newDeclaration, tempImages, managerView } = this.props;
    const childPatient = head(filter(patients,
      function(patient) { return patient.patient.id == selectedDeclaration.childDetails; }));
    let pageTitle = null;
    let birthDate = null;

    if (selectedDeclaration) {
      pageTitle = get(childPatient, 'patient.given').toString().replace(/,/g, '') + ' ' + get(childPatient, 'patient.family');
      birthDate = get(childPatient, 'patient.birthDate');
    } else {
      pageTitle = 'New ' + category + ' Declaration';
      birthDate = '';
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
    let pixelHeight = 0;
    let showPics = false;
    if (selectedDeclaration) {  
      if (tempImages.length > 0 && selectedDeclaration.documents.length > 0) {
        showPics = true;
        let multiplier = tempImages.length + selectedDeclaration.documents.length;
        pixelHeight = (multiplier * 750) + 'px';
      } else if (tempImages.length > 0) {
        showPics = true;
        pixelHeight = (tempImages.length * 750) + 'px';
      } else if (selectedDeclaration.documents.length > 0) {
        showPics = true;
        pixelHeight = (selectedDeclaration.documents.length * 750) + 'px';
      }
    } else if (tempImages.length > 0) {
      showPics = true;
      pixelHeight = (tempImages.length * 750) + 'px';
    }
    return (
      <div className={
        managerView
        ? styles.managerView
        :
        styles.workingItemContainer + ' pure-u-1'
        }>
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
                  <span>{' ' + birthDate }</span>
                </p>
                <div className={styles.smsMother}>
                
                  <svg
                    fill="#2d3e50"
                    viewBox="0 0 100 103"
                    height="30"
                    width="30"
                  >
                    <path d="M79.2,5.2H20.8C9.3,5.2,0,14.5,0,26v29.1C0,66.7,9.3,76,20.9,76c2.9,0,5.2,2.3,5.2,5.2v9.5c0,3.7,4.5,5.5,7.1,2.9l15.2-15.1
    c1.6-1.6,3.7-2.4,5.9-2.4h24.9c11.5,0,20.8-9.3,20.8-20.8V26C100,14.5,90.7,5.2,79.2,5.2z M29.2,46.8c-3.4,0-6.3-2.8-6.3-6.2
    s2.8-6.2,6.3-6.2c3.4,0,6.2,2.8,6.2,6.2S32.6,46.8,29.2,46.8z M50,46.8c-3.4,0-6.3-2.8-6.3-6.2s2.8-6.2,6.3-6.2
    c3.4,0,6.2,2.8,6.2,6.2S53.4,46.8,50,46.8z M70.8,46.8c-3.4,0-6.3-2.8-6.3-6.2s2.8-6.2,6.3-6.2c3.4,0,6.2,2.8,6.2,6.2
    S74.3,46.8,70.8,46.8z"/>
                  </svg>
                </div>
                  <div className={
                    Moment().diff(selectedDeclaration.created_at, 'days') > 1
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
            <div className={styles.wiContentControls + ' pure-u-1 pure-u-md-1-2'}>
              <div className="pure-g">
                <div className="pure-u-1-2 pure-u-md-1-4">
                  <Button icon="save" label="Save" flat />
                </div>
                <div className="pure-u-1-2 pure-u-md-1-4">
                  <Button icon="image" label="Upload" flat onClick={this.openImageModal} />
                </div>
                <div className="pure-u-1-2 pure-u-md-1-4">
                  <Button icon="delete" label="Trash" flat />
                </div>
                <div className="pure-u-1-2 pure-u-md-1-4">
                  <Button icon="send" label="Submit" flat onClick={this.openSubmit} />
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
                        <div><p>Select a notification to declare,</p><p>or create a new declaration</p></div>
                  }
                
                </h1>
              </div>
            :
            <div className={
              (showPics == true)
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
            (showPics == true)
            ? 
              <div className={'pure-u-1 pure-u-md-1-2 ' + styles.wiContentBody} style={{ height: pixelHeight }}>
                <div className="pure-g">
                  <div className="pure-u-1">
                    <DocumentContainer 
                      selectedDeclaration={selectedDeclaration} 
                      newDeclaration={newDeclaration}
                      tempImages={tempImages}
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
    tempImages,
  } = imageReducer;
  return {
    selectedDeclaration,
    newDeclaration,
    tempImages,
  };
};

export default connect(
  mapStateToProps,
  null
)(WorkingItem);
