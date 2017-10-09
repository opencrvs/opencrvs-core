import LocationListFilters from 'components/LocationListFilters';
import { connect } from 'react-redux';

const mapStateToProps = ({ managerReducer }) => {
  const {
    listFilter,
    listOrder,
  } = managerReducer;

  return {
    listFilter,
    listOrder,
  };
};

export default connect(mapStateToProps, null)(LocationListFilters);
