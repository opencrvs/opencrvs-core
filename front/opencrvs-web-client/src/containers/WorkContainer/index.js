import React from 'react';
import styles from './styles.css';
import Worknav from 'components/Worknav';
import WorkList from 'components/WorkList';
import WorkingItem from 'components/WorkingItem';
import ImageLoader from 'components/ImageLoader';
import { connect } from 'react-redux';
import { fetchDeclarations, selectDeclaration } from 'actions/declaration-actions';
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

const mapStateToProps = ({ declarationsReducer, userReducer, imageReducer }) => {
  const {
    declarations,
    selectedDeclaration,
  } = declarationsReducer;
  const { isAuthenticated } = userReducer;
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
    uploadImage: image => {
      dispatch(uploadImageFile(image));
    },
    fetchData: () => {dispatch(fetchDeclarations());},
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(WorkContainer);

