'use strict';

import React from 'react';
import Dialog from 'react-toolbox/lib/dialog';
import Input from 'react-toolbox/lib/input';
import Dropdown from 'react-toolbox/lib/dropdown';

import styles from './styles.css';

class SMSModal extends React.Component {
  constructor(props) {
    super(props);
  }

  state = { contactPerson: '', message: '' }

  send = () => {
    this.props.sendSMS(this.state.contactPerson, this.state.message);
    this.props.onModalCloseClick('sms');
  }

  cancel = () => {
    this.props.onModalCloseClick('sms');
  }

  onDropdownChange = (value) => {
    this.setState({ ...this.state, contactPerson: value });
  }

  onInputChange = (name, value) => {
    this.setState({ ...this.state, [name]: value });
  }

  render = () => {
    const { smsModal, activeDeclaration } = this.props;

    let participantTypes = [];
    if (activeDeclaration) {
      participantTypes = [
        { value: activeDeclaration.values.mother_phone, label: 'Mother' },
        { value: activeDeclaration.values.father_phone, label: 'Father' },
        { value: activeDeclaration.values.informant_phone, label: 'Informant' },
      ];
    }

    const dialogueActions = [
      { label: 'Send', onClick: this.send },
      { label: 'Cancel', onClick: this.cancel },
    ];

    return (
      <Dialog
        active={smsModal}
        actions={dialogueActions}
        onEscKeyDown={this.cancel}
        title="Contact participants"
      >
        <section>
          <p>Send an SMS message to the participants of this declaration.</p>
          <p>Which participant would you like to contact?</p>
          <Dropdown
            auto
            source={participantTypes}
            label="Select the person you want to contact"
            onChange={this.onDropdownChange}
            value={this.state.contactPerson}
            required="true"
          />
          <p>What message would you like to send to them?</p>
          <Input
            type="text"
            label="Enter the message to send"
            value={this.state.message}
            onChange={this.onInputChange.bind(this, 'message')}
            required="true"
          />
        </section>
      </Dialog>
    );
  }
}

export default SMSModal;
