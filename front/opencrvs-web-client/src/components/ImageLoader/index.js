/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:19:12 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-14 08:57:17
 */
import React from 'react';
import styles from './styles.css';
import Dialog from 'react-toolbox/lib/dialog';
import {Tab, Tabs} from 'react-toolbox';
import { Button } from 'react-toolbox/lib/button';
import Dropzone from 'react-dropzone';
import ProgressBar from 'react-toolbox/lib/progress_bar';

class ImageLoader extends React.Component {
  constructor(props) {
    super(props);
  }
  
  closeImageModal = (event) => {
    this.props.onModalCloseClick('image');
  }

  handleOptionChange = (index) => {
    this.props.onImageOptionClick();
  };

  handleActive = () => {
    console.log('camera option activated');
  };

  onDrop = (acceptedFiles) => {
    this.props.uploadImage(acceptedFiles);
  };

  render = () => {
    const { imageModal } = this.props;
    const { imageOption } = this.props;
    const { imageFetching } = this.props;
    const { imageErrorMessage } = this.props;
    const dialogueActions = [
      { label: 'Cancel', onClick: this.closeImageModal },
    ];
    return (
      <Dialog
        actions={dialogueActions}
        active={imageModal}
        onEscKeyDown={this.closeImageModal}
        title="Add supporting document"
      >
         <section>
          <Tabs index={imageOption} onChange={this.handleOptionChange}>
            <Tab label="Upload">
              <div className={styles.imageTarget + ' pure-g'}>
                {!imageFetching
                  ?
                     <Dropzone 
                      multiple="false"
                      accept="image/jpeg,image/png"
                      name="file"
                      onDrop={this.onDrop}
                      className="pure-u-1-1">
                      <h1>Drag photos here</h1>
                      <h2>Or, if you prefer ...</h2>
                      <input type="file" id="file" ref="fileUploader" className={styles.imageInput} />
                      <Button icon="image" label="Choose photos to upload" raised primary />
                      <p className={styles.errorMessage}>{imageErrorMessage}</p>
                    </Dropzone>
                  :
                    <ProgressBar type="circular" mode="indeterminate" multicolor />
                }
               
              </div>
            </Tab>
            <Tab label="Camera" onActive={this.handleActive}>
              <small>Use your camera
              </small>
            </Tab>
          </Tabs>
          </section>
      </Dialog>
    );
  }
}

export default ImageLoader;

