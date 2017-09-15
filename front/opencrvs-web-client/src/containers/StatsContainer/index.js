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
import Checkbox from 'react-toolbox/lib/checkbox';
import { Button } from 'react-toolbox/lib/button';
import PropTypes from 'prop-types';

function StatsRow({text, fromDate, toDate, checked, onChange}) {
  return (
    <div className={styles.statsRow + ' pure-g'}>
      <div className={styles.subjectTitle + ' pure-u-1-4'}>
        <p className={styles.itemText}>{text}</p>
      </div>
      <div className="pure-u-1-4">
        <p className={styles.itemText}>{fromDate}</p>
      </div>
      <div className="pure-u-1-4">
        <p className={styles.itemText}>{toDate}</p>
      </div>
      <div className="pure-u-1-4">
        <div className={styles.checkBoxes}>
          <Checkbox checked={checked} onChange={onChange} />
        </div>
      </div>
    </div>
  );
}

StatsRow.propTypes = {
  text: PropTypes.string.isRequired,
  fromDate: PropTypes.string.isRequired,
  toDate: PropTypes.string.isRequired,
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
};

class StatsContainer extends React.Component {
  state = {
    check1: false,
    check2: true,
    check3: false,
    check4: false,
    check5: false,
    check6: false,
    check7: false,
    check8: false,
    check9: false,
    check10: false,
    check11: false,
    check12: false,
    check13: false,
    check14: false,
    check15: false,
    check16: false,
    check17: false,
    check18: false,
    check19: false,
    check20: false
  };

  constructor(props) {
    super(props);
    
  }

  handleChange = (field, value) => {
    this.setState({...this.state, [field]: value});
  };

  componentWillMount() {
    this.props.fetchUserDetails();
  }

  render = () => {
    const fromDate = Moment().subtract(28, 'days').format('Do MMM');
    const toDate = Moment().subtract(14, 'days').format('Do MMM');
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
            <StatsRow
              text="Live births by place of occurrence and sex of child"
              fromDate={fromDate}
              toDate={toDate}
              checked={this.state.check1}
              onChange={this.handleChange.bind(this, 'check1')}
            />
            <StatsRow
              text="Live births by place of occurrence and place of usual residence of mother"
              fromDate={fromDate}
              toDate={toDate}
              checked={this.state.check2}
              onChange={this.handleChange.bind(this, 'check2')}
            />
            <StatsRow
              text="Live births by place of registration, month of occurrence and month of registration"
              fromDate={fromDate}
              toDate={toDate}
              checked={this.state.check3}
              onChange={this.handleChange.bind(this, 'check3')}
            />
            <StatsRow
              text="Live births by month, place of occurrence and place of usual residence of mother"
              fromDate={fromDate}
              toDate={toDate}
              checked={this.state.check4}
              onChange={this.handleChange.bind(this, 'check4')}
            />
            <StatsRow
              text="Live births by age, place of usual residence and marital status of mother"
              fromDate={fromDate}
              toDate={toDate}
              checked={this.state.check5}
              onChange={this.handleChange.bind(this, 'check5')}
            />
            <StatsRow
              text="Live births by age of father"
              fromDate={fromDate}
              toDate={toDate}
              checked={this.state.check6}
              onChange={this.handleChange.bind(this, 'check6')}
            />
            <StatsRow
              text="Live births by place of usual residence, age and educational attainment of mother"
              fromDate={fromDate}
              toDate={toDate}
              checked={this.state.check7}
              onChange={this.handleChange.bind(this, 'check7')}
            />
            <StatsRow
              text="Live births by educational attainment and age of mother and live-birth order"
              fromDate={fromDate}
              toDate={toDate}
              checked={this.state.check8}
              onChange={this.handleChange.bind(this, 'check8')}
            />
            <StatsRow
              text="Live births by place of usual residence and age of mother, sex of child and live-birth order"
              fromDate={fromDate}
              toDate={toDate}
              checked={this.state.check9}
              onChange={this.handleChange.bind(this, 'check9')}
            />
            <StatsRow
              text="Live births by live-birth order and interval between last and previous live-births to mother"
              fromDate={fromDate}
              toDate={toDate}
              checked={this.state.check10}
              onChange={this.handleChange.bind(this, 'check10')}
            />
            <StatsRow
              text="Live births by ethnic and/or national group and place of usual residence and age of mother"
              fromDate={fromDate}
              toDate={toDate}
              checked={this.state.check11}
              onChange={this.handleChange.bind(this, 'check11')}
            />
            <StatsRow
              text="Live births by place of usual residence and age of mother and legitimacy status"
              fromDate={fromDate}
              toDate={toDate}
              checked={this.state.check12}
              onChange={this.handleChange.bind(this, 'check12')}
            />
            <StatsRow
              text="Live births by place of occurrence, site of delivery and attendant at birth"
              fromDate={fromDate}
              toDate={toDate}
              checked={this.state.check13}
              onChange={this.handleChange.bind(this, 'check13')}
            />
            <StatsRow
              text="Live births by site of delivery, attendant at birth and birth weight"
              fromDate={fromDate}
              toDate={toDate}
              checked={this.state.check14}
              onChange={this.handleChange.bind(this, 'check14')}
            />
            <StatsRow
              text="Live births by birth weight and place of usual residence and educational attainment of mother"
              fromDate={fromDate}
              toDate={toDate}
              checked={this.state.check15}
              onChange={this.handleChange.bind(this, 'check15')}
            />
            <StatsRow
              text="Live births by gestational age and birth weight"
              fromDate={fromDate}
              toDate={toDate}
              checked={this.state.check16}
              onChange={this.handleChange.bind(this, 'check16')}
            />
            <StatsRow
              text="Live births by birth weight, place of usual residence of mother and month in which prenatal care began"
              fromDate={fromDate}
              toDate={toDate}
              checked={this.state.check17}
              onChange={this.handleChange.bind(this, 'check17')}
            />
            <StatsRow
              text="Live births by age and place of usual residence of mother and month in which prenatal care began"
              fromDate={fromDate}
              toDate={toDate}
              checked={this.state.check18}
              onChange={this.handleChange.bind(this, 'check18')}
            />
            <StatsRow
              text="Live births by live-birth order, place of usual residence of mother and month in which prenatal care"
              fromDate={fromDate}
              toDate={toDate}
              checked={this.state.check19}
              onChange={this.handleChange.bind(this, 'check19')}
            />
            <StatsRow
              text="Live births by place of usual residence of mother and duration of residence at the current usual residence"
              fromDate={fromDate}
              toDate={toDate}
              checked={this.state.check20}
              onChange={this.handleChange.bind(this, 'check20')}
            />
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
  globalReducer }) => {
  const { selectedLocationMapData } = managerReducer;
  const { 
    menuOpened,
    reportOption } = globalReducer;
  return {
    selectedLocationMapData,
    reportOption,
    menuOpened,
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
    }
    ////
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(StatsContainer);

