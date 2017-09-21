/*
 * @Author: Euan Millar
 * @Date: 2017-07-05 01:17:38
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-09-19 12:45:26
 */
import React from 'react';
import styles from './styles.css';
import Worknav from 'components/Worknav';
import WorkList from 'components/WorkList';
import WorkingItem from 'components/WorkingItem';
import ImageLoader from 'components/ImageLoader';
import NewVitalEvent from 'components/NewVitalEvent';
import ImageZoom from 'components/ImageZoom';
import SubmitModal from 'components/SubmitModal';
import TrackingModal from 'components/TrackingModal';
import ReqDocsModal from 'components/ReqDocsModal';
import CertCheckModal from 'components/CertCheckModal';
import SMSModal from 'components/SMSModal';

import { submit } from 'redux-form';
import { connect } from 'react-redux';
import {
  selectDeclaration,
  newDeclarationModalOpened,
  newDeclarationModalClosed,
  newDeclarationEdit,
  submitModalOpened,
  trackingModalOpened,
  submitDeclaration,
  reqModalToggle,
  certCheckModalClosed,
  proceedToPrintView,
  smsModalToggle,
  sendSMS,
} from 'actions/declaration-actions';
import { logoutUser,
  updateUserDetails } from 'actions/user-actions';
import {  imageModalOpened,
          imageModalClosed,
          imageOptionToggle,
          uploadImageFile,
          clearTempImages,
          deleteImage,
          closeZoomModal,
          resetDeleteImageFlag } from 'actions/image-actions';
import {
  mobileMenuControl,
} from 'actions/global-actions';
import {
  updateCertNumber,
} from 'actions/certification-actions';

class WorkContainer extends React.Component {

  constructor(props) {
    super(props);
  }

  componentWillMount() {
    this.props.fetchUserDetails();
  }

  render = () => {
    const {
      imageZoomID,
      submitModal,
      imageModal,
      imageToDelete,
      trackingModal,
      certIDCheckModal,
      role,
      reqDocsModal,
      smsModal } = this.props;
    let managerView = false;
    if (role == 'admin' || role == 'manager' ) {
      managerView = true;
    }
    return (
      <div className={styles.workContainer}>
        <Worknav {...this.props} />
        <div className=" pure-g">
          <WorkList {...this.props} managerView={managerView}/>
          <WorkingItem {...this.props} managerView={managerView}/>
          <NewVitalEvent {...this.props} />
          { imageModal && <ImageLoader {...this.props} /> }
          { imageZoomID > 0 && <ImageZoom {...this.props} /> }
          { submitModal > 0 && <SubmitModal {...this.props} /> }
          { trackingModal > 0 && <TrackingModal {...this.props} /> }
          { reqDocsModal > 0 && <ReqDocsModal {...this.props} /> }
          { certIDCheckModal > 0 && <CertCheckModal {...this.props} /> }
          { reqDocsModal > 0 && <ReqDocsModal {...this.props} /> }
          { smsModal > 0 && <SMSModal {...this.props} /> }
        </div>
      </div>
    );
  };
}

const mapStateToProps = ({
  declarationsReducer,
  userReducer,
  imageReducer,
  patientsReducer,
  managerReducer,
  globalReducer,
  form }) => {
  const {
    declarations,
    selectedDeclaration,
    newDeclarationModal,
    newDeclaration,
    newNotification,
    category,
    submitModal,
    trackingModal,
    certIDCheckModal,
    trackingID,
    reqDocsModal,
    newChildPersonalID,
    newBirthRegistrationNumber,
    smsModal,
  } = declarationsReducer;

  const { isAuthenticated,
    role,
    username,
    given,
    family,
    avatar,
    location } = userReducer;
  const { patients } = patientsReducer;
  const {
    menuOpened } = globalReducer;
  const { imageModal,
    imageOption,
    imageFetching,
    imageErrorMessage,
    imageZoom,
    tempImages,
    imageToDelete,
    imageZoomID,
     } = imageReducer;
  const { activeDeclaration } = form;
  return {
    declarations,
    trackingID,
    reqDocsModal,
    trackingModal,
    certIDCheckModal,
    imageToDelete,
    submitModal,
    selectedDeclaration,
    newDeclaration,
    category,
    isAuthenticated,
    imageModal,
    imageOption,
    newNotification,
    tempImages,
    imageFetching,
    imageErrorMessage,
    patients,
    role,
    username,
    given,
    family,
    avatar,
    location,
    newDeclarationModal,
    imageZoom,
    imageZoomID,
    menuOpened,
    newChildPersonalID,
    newBirthRegistrationNumber,
    smsModal,
    sendSMS,
    activeDeclaration,
  };
};

const mapDispatchToProps = dispatch => {
  return {

    onModalOpenClick: context => {
      switch (context) {
        case 'image':
          dispatch(imageModalOpened());
          break;
        case 'new':
          dispatch(newDeclarationModalOpened());
          break;
        case 'req':
          dispatch(reqModalToggle());
          break;
        case 'sms':
          dispatch(smsModalToggle());
          break;
      }
    },
    onModalCloseClick: context => {
      switch (context) {
        case 'image':
          dispatch(imageModalClosed());
          break;
        case 'new':
          dispatch(newDeclarationModalClosed());
          break;
        case 'zoom':
          dispatch(closeZoomModal());
          break;
        case 'submit':
          dispatch(submitModalOpened());
          dispatch(resetDeleteImageFlag());
          break;
        case 'tracking':
          dispatch(trackingModalOpened());
          break;
        case 'certCheck':
          dispatch(certCheckModalClosed());
          break;
        case 'req':
          dispatch(reqModalToggle());
          break;
        case 'sms':
          dispatch(smsModalToggle());
          break;
      }
    },
    onWorkItemClick: declaration => {
      dispatch(selectDeclaration(declaration));
    },
    onNavSubmitClick: () => {
      dispatch(submit('activeDeclaration'));
    },
    onImageOptionClick: () => {
      dispatch(imageOptionToggle());
    },
    onLogout: () => {
      dispatch(logoutUser());
    },
    uploadImage: image => {
      dispatch(uploadImageFile(image));
    },
    onNewEventClick: category => {
      dispatch(clearTempImages());
      dispatch(newDeclarationModalClosed());
      dispatch(newDeclarationEdit(category));
    },
    fetchUserDetails: () => {
      dispatch(updateUserDetails());
    },
    onSubmitModalConfirm: context => {
      dispatch(deleteImage());
      dispatch(submitDeclaration());
    },
    toggleMobileMenu: () => {
      dispatch(mobileMenuControl());
    },
    onUpdateCertNumber: value => {
      dispatch(updateCertNumber(value));
    },
    onPrintProceed: () => {
      dispatch(proceedToPrintView());
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(WorkContainer);

