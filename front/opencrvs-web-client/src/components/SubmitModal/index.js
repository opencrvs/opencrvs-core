/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:19:12 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-08-03 11:42:19
 */
import React from 'react';
import styles from './styles.css';
import Dialog from 'react-toolbox/lib/dialog';

class SubmitModal extends React.Component {
  constructor(props) {
    super(props);
  }
  
  closeImageModal = (event) => {
    this.props.onModalCloseClick('submit');
  }

  handleSubmit = (index) => {
    this.props.onSubmitModalConfirm();
  };

  render = () => {
    const { submitModal, imageToDelete } = this.props;
    const dialogueActions = [
      { label: 'No', onClick: this.closeImageModal },
      { label: 'Yes', onClick: this.handleSubmit },
    ];
    return (
      <Dialog
        actions={dialogueActions}
        active={submitModal}
        onEscKeyDown={this.closeImageModal}
        title={
          imageToDelete > 0
          ? 'Delete image'
          : 'Submit declaration'
        }
      >
         <section className={styles.confirmSection}>
          <h1 className={ styles.submitConfirmHeader }>Are you sure?</h1>
          </section>
      </Dialog>
    );
  }
}

export default SubmitModal;

