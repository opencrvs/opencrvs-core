/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:19:12 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-20 12:15:33
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
    const { trackingID, trackingModal } = this.props;
    const dialogueActions = [
      { label: 'Close', onClick: this.closeImageModal },
    ];
    return (
      <Dialog
        actions={dialogueActions}
        active={trackingModal}
        onEscKeyDown={this.closeImageModal}
        title="Declaration submitted"
      >
         <section className={styles.confirmSection}>
          <h1 className={ styles.submitConfirmHeader }>Tracking ID: { trackingID }</h1>
          </section>
      </Dialog>
    );
  }
}

export default TrackingModal;

