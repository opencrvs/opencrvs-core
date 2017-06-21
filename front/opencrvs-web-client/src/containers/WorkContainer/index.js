import React from 'react';
import styles from './styles.css';
import Worknav from 'components/Worknav';
import WorkList from 'components/WorkList';
import WorkingItem from 'components/WorkingItem';
import { connect } from 'react-redux';
import { fetchDeclarations } from 'actions/declaration-actions';

class WorkContainer extends React.Component {

  constructor(props) {
    super(props);
  }

  componentWillMount() {
    this.props.fetchData();
  }

  render = () => {
    return (
      <div className={styles.workItemContainer + " content pure-g"}>
        <Worknav {...this.props} />
        <WorkList {...this.props} />
        <WorkingItem {...this.props} />
      </div>
    );
  };
}

const mapStateToProps = ({ declarationsReducer, userReducer }) => {
  const {
    declarations,
    authenticated,
    isFetchingDeclaration,
  } = declarationsReducer;
  const { isAuthenticated, isFetchingUser, errorMessage } = userReducer;

  return {
    declarations,
    authenticated,
    isAuthenticated,
    isFetchingUser,
    errorMessage,
    isFetchingDeclaration,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onTodoClick: id => {
      //dispatch(selectDeclaration(id))
    },
    fetchData: () => {dispatch(fetchDeclarations())}
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(WorkContainer);

