import Checkbox from 'react-toolbox/lib/checkbox';
import DatePicker from 'react-toolbox/lib/date_picker';
import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';
import styles from './styles.css';

function formatDate(date) {
  return moment(date).format('Do MMM');
}

class StatsRow extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      fromDate: this.props.initialFromDate,
      toDate: this.props.initialToDate,
    };

    this.handleFromDateChange = this.handleChange.bind(this, 'fromDate');
    this.handleToDateChange = this.handleChange.bind(this, 'toDate');
  }

  handleChange(field, value) {
    this.setState({[field]: value});
  }

  render() {
    return (
      <div className={styles.statsRow + ' pure-g'}>
        <div className={styles.subjectTitle + ' pure-u-1-4'}>
          <p className={styles.itemText}>{this.props.text}</p>
        </div>
        <div className="pure-u-1-4">
          <DatePicker
            inputFormat={formatDate}
            value={this.state.fromDate}
            onChange={this.handleFromDateChange}
          />
        </div>
        <div className="pure-u-1-4">
          <DatePicker
            inputFormat={formatDate}
            value={this.state.toDate}
            onChange={this.handleToDateChange}
          />
        </div>
        <div className="pure-u-1-4">
          <div className={styles.checkBoxes}>
            <Checkbox
              checked={this.props.checked}
              onChange={this.props.onChange}
            />
          </div>
        </div>
      </div>
    );
  }
}

StatsRow.propTypes = {
  text: PropTypes.string.isRequired,
  initialFromDate: PropTypes.instanceOf(Date).isRequired,
  initialToDate: PropTypes.instanceOf(Date).isRequired,
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default StatsRow;
