/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:17:38 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-19 10:10:04
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
import { submit } from 'redux-form';
import { connect } from 'react-redux';
import { 
  fetchDeclarations, 
  selectDeclaration, 
  newDeclarationModalOpened,
  newDeclarationModalClosed,
  newDeclarationEdit,
  submitModalOpened,
} from 'actions/declaration-actions';
import { logoutUser } from 'actions/user-actions';
import {  imageModalOpened, 
          imageModalClosed, 
          imageOptionToggle,
          previewImages,
          uploadImageFile,
          closeZoomModal } from 'actions/image-actions';

class WorkContainer extends React.Component {

  constructor(props) {
    super(props);
  }

  componentWillMount() {
    this.props.fetchData();
  }

  render = () => {
    const { imageZoomID, submitModal } = this.props;
    return (
      <div className={styles.workContainer}>
        <Worknav {...this.props} />
        <div className=" pure-g">
          <WorkList {...this.props} />
          <WorkingItem {...this.props} />
          <ImageLoader {...this.props} />
          <NewVitalEvent {...this.props} />
          {
            imageZoomID !=0 
            ? <ImageZoom {...this.props} />
            : ''
          }
          {
            submitModal !=0 
            ? <SubmitModal {...this.props} />
            : ''
          }
          
        </div>
      </div>
    );
  };
}

const mapStateToProps = ({ declarationsReducer, userReducer, imageReducer, patientsReducer }) => {
  const {
    declarations,
    selectedDeclaration,
    newDeclarationModal,
    newDeclaration,
    category,
    submitModal,
  } = declarationsReducer;
  const { isAuthenticated,
    role,
    username,
    given,
    family,
    avatar } = userReducer;
  const { patients } = patientsReducer;
  const { imageModal,
    imageOption,
    previewImages,
    imageFetching,
    imageErrorMessage,
    images,
    imageZoom,
    imageZoomID,
     } = imageReducer;
  return {
    declarations,
    submitModal,
    selectedDeclaration,
    newDeclaration,
    category,
    isAuthenticated,
    imageModal,
    imageOption,
    previewImages,
    imageFetching,
    imageErrorMessage,
    patients,
    role,
    username,
    given,
    family,
    avatar,
    newDeclarationModal,
    images,
    imageZoom,
    imageZoomID,
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
        case 'submit':
          dispatch(submitModalOpened());
          break;
      }
    },
    onImageChanges: images => {
      dispatch(previewImages(images));
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
      }
    },
    onWorkItemClick: declaration => {
      dispatch(selectDeclaration(declaration));
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
      dispatch(newDeclarationModalClosed());
      dispatch(newDeclarationEdit(category));
    },
    onSubmitModalConfirm: () => {
      dispatch(submit('activeDeclaration'));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(WorkContainer);

