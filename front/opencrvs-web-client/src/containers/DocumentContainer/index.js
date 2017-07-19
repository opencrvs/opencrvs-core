/*
 * @Author: Euan Millar 
 * @Date: 2017-07-14 20:45:09 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-16 22:01:56
 */
import React from 'react';
import ImageCard from 'components/ImageCard';
import { map } from 'lodash';
import { UPLOADS_URL } from 'constants/urls';
import { connect } from 'react-redux';
import styles from './styles.css';
import { 
  onZoomImage, 
  deleteImage,
} from 'actions/image-actions';

class DocumentContainer extends React.Component {
  constructor(props) {
    super(props);
  }

  render = () => {
    const { images, onZoomImage, onDeleteImage} = this.props;
    return (
      <div className={styles.documents + ' pure-g'}>
      {
          map(images, (image, index ) => (
          <ImageCard 
            id={image.id} 
            key={index} 
            imageUrl={UPLOADS_URL + image.staticFile}
            imageTitle={image.oldName}
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

const mapStateToProps = ({ imageReducer }) => {

  const { 
    images,
     } = imageReducer;
  return {
    images,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    
    onZoomImage: id => {
      dispatch(onZoomImage(id));
    },
    onDeleteImage: id => {
      dispatch(deleteImage(id));
    },
    
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(DocumentContainer);


