import React from 'react';
import styles from './styles.css';
import Worknav from 'components/Worknav';
import WorkList from 'components/WorkList';
import WorkingItem from 'components/WorkingItem';
import { connect } from 'react-redux';
import { fetchDeclarations, selectDeclaration } from 'actions/declaration-actions';

class WorkContainer extends React.Component {

  constructor(props) {
    super(props);
  }

  componentWillMount() {
    this.props.fetchData();
  }

  render = () => {
    return (
      <div className={styles.workContainer}>
        <Worknav {...this.props} />
        <div className=" pure-g">
          <WorkList {...this.props} />
          <WorkingItem {...this.props} />
        </div>
      </div>
    );
  };
}

const mapStateToProps = ({ declarationsReducer, userReducer }) => {
  const {
    declarations,
    selectedDeclaration,
  } = declarationsReducer;
  const { isAuthenticated } = userReducer;

  return {
    declarations,
    selectedDeclaration,
    isAuthenticated,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onWorkItemClick: declaration => {
      dispatch(selectDeclaration(declaration));
    },
    fetchData: () => {dispatch(fetchDeclarations())}
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(WorkContainer);

