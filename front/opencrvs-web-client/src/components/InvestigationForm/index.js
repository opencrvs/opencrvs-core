import PropTypes from 'prop-types';
import React from 'react';
import Button from 'react-toolbox/lib/button';
import Input from 'react-toolbox/lib/input';
import Dropdown from 'react-toolbox/lib/dropdown';

const reasons = [
  {label: 'Data entry error', value: 'DATA_ENTRY_ERROR'},
  {label: 'Illegible supporting document', value: 'ILLEGIBLE_SUPPORTING_DOCUMENT'},
  {label: 'Other', value: 'OTHER'},
];

class InvestigationForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      reason: null,
      notes: '',
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleReasonChange = this.handleReasonChange.bind(this);
    this.handleNotesChange = this.handleNotesChange.bind(this);
  }

  handleSubmit(ev) {
    ev.preventDefault();
    this.props.onSubmit({
      reason: this.state.reason,
      notes: this.state.notes,
    });
  }

  handleReasonChange(reason) {
    this.setState({reason});
  }

  handleNotesChange(notes) {
    this.setState({notes});
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <Dropdown
          label="Reason"
          source={reasons}
          value={this.state.reason}
          onChange={this.handleReasonChange}
          required
        />
        <Input
          label="Notes"
          type="text"
          multiline
          rows={3}
          value={this.state.notes}
          onChange={this.handleNotesChange}
        />
        <div>
          <Button label="Submit" type="submit" />
          <Button label="Cancel" type="button" onClick={this.props.onCancel} />
        </div>
      </form>
    );
  }
}

InvestigationForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
};

export default InvestigationForm;
