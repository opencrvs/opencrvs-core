import Dialog from 'react-toolbox/lib/dialog';
import React from 'react';
import PropTypes from 'prop-types';
import InvestigationForm from 'components/InvestigationForm';

function InvestigationModal({active, onSubmit, onCancel}) {
  return (
    <Dialog
      active={active}
      onEscKeyDown={onCancel}
      title="Investigate">
      <InvestigationForm onSubmit={onSubmit} onCancel={onCancel} />
    </Dialog>
  );
}

InvestigationModal.propTypes = {
  active: PropTypes.bool,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

InvestigationModal.defaultProps = {
  active: false,
};

export default InvestigationModal;
