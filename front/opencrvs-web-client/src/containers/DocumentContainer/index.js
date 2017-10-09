/*
 * @Author: Euan Millar 
 * @Date: 2017-07-14 20:45:09 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-10-09 11:49:32
 */
import React from 'react';
import ImageCard from 'components/ImageCard';
import { map } from 'lodash';
import { UPLOADS_URL } from 'constants/urls';
import { connect } from 'react-redux';
import styles from './styles.css';
import { 
  onZoomImage, 
  imageToDelete,
} from 'actions/image-actions';
import {
  submitModalOpened,
} from 'actions/declaration-actions';

class DocumentContainer extends React.Component {
  constructor(props) {
    super(props);
  }

  render = () => {
    const { tempImages, tempImageIds, onZoomImage, onDeleteImage, selectedDeclaration} = this.props;

    let imageArray = null;
    console.log("hi: " + selectedDeclaration);
    if (selectedDeclaration) {
      let tempImagesBySelectedId = [];
      map(tempImageIds, (id, index ) => {
        if ( id == selectedDeclaration.id) {
          tempImagesBySelectedId.push(tempImages[index]);
        }
      });
      imageArray = selectedDeclaration.documents.concat(tempImagesBySelectedId);
    } else {
      imageArray = tempImages;
    }
    return (
      <div className={styles.documents + ' pure-g'}>
      {
          map(imageArray, (image, index ) => (
          <ImageCard 
            id={image.id} 
            key={index} 
            imageUrl={UPLOADS_URL + image.staticFile}
            imageTitle={image.name}
            imageSubtitle={image.staticFile}
            onZoomImage={onZoomImage}
            onDeleteImage={onDeleteImage}
          />
        ))
      }
      </div>
    );
  };
}

const mapStateToProps = ({ declarationsReducer, imageReducer }) => {
  const {
    selectedDeclaration,
  } = declarationsReducer;
  const { 
    tempImages,
     } = imageReducer;
  return {
    tempImages,
    selectedDeclaration,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    
    onZoomImage: id => {
      dispatch(onZoomImage(id));
    },
    onDeleteImage: id => {
      console.log('buttton: ' + id);
      dispatch(imageToDelete(id));
      dispatch(submitModalOpened());
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(DocumentContainer);


