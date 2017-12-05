import React from 'react';
import Dialog from 'react-toolbox/lib/dialog';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import styles from './styles.css';
import DatePicker from 'react-toolbox/lib/date_picker';
import moment from 'moment';

function formatDate(date) {
  return moment(date).format('Do MMM');
}

const CustomizedAxisTick = React.createClass({
  render() {
    const { x, y, payload } = this.props;

    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={0}
          y={0}
          dy={16}
          textAnchor="end"
          fill="#666"
          className={styles.labels}
        >
          {payload.value}
        </text>
      </g>
    );
  }
});

class RatesOverTimeModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fromDate: moment('2017-01-01').toDate(),
      toDate: moment('2017-01-31').toDate(),
    };

    this.handleFromDateChange = this.handleChange.bind(this, 'fromDate');
    this.handleToDateChange = this.handleChange.bind(this, 'toDate');
  }
  
  handleChange(field, value) {
    this.setState({[field]: value});
  }

  cancel = () => {
    this.props.onModalCloseClick('rates');
  };

  onDropdownChange = value => {
    if (value) {
      this.setState({ ...this.state, contactPerson: value });
    }
  };

  render = () => {
    const { ratesOverTimeModal, registrationRateData } = this.props;

   

    const dialogueActions = [
      { label: 'Back', onClick: this.cancel }
    ];

    return (
      <Dialog
        active={ratesOverTimeModal > 0}
        actions={dialogueActions}
        onEscKeyDown={this.cancel}
        title="National registration rates of children under 5 during 2017"
        type="medium"
      >
        <section>
          <div className="pure-g">
            <div className="pure-u-1-5">
                <div className={styles.dropDowns + ' pure-g'}>
                    <div className="pure-u-1-1">
                        <DatePicker
                            inputFormat={formatDate}
                            value={this.state.fromDate}
                            label="From:"
                            onChange={this.handleFromDateChange}
                        />
                    </div>
                    <div className="pure-u-1-1">
                        <DatePicker
                            inputFormat={formatDate}
                            value={this.state.toDate}
                            label="To:"
                            onChange={this.handleToDateChange}
                        />
                    </div>
                </div>
            </div>
            <div className="pure-u-4-5">
                <div className={styles.graphHolder}>
                    <div className={styles.percentageLabel}>Percentage %</div>
                    <AreaChart BarChart width={640} height={380} layout="horizontal" data={registrationRateData}
                    margin={{top: 10, right: 30, left: 0, bottom: 40}}>
                        <XAxis dataKey="name" tick={<CustomizedAxisTick/>} 
                interval={0} />
                        <YAxis/>
                        <CartesianGrid strokeDasharray="3 3"/>
                        <Tooltip/>
                        <Area type="monotone" dataKey="percentage" stroke="#2d3e50" fill="#2d3e50" />
                    </AreaChart>
                </div>
            </div>
          </div>
        </section>
      </Dialog>
    );
  };
}

export default RatesOverTimeModal;
