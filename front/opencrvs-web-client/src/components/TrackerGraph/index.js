

import React from 'react';
import styles from './styles.css';
import { LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend } from 'recharts';
import CustomizedAxisTick from 'components/CustomizedAxisTick';
import CustomizedLabel from 'components/CustomizedLabel';
const Moment = require('moment');


class TrackerGraph extends React.Component {
  constructor(props) {
    super(props);
  }

  render = () => {
    const data = [
      {name: Moment().subtract(30, 'days').format('Do MMM'), kpi: 0, actual: 0, amt: 2400},
      {name: Moment().subtract(23, 'days').format('Do MMM'), kpi: 5, actual: 7, amt: 2210},
      {name: Moment().subtract(17, 'days').format('Do MMM'), kpi: 3, actual: 6, amt: 2290},
      {name: Moment().subtract(14, 'days').format('Do MMM'), kpi: 3, actual: 3, amt: 2000},
      {name: Moment().subtract(13, 'days').format('Do MMM'), kpi: 1, actual: 1, amt: 2181},
      {name: Moment().subtract(11, 'days').format('Do MMM'), kpi: 7, actual: 2, amt: 2500},
      {name: Moment().subtract(8, 'days').format('Do MMM'), kpi: 2, actual: 3, amt: 2100},
    ];
   
    return (
      <div className={styles.trackerGraph + ' pure-g'}>
        <div className="pure-u-1-1 pure-u-md-1-1">
          <div className={styles.yAxisTitle}>
            days
          </div>
          <LineChart width={750} height={400} data={data}
          margin={{top: 20, right: 30, left: 20, bottom: 10}}>
            <XAxis dataKey="name" height={60} tick={<CustomizedAxisTick/>}/>
            <YAxis/>
            <CartesianGrid strokeDasharray="3 3"/>
            <Tooltip/>
            <Legend />
            <Line type="monotone" dataKey="actual" stroke="#8884d8" label={<CustomizedLabel />}/>
            <Line type="monotone" dataKey="kpi" stroke="#82ca9d" />
          </LineChart>
          </div>
      </div>
    );
  }
}

   

export default TrackerGraph;
