

import React from 'react';
import styles from './styles.css';
import { connect } from 'react-redux';

class OverviewPerformance extends React.Component {
  constructor(props) {
    super(props);
  }

  togglePerf = (event) => {
    this.props.togglePerformance();
  }

  render = () => {
    const { perfOpened } = this.props;
    return (

      
      <div className={
        perfOpened == 0
        ? styles.closed + ' pure-g'
        : styles.open + ' pure-g'
      }>
        <div className="pure-u-1" onClick={this.togglePerf}>
          <div className={styles.toggle}>
            PERFORMANCE
          </div>
          <div className={styles.upArrow}>
          </div>
          
        </div>
      </div>
    );
  }
}

   

const mapStateToProps = ({ managerReducer }) => {
  
  const { perfOpened } = managerReducer;

  return {
    perfOpened,
  };
};

export default connect(mapStateToProps, null)(OverviewPerformance);
