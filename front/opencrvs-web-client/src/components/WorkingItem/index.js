/*
 * @Author: Euan Millar
 * @Date: 2017-07-05 01:18:48
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-10-14 18:28:29
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
import PrintPreview from 'components/PrintPreview';
import Input from 'react-toolbox/lib/input';
import theme from './printPreviewInput.css';
import InvestigationModal from 'components/InvestigationModal';
const Moment = require('moment');
const PrintTemplate = require('react-print');
import SmsButton from 'components/buttons/SmsButton';
import RejectIcon from 'components/icons/RejectIcon';
import StopWatchIcon from 'components/icons/StopWatchIcon';

class WorkingItem extends React.Component {
  state = {
    investigating: false,
    certNumber: '',
  };
  

  constructor(props) {
    super(props);
  }

  openImageModal = (event) => {
    this.props.onModalOpenClick('image');
  }

  saveProgress = (event) => {
    this.props.onNavSubmitClick(true);
  }

  openSMSModal = () => {
    this.props.onModalOpenClick('sms');
  }

  openSubmit = (event) => {
    if (this.props.newDeclaration) {
      if (this.props.tempImages.length == 0) {
        this.props.onModalOpenClick('req');
      } else {
        this.props.onNavSubmitClick(false);
      }
    } else if (this.props.selectedDeclaration) {
      if (this.props.selectedDeclaration.documents.length == 0) {
        if (this.props.tempImages.length == 0) {
          this.props.onModalOpenClick('req');
        } else {
          this.props.onNavSubmitClick(false);
        }
      } else {
        this.props.onNavSubmitClick(false);
      }
    }
  }

  startInvestigating = () => {
    this.setState({investigating: true});
  }

  stopInvestigating = () => {
    this.setState({investigating: false});
  }

  handleInvestigationSubmit = (investigation) => {
    // TODO: Handle investigation
    this.stopInvestigating();
  }

  handleChange(name, value) {
    this.setState({certNumber: value});
    this.props.onUpdateCertNumber(value);
  }

  render = () => {
    const { selectedDeclaration,
      selectedCertification,
      patients,
      role,
      category,
      newDeclaration,
      tempImages,
      tempImageIds,
      managerView } = this.props;
    const childPatient = head(filter(patients,
      function(patient) { return patient.patient.id == selectedDeclaration.childDetails; }));
    let declarationTitle = null;
    const TickIcon = () => (
      <svg viewBox="0 0 512 524">
      <path d="M433.8,2H78.2c-14,0-25.4,11.4-25.4,25.4v279.4C52.8,419,143.8,510,256,510s203.2-91,203.2-203.2V27.4
        C459.2,13.4,447.8,2,433.8,2z M375.6,172.4L223.2,324.7c-5,5-11.5,7.4-18,7.4s-13-2.5-18-7.4l-50.8-50.8c-9.9-9.9-9.9-26,0-35.9
        s26-9.9,35.9,0l32.8,32.8l134.4-134.4c9.9-9.9,26-9.9,35.9,0C385.5,146.4,385.5,162.4,375.6,172.4z"/>
      </svg>
    );
    let birthDate = null;

    if (selectedDeclaration) {
      declarationTitle = get(childPatient, 'patient.given').toString().replace(/,/g, '') + ' ' + get(childPatient, 'patient.family');
      birthDate = get(childPatient, 'patient.birthDate');
    } else {
      declarationTitle = 'New ' + category + ' Declaration';
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
    } else {
      showPics = false;
    }
    const showTrash = role !== 'registrar';
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
            <div className="pure-u-1 pure-u-md-1-3">
              <div className={styles.wiContentDetails}>
                <div className={styles.iconHolder}>{iconType}</div>
                <div className={styles.titleText}>
                  <h1 className={
                    newDeclaration == true
                      ? styles.newWorkItem + ' ' + styles.wiContentTitle
                      : styles.wiContentTitle
                  }>
                    {declarationTitle}
                  </h1>
                  <p className={styles.wiContentSubtitle}>
                    <span>{' ' + Moment(birthDate).format('Do MMMM YYYY') }</span>
                  </p>
                </div>
                {
                  Moment().diff(selectedDeclaration.created_at, 'days') > 1
                    ? <StopWatchIcon />
                    : null
                }
              </div>
            </div>
            <div className={'pure-u-1 pure-u-md-2-3'}>
              <div className={styles.wiContentControls}>
                {
                  role !== 'field officer' && (
                    <SmsButton openSMSModal={this.openSMSModal} />
                  )
                }
                {
                  role === 'field officer' ? (
                    <Button icon="image" label="Upload" flat onClick={this.openImageModal} />
                  ) : (
                    <Button icon="save" label="Save" flat onClick={this.saveProgress} />
                  )
                }
                {
                  role === 'field officer' ? (
                    <Button icon="save" label="Save" flat onClick={this.saveProgress}/>
                  ) : (
                    <Button icon="image" label="Upload" flat onClick={this.openImageModal} />
                  )
                }
                {
                  showTrash && (
                    <Button icon="delete" label="Reject" flat />
                  )
                }
                <Button icon="send" label="Submit" flat onClick={this.openSubmit} />
              </div>
            </div>
          </div>
          : selectedCertification ?
            <div className={styles.wiContentHeader + ' pure-g'}>
              <div className="pure-u-1 pure-u-md-1-3">
                <div className="pure-g">
                  <div className="pure-u-1 pure-u-md-1-2">
                    <form>
                    {
                      <Input theme={theme} type="text" label="Certificate number"  value={this.state.certNumber} onChange={this.handleChange.bind(this, 'setCertNumber')} />
                    }
                    </form>
                  </div>
                  <div className={styles.alignRight + ' pure-u-1 pure-u-md-1-2'}>
                    <Button flat onClick={this.startInvestigating}>
                      <RejectIcon /> Investigate
                    </Button>
                    <InvestigationModal
                      active={this.state.investigating}
                      onSubmit={this.handleInvestigationSubmit}
                      onCancel={this.stopInvestigating}
                    />
                  </div>
                </div>
              </div>
              <div className={'pure-u-1 pure-u-md-2-3'}>
                <div className={styles.wiContentControls}>
                  <div className={styles.certInfo}><span>National ID</span><TickIcon /></div>
                  <div className={styles.certInfo}><span>Payment</span><TickIcon /></div>
                  <div className={styles.certInfo}><span>Status</span><TickIcon /></div>
                  <div className={styles.certInfo}>
                    <Button icon="print" label="Print" flat onClick={this.displayPrintPreview} />
                  </div>
                </div>
              </div>
            </div>
          : ''
        }
        <div className={ !selectedDeclaration && newDeclaration == false && !selectedCertification
                ? styles.noSelectedDeclaration + ' pure-g'
                : styles.formOpen + ' pure-g'}>
          {
            !selectedDeclaration && newDeclaration == false && !selectedCertification
            ?
              <div className={'pure-u-1 pure-u-md-1-1 ' + styles.noSelectedMessage}>
                <h1 className={styles.wiContentTitle}>
                  {
                    role == 'registrar' ?
                        <div><p>Select a declaration to validate,</p><p>or create a new declaration</p></div>
                      : role == 'field officer' ?
                        <div><p>Select a notification to declare,</p><p>or create a new declaration</p></div>
                      :
                        <div><p>Select a validated declaration,</p><p>to prepare the birth certificate</p></div>
                  }

                </h1>
              </div>
            : selectedCertification ?
            <div className={'pure-u-1 pure-u-md-1-1 ' + styles.printPreview}>
              <PrintPreview
                selectedCertification={selectedCertification}
              />
                <PrintTemplate>
                  <PrintPreview
                    selectedCertification={selectedCertification}
                  />
                </PrintTemplate>
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
            showPics == true ?
              <div className={'pure-u-1 pure-u-md-1-2 ' + styles.wiContentBody} style={{ height: pixelHeight }}>
                <div className="pure-g">
                  <div className="pure-u-1">
                    <DocumentContainer
                      selectedDeclaration={selectedDeclaration}
                      newDeclaration={newDeclaration}
                      tempImages={tempImages}
                      tempImageIds={tempImageIds}
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
    selectedCertification,
  } = declarationsReducer;
  const {
    tempImages,
    tempImageIds,
  } = imageReducer;
  return {
    selectedDeclaration,
    selectedCertification,
    newDeclaration,
    tempImages,
    tempImageIds,
  };
};

export default connect(
  mapStateToProps,
  null
)(WorkingItem);
