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
              <h3>Download anonymised statistic reports as .xls or .pdf</h3>
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
            <div className={styles.statsRow + ' pure-g'}>
              <div className={styles.subjectTitle + ' pure-u-1-4'}>
                <p className={styles.itemText}>Live births by place of occurrence and sex of child</p>
              </div>
              <div className="pure-u-1-4">
                <p className={styles.itemText}>{fromDate}</p>
              </div>
              <div className="pure-u-1-4">
                <p className={styles.itemText}>{toDate}</p>
              </div>
              <div className="pure-u-1-4">
                <div className={styles.checkBoxes}>
                  <Checkbox
                    checked={this.state.check1}
                    label="Download"
                    onChange={this.handleChange.bind(this, 'check1')}
                  />
                </div>
              </div>
            </div>
            <div className={styles.statsRow + ' pure-g'}>
              <div className={styles.subjectTitle + ' pure-u-1-4'}>
                <p className={styles.itemText}>Live births by place of occurrence
                and place of usual residence of mother</p>
              </div>
              <div className="pure-u-1-4">
                <p className={styles.itemText}>{fromDate}</p>
              </div>
              <div className="pure-u-1-4">
                <p className={styles.itemText}>{toDate}</p>
              </div>
              <div className="pure-u-1-4">
                <div className={styles.checkBoxes}>
                  <Checkbox
                    checked={this.state.check2}
                    label="Download"
                    onChange={this.handleChange.bind(this, 'check2')}
                  />
                </div>
              </div>
            </div>
            <div className={styles.statsRow + ' pure-g'}>
              <div className={styles.subjectTitle + ' pure-u-1-4'}>
                <p className={styles.itemText}>Live births by place of registration,
                month of occurrence and month of registration</p>
              </div>
              <div className="pure-u-1-4">
                <p className={styles.itemText}>{fromDate}</p>
              </div>
              <div className="pure-u-1-4">
                <p className={styles.itemText}>{toDate}</p>
              </div>
              <div className="pure-u-1-4">
                <div className={styles.checkBoxes}>
                  <Checkbox
                    checked={this.state.check3}
                    label="Download"
                    onChange={this.handleChange.bind(this, 'check3')}
                  />
                </div>
              </div>
            </div>
            <div className={styles.statsRow + ' pure-g'}>
              <div className={styles.subjectTitle + ' pure-u-1-4'}>
                <p className={styles.itemText}>Live births by month, place of
                occurrence and place of usual residence of mother</p>
              </div>
              <div className="pure-u-1-4">
                <p className={styles.itemText}>{fromDate}</p>
              </div>
              <div className="pure-u-1-4">
                <p className={styles.itemText}>{toDate}</p>
              </div>
              <div className="pure-u-1-4">
                <div className={styles.checkBoxes}>
                  <Checkbox
                    checked={this.state.check4}
                    label="Download"
                    onChange={this.handleChange.bind(this, 'check4')}
                  />
                </div>
              </div>
            </div>
            <div className={styles.statsRow + ' pure-g'}>
              <div className={styles.subjectTitle + ' pure-u-1-4'}>
                <p className={styles.itemText}>Live births by age, place of usual
                residence and marital status of mother</p>
              </div>
              <div className="pure-u-1-4">
                <p className={styles.itemText}>{fromDate}</p>
              </div>
              <div className="pure-u-1-4">
                <p className={styles.itemText}>{toDate}</p>
              </div>
              <div className="pure-u-1-4">
                <div className={styles.checkBoxes}>
                  <Checkbox
                    checked={this.state.check5}
                    label="Download"
                    onChange={this.handleChange.bind(this, 'check5')}
                  />
                </div>
              </div>
            </div>
            <div className={styles.statsRow + ' pure-g'}>
              <div className={styles.subjectTitle + ' pure-u-1-4'}>
                <p className={styles.itemText}>Live births by age of father</p>
              </div>
              <div className="pure-u-1-4">
                <p className={styles.itemText}>{fromDate}</p>
              </div>
              <div className="pure-u-1-4">
                <p className={styles.itemText}>{toDate}</p>
              </div>
              <div className="pure-u-1-4">
                <div className={styles.checkBoxes}>
                  <Checkbox
                    checked={this.state.check6}
                    label="Download"
                    onChange={this.handleChange.bind(this, 'check6')}
                  />
                </div>
              </div>
            </div>
            <div className={styles.statsRow + ' pure-g'}>
              <div className={styles.subjectTitle + ' pure-u-1-4'}>
                <p className={styles.itemText}>Live births by place of usual residence,
                age and educational attainment of mother</p>
              </div>
              <div className="pure-u-1-4">
                <p className={styles.itemText}>{fromDate}</p>
              </div>
              <div className="pure-u-1-4">
                <p className={styles.itemText}>{toDate}</p>
              </div>
              <div className="pure-u-1-4">
                <div className={styles.checkBoxes}>
                  <Checkbox
                    checked={this.state.check7}
                    label="Download"
                    onChange={this.handleChange.bind(this, 'check7')}
                  />
                </div>
              </div>
            </div>
            <div className={styles.statsRow + ' pure-g'}>
              <div className={styles.subjectTitle + ' pure-u-1-4'}>
                <p className={styles.itemText}>Live births by educational attainment
                and age of mother and live-birth order</p>
              </div>
              <div className="pure-u-1-4">
                <p className={styles.itemText}>{fromDate}</p>
              </div>
              <div className="pure-u-1-4">
                <p className={styles.itemText}>{toDate}</p>
              </div>
              <div className="pure-u-1-4">
                <div className={styles.checkBoxes}>
                  <Checkbox
                    checked={this.state.check8}
                    label="Download"
                    onChange={this.handleChange.bind(this, 'check8')}
                  />
                </div>
              </div>
            </div>
            <div className={styles.statsRow + ' pure-g'}>
              <div className={styles.subjectTitle + ' pure-u-1-4'}>
                <p className={styles.itemText}>Live births by place of usual residence
                and age of mother, sex of child and live-birth order</p>
              </div>
              <div className="pure-u-1-4">
                <p className={styles.itemText}>{fromDate}</p>
              </div>
              <div className="pure-u-1-4">
                <p className={styles.itemText}>{toDate}</p>
              </div>
              <div className="pure-u-1-4">
                <div className={styles.checkBoxes}>
                  <Checkbox
                    checked={this.state.check9}
                    label="Download"
                    onChange={this.handleChange.bind(this, 'check9')}
                  />
                </div>
              </div>
            </div>
            <div className={styles.statsRow + ' pure-g'}>
              <div className={styles.subjectTitle + ' pure-u-1-4'}>
                <p className={styles.itemText}>Live births by live-birth order and
                interval between last and previous live-births to mother</p>
              </div>
              <div className="pure-u-1-4">
                <p className={styles.itemText}>{fromDate}</p>
              </div>
              <div className="pure-u-1-4">
                <p className={styles.itemText}>{toDate}</p>
              </div>
              <div className="pure-u-1-4">
                <div className={styles.checkBoxes}>
                  <Checkbox
                    checked={this.state.check10}
                    label="Download"
                    onChange={this.handleChange.bind(this, 'check10')}
                  />
                </div>
              </div>
            </div>
            <div className={styles.statsRow + ' pure-g'}>
              <div className={styles.subjectTitle + ' pure-u-1-4'}>
                <p className={styles.itemText}>Live births by ethnic and/or national
                group and place of usual residence and age of mother</p>
              </div>
              <div className="pure-u-1-4">
                <p className={styles.itemText}>{fromDate}</p>
              </div>
              <div className="pure-u-1-4">
                <p className={styles.itemText}>{toDate}</p>
              </div>
              <div className="pure-u-1-4">
                <div className={styles.checkBoxes}>
                  <Checkbox
                    checked={this.state.check11}
                    label="Download"
                    onChange={this.handleChange.bind(this, 'check11')}
                  />
                </div>
              </div>
            </div>
            <div className={styles.statsRow + ' pure-g'}>
              <div className={styles.subjectTitle + ' pure-u-1-4'}>
                <p className={styles.itemText}>Live births by place of usual residence
                and age of mother and legitimacy status</p>
              </div>
              <div className="pure-u-1-4">
                <p className={styles.itemText}>{fromDate}</p>
              </div>
              <div className="pure-u-1-4">
                <p className={styles.itemText}>{toDate}</p>
              </div>
              <div className="pure-u-1-4">
                <div className={styles.checkBoxes}>
                  <Checkbox
                    checked={this.state.check12}
                    label="Download"
                    onChange={this.handleChange.bind(this, 'check12')}
                  />
                </div>
              </div>
            </div>
            <div className={styles.statsRow + ' pure-g'}>
              <div className={styles.subjectTitle + ' pure-u-1-4'}>
                <p className={styles.itemText}>Live births by place of occurrence,
                site of delivery and attendant at birth</p>
              </div>
              <div className="pure-u-1-4">
                <p className={styles.itemText}>{fromDate}</p>
              </div>
              <div className="pure-u-1-4">
                <p className={styles.itemText}>{toDate}</p>
              </div>
              <div className="pure-u-1-4">
                <div className={styles.checkBoxes}>
                  <Checkbox
                    checked={this.state.check13}
                    label="Download"
                    onChange={this.handleChange.bind(this, 'check13')}
                  />
                </div>
              </div>
            </div>
            <div className={styles.statsRow + ' pure-g'}>
              <div className={styles.subjectTitle + ' pure-u-1-4'}>
                <p className={styles.itemText}>Live births by site of delivery, attendant at birth and birth weight</p>
              </div>
              <div className="pure-u-1-4">
                <p className={styles.itemText}>{fromDate}</p>
              </div>
              <div className="pure-u-1-4">
                <p className={styles.itemText}>{toDate}</p>
              </div>
              <div className="pure-u-1-4">
                <div className={styles.checkBoxes}>
                  <Checkbox
                    checked={this.state.check14}
                    label="Download"
                    onChange={this.handleChange.bind(this, 'check14')}
                  />
                </div>
              </div>
            </div>
            <div className={styles.statsRow + ' pure-g'}>
              <div className={styles.subjectTitle + ' pure-u-1-4'}>
                <p className={styles.itemText}>Live births by birth weight and place of usual
                residence and educational attainment of mother</p>
              </div>
              <div className="pure-u-1-4">
                <p className={styles.itemText}>{fromDate}</p>
              </div>
              <div className="pure-u-1-4">
                <p className={styles.itemText}>{toDate}</p>
              </div>
              <div className="pure-u-1-4">
                <div className={styles.checkBoxes}>
                  <Checkbox
                    checked={this.state.check15}
                    label="Download"
                    onChange={this.handleChange.bind(this, 'check15')}
                  />
                </div>
              </div>
            </div>
            <div className={styles.statsRow + ' pure-g'}>
              <div className={styles.subjectTitle + ' pure-u-1-4'}>
                <p className={styles.itemText}>Live births by gestational age and birth weight</p>
              </div>
              <div className="pure-u-1-4">
                <p className={styles.itemText}>{fromDate}</p>
              </div>
              <div className="pure-u-1-4">
                <p className={styles.itemText}>{toDate}</p>
              </div>
              <div className="pure-u-1-4">
                <div className={styles.checkBoxes}>
                  <Checkbox
                    checked={this.state.check16}
                    label="Download"
                    onChange={this.handleChange.bind(this, 'check16')}
                  />
                </div>
              </div>
            </div>
            <div className={styles.statsRow + ' pure-g'}>
              <div className={styles.subjectTitle + ' pure-u-1-4'}>
                <p className={styles.itemText}>Live births by birth weight, place of usual
                residence of mother and month in which prenatal care began</p>
              </div>
              <div className="pure-u-1-4">
                <p className={styles.itemText}>{fromDate}</p>
              </div>
              <div className="pure-u-1-4">
                <p className={styles.itemText}>{toDate}</p>
              </div>
              <div className="pure-u-1-4">
                <div className={styles.checkBoxes}>
                  <Checkbox
                    checked={this.state.check17}
                    label="Download"
                    onChange={this.handleChange.bind(this, 'check17')}
                  />
                </div>
              </div>
            </div>
            <div className={styles.statsRow + ' pure-g'}>
              <div className={styles.subjectTitle + ' pure-u-1-4'}>
                <p className={styles.itemText}>Live births by age and place of usual
                residence of mother and month in which prenatal care began</p>
              </div>
              <div className="pure-u-1-4">
                <p className={styles.itemText}>{fromDate}</p>
              </div>
              <div className="pure-u-1-4">
                <p className={styles.itemText}>{toDate}</p>
              </div>
              <div className="pure-u-1-4">
                <div className={styles.checkBoxes}>
                  <Checkbox
                    checked={this.state.check18}
                    label="Download"
                    onChange={this.handleChange.bind(this, 'check18')}
                  />
                </div>
              </div>
            </div>
            <div className={styles.statsRow + ' pure-g'}>
              <div className={styles.subjectTitle + ' pure-u-1-4'}>
                <p className={styles.itemText}>Live births by live-birth order,
                place of usual residence of mother and month in which prenatal care</p>
              </div>
              <div className="pure-u-1-4">
                <p className={styles.itemText}>{fromDate}</p>
              </div>
              <div className="pure-u-1-4">
                <p className={styles.itemText}>{toDate}</p>
              </div>
              <div className="pure-u-1-4">
                <div className={styles.checkBoxes}>
                  <Checkbox
                    checked={this.state.check19}
                    label="Download"
                    onChange={this.handleChange.bind(this, 'check19')}
                  />
                </div>
              </div>
            </div>
            <div className={styles.statsRow + ' pure-g'}>
              <div className={styles.subjectTitle + ' pure-u-1-4'}>
                <p className={styles.itemText}>Live births by place of usual residence of mother
                and duration of residence at the current usual residence</p>
              </div>
              <div className="pure-u-1-4">
                <p className={styles.itemText}>{fromDate}</p>
              </div>
              <div className="pure-u-1-4">
                <p className={styles.itemText}>{toDate}</p>
              </div>
              <div className="pure-u-1-4">
                <div className={styles.checkBoxes}>
                  <Checkbox
                    checked={this.state.check20}
                    label="Download"
                    onChange={this.handleChange.bind(this, 'check20')}
                  />
                </div>
              </div>
            </div>
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

