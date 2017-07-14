/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:19:12 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-14 09:51:45
 */
import React from 'react';
import Dialog from 'react-toolbox/lib/dialog';
import NewVitalEventButton from 'components/NewVitalEventButton';

class NewVitalEvent extends React.Component {
  constructor(props) {
    super(props);
  }
  
  closeModal = (event) => {
    this.props.onModalCloseClick('new');
  }

  render = () => {
    const { newDeclarationModal, onNewEventClick } = this.props;
    const newBirth = 'Birth';
    const newMarriage = 'Marriage';
    const newAdoption = 'Adoption';
    const newAnnulment = 'Annulment';
    const newLegitimation = 'Legitimation';
    const newRecognition = 'Recognition';
    const newSeparation = 'Separation';
    const newDeath = 'Death';
    const newFoetal = 'Foetal Death';
    const dialogueActions = [
      { label: 'Cancel', onClick: this.closeModal },
    ];
    return (
      <Dialog
        actions={dialogueActions}
        active={newDeclarationModal}
        onEscKeyDown={this.closeModal}
        title="Add new vital event"
      >
        <section>
          <div className="pure-g">
            <NewVitalEventButton action={newBirth} onClick={() => onNewEventClick(newBirth)}/>
            <NewVitalEventButton action={newMarriage} onClick={() => onNewEventClick(newMarriage)}/>
            <NewVitalEventButton action={newAdoption} onClick={() => onNewEventClick(newAdoption)}/>
          </div>
          <div className="pure-g">
            <NewVitalEventButton action={newAnnulment} onClick={() => onNewEventClick(newAnnulment)}/>
            <NewVitalEventButton action={newLegitimation} onClick={() => onNewEventClick(newLegitimation)}/>
            <NewVitalEventButton action={newRecognition} onClick={() => onNewEventClick(newRecognition)}/>
          </div>
          <div className="pure-g">
            <NewVitalEventButton action={newSeparation} onClick={() => onNewEventClick(newSeparation)}/>
            <NewVitalEventButton action={newDeath} onClick={() => onNewEventClick(newDeath)}/>
            <NewVitalEventButton action={newFoetal} onClick={() => onNewEventClick(newFoetal)}/>
          </div>
        </section>
      </Dialog>
    );
  }
}

export default NewVitalEvent;

