import React from 'react';
import { Snackbar } from 'react-toolbox';

class SnackHolder extends React.Component {
  constructor(props) {
    super(props);
  }

  handleSnackbarTimeout = (event, instance) => {
    this.props.hideSnackbar();
  };

  handleSnackbarClick = () => {
    this.props.hideSnackbar();
  };

  render = () => {
    const { snackActive,
      snackMessage } = this.props;
    return (
      <Snackbar
        action="Dismiss"
        active={snackActive}
        label={snackMessage}
        timeout={2000}
        onClick={this.handleSnackbarClick}
        onTimeout={this.handleSnackbarTimeout}
        type="cancel"
      />
    );
  }
}



export default SnackHolder;
