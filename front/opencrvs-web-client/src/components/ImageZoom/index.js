/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:19:12 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-16 21:42:08
 */
import React from 'react';
import styles from './styles.css';
import Dialog from 'react-toolbox/lib/dialog';
import { UPLOADS_URL } from 'constants/urls';
import theme from './zoomDialogue.css';
import { find } from 'lodash';

class ImageZoom extends React.Component {
  constructor(props) {
    super(props);
  }
  
  closeImageModal = (event) => {
    this.props.onModalCloseClick('zoom');
  }

  onImgLoad = (event, {target:img}) => {
    console.log(img.offsetHeight);
    console.log(img.offsetWidth);
  }

  render = () => {
    const { imageZoom, images, imageZoomID } = this.props;
    const dialogueActions = [
      { label: 'Close', onClick: this.closeImageModal },
    ];
    let imageObj = {};
    imageObj = find(images, {'id': imageZoomID});
    
    console.log('image to zoom: ' + JSON.stringify(imageObj));

    return (
      <Dialog
        theme={theme}
        actions={dialogueActions}
        active={!!imageZoom}
        onEscKeyDown={this.closeImageModal}
        title={
            imageZoomID != 0
            ? imageObj.oldName
            : ''
          }
      >
        <section className={styles.zoomWindow}>
          <div className={styles.zoomed}>
          {
            imageZoomID != 0
            ? <img onLoad={this.onImgLoad} src={UPLOADS_URL + imageObj.staticFile} />
            : ''
          }
            
          </div>
        </section>
      </Dialog>
    );
  }
}

export default ImageZoom;

