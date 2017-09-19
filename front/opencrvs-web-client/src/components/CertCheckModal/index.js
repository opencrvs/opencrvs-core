/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:19:12 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-09-07 15:28:31
 */
import React from 'react';
import styles from './styles.css';
import Dialog from 'react-toolbox/lib/dialog';

class CertCheckModal extends React.Component {
  constructor(props) {
    super(props);
  }
  
  closeCertCheckModal = (event) => {
    this.props.onModalCloseClick('certCheck');
  }

  render = () => {
    const { 
      certIDCheckModal, 
       } = this.props;
    const dialogueActions = [
      { label: 'Close', onClick: this.closeCertCheckModal },
    ];
    return (
      <Dialog
        actions={dialogueActions}
        active={certIDCheckModal}
        onEscKeyDown={this.closeCertCheckModal}
        title="Check Certification"
      >

       

      </Dialog>
    );
  }
}

export default CertCheckModal;

