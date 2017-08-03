/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:19:12 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-28 19:55:19
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
    const { imageZoom, tempImages, selectedDeclaration, imageZoomID } = this.props;
    let imageArray = null;
    if (selectedDeclaration) {
      imageArray = selectedDeclaration.documents;
    } else {
      imageArray = tempImages;
    }
    const dialogueActions = [
      { label: 'Close', onClick: this.closeImageModal },
    ];
    let imageObj = {};
    imageObj = find(imageArray, {'id': imageZoomID});

    return (
      <Dialog
        theme={theme}
        actions={dialogueActions}
        active={!!imageZoom}
        onEscKeyDown={this.closeImageModal}
        title={imageZoomID > 0 && imageObj.oldName}
      >
        <section className={styles.zoomWindow}>
          <div className={styles.zoomed}>
          {
            imageZoomID !== 0
            ? <img onLoad={this.onImgLoad} src={UPLOADS_URL + imageObj.staticFile} />
            : null
          }
            
          </div>
        </section>
      </Dialog>
    );
  }
}

export default ImageZoom;

