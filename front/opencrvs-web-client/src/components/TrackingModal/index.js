/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:19:12 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-08-15 19:47:17
 */
import React from 'react';
import styles from './styles.css';
import Dialog from 'react-toolbox/lib/dialog';

class TrackingModal extends React.Component {
  constructor(props) {
    super(props);
  }
  
  closeImageModal = (event) => {
    this.props.onModalCloseClick('tracking');
  }

  render = () => {
    const { trackingID, 
      trackingModal, 
      newChildPersonalID,
      newBirthRegistrationNumber,
       } = this.props;
    const dialogueActions = [
      { label: 'Close', onClick: this.closeImageModal },
    ];
    return (
      <Dialog
        actions={dialogueActions}
        active={trackingModal}
        onEscKeyDown={this.closeImageModal}
        title={
          newChildPersonalID ?
            'Birth successfully registered'
          :
            'Declaration submitted'
        }
      >
         <section className={styles.confirmSection}>
          <h1 className={ styles.submitConfirmHeader }>Tracking ID: { trackingID.toUpperCase() }</h1>
          {
            newBirthRegistrationNumber &&
              <h1 className={ styles.submitConfirmHeader }>
              Birth registration number: { newBirthRegistrationNumber }</h1>
          }
          {
            newChildPersonalID &&
              <h1 className={ styles.submitConfirmHeader }>
              Personal ID number: { newChildPersonalID }</h1>
          }
          </section>
      </Dialog>
    );
  }
}

export default TrackingModal;

