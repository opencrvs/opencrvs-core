/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:19:12 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-21 00:51:41
 */
import React from 'react';
import styles from './styles.css';
import Dialog from 'react-toolbox/lib/dialog';

class ReqDocsModal extends React.Component {
  constructor(props) {
    super(props);
  }
  
  closeImageModal = (event) => {
    this.props.onModalCloseClick('req');
  }

  render = () => {
    const { reqDocsModal } = this.props;
    const dialogueActions = [
      { label: 'OK', onClick: this.closeImageModal },
    ];
    return (
      <Dialog
        actions={dialogueActions}
        active={reqDocsModal}
        onEscKeyDown={this.closeImageModal}
        title="Documents are required!"
      >
         <section className={styles.confirmSection}>
          <h1 className={ styles.submitConfirmHeader }>Proof of one type of supporting document must be provided.</h1>
          <h1 className={ styles.submitConfirmHeader }>Upload Mother's ID, Father's ID or Child's Health Card</h1>
          </section>
      </Dialog>
    );
  }
}

export default ReqDocsModal;

