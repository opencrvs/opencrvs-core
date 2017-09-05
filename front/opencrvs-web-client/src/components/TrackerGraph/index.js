

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
import CaseNotes from 'components/CaseNotes';


class TrackerGraph extends React.Component {
  constructor(props) {
    super(props);
  }

  render = () => {
    const {caseNotes, caseGraphData} = this.props;
   
    return (
      <div className={styles.trackerGraph + ' pure-g'}>
        <div className="pure-u-1-1 pure-u-md-1-1">
          <div className={styles.yAxisTitle}>
            days
          </div>
          <LineChart width={750} height={400} data={caseGraphData} className={styles.centerChart}
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
        <CaseNotes caseNotes={caseNotes}/>
      </div>
    );
  }
}

   

export default TrackerGraph;
