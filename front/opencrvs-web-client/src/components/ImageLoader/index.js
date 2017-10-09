/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:19:12 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-10-09 10:00:19
 */
import React from 'react';
import styles from './styles.css';
import Dialog from 'react-toolbox/lib/dialog';
import {Tab, Tabs} from 'react-toolbox';
import { Button } from 'react-toolbox/lib/button';
import Dropzone from 'react-dropzone';
import ProgressBar from 'react-toolbox/lib/progress_bar';
import Webcam from 'react-webcam';
import theme from './cameraButton.css';
const Moment = require('moment');

class ImageLoader extends React.Component {
  constructor(props) {
    super(props);
  }

  setRef = (webcam) => {
    this.webcam = webcam;
  }

  capture = () => {
    const b64Data = this.webcam.getScreenshot();

    fetch(b64Data)
      .then(res => res.blob())
      .then(blob => {

        const filename = `Camera-${Moment().format('MMM-Do-YY')}-at-${Moment().format('h-mm-ss')}.jpg`;
        const file = new File([blob], filename, {type: 'image/jpeg', lastModified: Date.now()});
        const fileArray = [];
        fileArray.push(file);
        this.props.uploadImage(fileArray);
      });
    
  };
  
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
              <div className={
                !imageFetching
                  ?
                  styles.imageTarget + ' pure-g'
                  :
                  styles.imageTargetUploading + ' pure-g'
                }>
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
                      <h5>Max size: 1MB</h5>
                      <input type="file" id="file" ref="fileUploader" className={styles.imageInput} />
                      <Button icon="image" label="Choose photos to upload" raised primary />
                      <p className={styles.errorMessage}>{imageErrorMessage}</p>
                    </Dropzone>
                  :
                    <div className={styles.progressHolder}>
                      <ProgressBar type="circular" mode="indeterminate" multicolor />
                    </div>
                }
               
              </div>
            </Tab>
            <Tab label="Camera" onActive={this.handleActive}>
              <div className={!imageFetching
              
                ? `${styles.cameraTarget} pure-g` 
                : `${styles.cameraTargetUploading} pure-g'`}>
                {
                  !imageFetching
                  ?
                    <div className="pure-u-1">
                      <Webcam
                        audio={false}
                        ref={this.setRef}
                        screenshotFormat="image/jpeg"
                        className={styles.webcam}
                      />

                      <Button theme={theme} icon="image" label="Take picture" raised primary onClick={this.capture} />
                    </div>
                  :
                    <div className={styles.progressHolder}>
                      <ProgressBar type="circular" mode="indeterminate" multicolor />
                    </div>
                }
              </div>
            </Tab>
          </Tabs>
          </section>
      </Dialog>
    );
  }
}

export default ImageLoader;
