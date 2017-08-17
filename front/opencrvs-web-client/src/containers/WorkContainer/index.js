/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:17:38 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-08-16 15:29:30
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
import LocationContainer from 'containers/LocationContainer';
import LocationListContainer from 'containers/LocationListContainer';
import TrackingSearchContainer from 'containers/TrackingSearchContainer';
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
  reportOptionToggle,
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
      role,
      selectedLocationMapData,
      reportOption,
      reqDocsModal } = this.props;
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

          { selectedLocationMapData && <LocationContainer {...this.props}  managerView={managerView}/> }
          {
            reportOption == 0
            ? <LocationListContainer {...this.props}  managerView={managerView}/>
            : <TrackingSearchContainer {...this.props}  managerView={managerView}/>
          }
          <NewVitalEvent {...this.props} />
          { imageModal && <ImageLoader {...this.props} /> }
          { imageZoomID > 0 && <ImageZoom {...this.props} /> }
          { submitModal > 0 && <SubmitModal {...this.props} /> }
          { trackingModal > 0 && <TrackingModal {...this.props} /> }
          { reqDocsModal > 0 && <ReqDocsModal {...this.props} /> }        
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
  globalReducer }) => {
  const {
    declarations,
    selectedDeclaration,
    newDeclarationModal,
    newDeclaration,
    newNotification,
    category,
    submitModal,
    trackingModal,
    trackingID,
    reqDocsModal,
    newChildPersonalID,
    newBirthRegistrationNumber,
  } = declarationsReducer;
  const { isAuthenticated,
    role,
    username,
    given,
    family,
    avatar } = userReducer;
  const { selectedLocationMapData } = managerReducer;
  const { patients } = patientsReducer;
  const { 
    menuOpened,
    reportOption } = globalReducer;
  const { imageModal,
    imageOption,
    imageFetching,
    imageErrorMessage,
    imageZoom,
    tempImages,
    imageToDelete,
    imageZoomID,
     } = imageReducer;
  return {
    declarations,
    selectedLocationMapData,
    trackingID,
    reqDocsModal,
    trackingModal,
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
    reportOption,
    role,
    username,
    given,
    family,
    avatar,
    newDeclarationModal,
    imageZoom,
    imageZoomID,
    menuOpened,
    newChildPersonalID,
    newBirthRegistrationNumber,
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
        case 'req':
          dispatch(reqModalToggle());
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
    onReportOptionClick: () => {
      dispatch(reportOptionToggle());
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(WorkContainer);

