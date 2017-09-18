/*
 * @Author: Euan Millar
 * @Date: 2017-07-05 01:17:38
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-09-05 16:58:28
 */
import React from 'react';
import styles from './styles.css';
import Worknav from 'components/Worknav';
import { connect } from 'react-redux';
import { logoutUser,
  updateUserDetails } from 'actions/user-actions';
import {
  mobileMenuControl,
} from 'actions/global-actions';
const Moment = require('moment');
import { Button } from 'react-toolbox/lib/button';
import StatsRow from 'components/StatsRow';

const subjects = [
  'Live births by place of occurrence and sex of child',
  'Live births by place of occurrence and place of usual residence of mother',
  'Live births by place of registration, month of occurrence and month of registration',
  'Live births by month, place of occurrence and place of usual residence of mother',
  'Live births by age, place of usual residence and marital status of mother',
  'Live births by age of father',
  'Live births by place of usual residence, age and educational attainment of mother',
  'Live births by educational attainment and age of mother and live-birth order',
  'Live births by place of usual residence and age of mother, sex of child and live-birth order',
  'Live births by live-birth order and interval between last and previous live-births to mother',
  'Live births by ethnic and/or national group and place of usual residence and age of mother',
  'Live births by place of usual residence and age of mother and legitimacy status',
  'Live births by place of occurrence, site of delivery and attendant at birth',
  'Live births by site of delivery, attendant at birth and birth weight',
  'Live births by birth weight and place of usual residence and educational attainment of mother',
  'Live births by gestational age and birth weight',
  'Live births by birth weight, place of usual residence of mother and month in which prenatal care began',
  'Live births by age and place of usual residence of mother and month in which prenatal care began',
  'Live births by live-birth order, place of usual residence of mother and month in which prenatal care',
  'Live births by place of usual residence of mother and duration of residence at the current usual residence',
];

function constructCheckName(index) {
  return `check${index}`;
}

function constructCheckHandlerName(index) {
  return `handleCheck${index}Change`;
}

class StatsContainer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};

    subjects.forEach((subject, i) => {
      let checked = false;
      if (i === 1) {
        // Select the second row by default
        checked = true;
      }
      const field = constructCheckName(i);
      this.state[field] = checked;
      this[constructCheckHandlerName(i)] = this.handleChange.bind(this, field);
    });
  }

  handleChange = (field, value) => {
    this.setState({[field]: value});
  };

  componentWillMount() {
    this.props.fetchUserDetails();
  }

  render = () => {
    const fromDate = Moment().subtract(28, 'days').toDate();
    const toDate = Moment().subtract(14, 'days').toDate();
    return (
      <div className={styles.statsContainer}>
        <Worknav {...this.props} />
        <div className={styles.statsContent + ' pure-g'}>
          <div className="pure-u-1-1">
            <div className="pure-u-3-4">
              <h3>Export anonymised vital statistic reports in Excel or PDF format</h3>
            </div>
          </div>
          <div className={styles.statsTable + ' pure-u-1-1'}>
            <div className={styles.statsTitles + ' pure-g'}>
              <div className="pure-u-1-4">
                <h3 className={styles.title}>Subject</h3>
              </div>
              <div className="pure-u-1-4">
                <h3 className={styles.title}>From</h3>
              </div>
              <div className="pure-u-1-4">
                <h3 className={styles.title}>To</h3>
              </div>
              <div className="pure-u-1-4">
                <h3 className={styles.title}>Select</h3>
              </div>
            </div>
            {subjects.map((subject, i) => (
              <StatsRow
                key={i}
                text={subject}
                initialFromDate={fromDate}
                initialToDate={toDate}
                checked={this.state[constructCheckName(i)]}
                onChange={this[constructCheckHandlerName(i)]}
              />)
            )}
            <div className="pure-g">
              <div className="pure-u-3-4"></div>
              <div className={styles.saveButton + ' pure-u-1-4'}>
                <Button icon="save" label="Export data" primary raised />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
}

const mapStateToProps = ({
  managerReducer,
  globalReducer,
  userReducer }) => {
  const { selectedLocationMapData } = managerReducer;
  const {
    menuOpened,
    reportOption } = globalReducer;
  const { location } = userReducer;
  return {
    selectedLocationMapData,
    reportOption,
    menuOpened,
    location,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onLogout: () => {
      dispatch(logoutUser());
    },
    toggleMobileMenu: () => {
      dispatch(mobileMenuControl());
    },
    fetchUserDetails: () => {
      dispatch(updateUserDetails('settings'));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(StatsContainer);
