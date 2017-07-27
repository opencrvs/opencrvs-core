/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:17:38 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-27 22:59:32
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

import { submit } from 'redux-form';
import { connect } from 'react-redux';
import { 
  fetchDeclarations, 
  selectDeclaration, 
  newDeclarationModalOpened,
  newDeclarationModalClosed,
  newDeclarationEdit,
  submitModalOpened,
  trackingModalOpened,
  submitDeclaration,
  reqModalToggle,
} from 'actions/declaration-actions';
import { logoutUser } from 'actions/user-actions';
import {  imageModalOpened, 
          imageModalClosed, 
          imageOptionToggle,
          uploadImageFile,
          clearTempImages,
          closeZoomModal } from 'actions/image-actions';
import {
  mobileMenuControl,
} from 'actions/global-actions';

class WorkContainer extends React.Component {

  constructor(props) {
    super(props);
  }

  componentWillMount() {
    this.props.fetchData();
  }

  render = () => {
    const { 
      imageZoomID, 
      submitModal, 
      trackingModal,
      reqDocsModal } = this.props;
    return (
      <div className={styles.workContainer}>
        <Worknav {...this.props} />
        <div className=" pure-g">
          <WorkList {...this.props} />
          <WorkingItem {...this.props} />
          <ImageLoader {...this.props} />
          <NewVitalEvent {...this.props} />
          {
            imageZoomID != 0 
            ? <ImageZoom {...this.props} />
            : ''
          }
          {
            submitModal != 0 
            ? <SubmitModal {...this.props} />
            : ''
          }

          {
            trackingModal != 0
            ? <TrackingModal {...this.props} />
            : ''
          }

          {
            reqDocsModal != 0
            ? <ReqDocsModal {...this.props} />
            : ''
          }
          
        </div>
      </div>
    );
  };
}

const mapStateToProps = ({ declarationsReducer, userReducer, imageReducer, patientsReducer, globalReducer }) => {
  const {
    declarations,
    selectedDeclaration,
    newDeclarationModal,
    newDeclaration,
    category,
    submitModal,
    trackingModal,
    trackingID,
    reqDocsModal,
  } = declarationsReducer;
  const { isAuthenticated,
    role,
    username,
    given,
    family,
    avatar } = userReducer;
  const { patients } = patientsReducer;
  const { menuOpened } = globalReducer;
  const { imageModal,
    imageOption,
    imageFetching,
    imageErrorMessage,
    imageZoom,
    tempImages,
    imageZoomID,
     } = imageReducer;
  return {
    declarations,
    trackingID,
    reqDocsModal,
    trackingModal,
    submitModal,
    selectedDeclaration,
    newDeclaration,
    category,
    isAuthenticated,
    imageModal,
    imageOption,
    tempImages,
    imageFetching,
    imageErrorMessage,
    patients,
    role,
    username,
    given,
    family,
    avatar,
    newDeclarationModal,
    imageZoom,
    imageZoomID,
    menuOpened,
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
    fetchData: () => {dispatch(fetchDeclarations());},
    onNewEventClick: category => {
      dispatch(clearTempImages());
      dispatch(newDeclarationModalClosed());
      dispatch(newDeclarationEdit(category));
    },
    onSubmitModalConfirm: () => {
      dispatch(submitDeclaration());
    },
    toggleMobileMenu: () => {
      dispatch(mobileMenuControl());
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(WorkContainer);

