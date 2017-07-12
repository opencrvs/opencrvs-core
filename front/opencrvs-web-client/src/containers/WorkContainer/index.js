/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:17:38 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-06 10:03:37
 */
import React from 'react';
import styles from './styles.css';
import Worknav from 'components/Worknav';
import WorkList from 'components/WorkList';
import WorkingItem from 'components/WorkingItem';
import ImageLoader from 'components/ImageLoader';
import { connect } from 'react-redux';
import { fetchDeclarations, selectDeclaration } from 'actions/declaration-actions';
import { logoutUser } from 'actions/user-actions';
import {  imageModalOpened, 
          imageModalClosed, 
          imageOptionToggle,
          previewImages,
          uploadImageFile } from 'actions/image-actions';

class WorkContainer extends React.Component {

  constructor(props) {
    super(props);
  }

  componentWillMount() {
    this.props.fetchData();
  }

  render = () => {

    return (
      <div className={styles.workContainer}>
        <Worknav {...this.props} />
        <div className=" pure-g">
          <WorkList {...this.props} />
          <WorkingItem {...this.props} />
          <ImageLoader {...this.props} />
        </div>
      </div>
    );
  };
}

const mapStateToProps = ({ declarationsReducer, userReducer, imageReducer, patientsReducer }) => {
  const {
    declarations,
    selectedDeclaration,
  } = declarationsReducer;
  const { isAuthenticated,
    role,
    username } = userReducer;
  const { patients } = patientsReducer;
  const { imageModal,
    imageOption,
    previewImages,
    imageFetching,
    imageErrorMessage,
     } = imageReducer;
  return {
    declarations,
    selectedDeclaration,
    isAuthenticated,
    imageModal,
    imageOption,
    previewImages,
    imageFetching,
    imageErrorMessage,
    patients,
    role,
    username,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    
    onModalOpenClick: () => {
      dispatch(imageModalOpened());
    },
    onImageChanges: images => {
      dispatch(previewImages(images));
    },
    onModalCloseClick: () => {
      dispatch(imageModalClosed());
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
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(WorkContainer);

