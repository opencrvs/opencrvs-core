

import React from 'react';
import styles from './styles.css';
import { connect } from 'react-redux';
import {BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell} from 'recharts';
import { calculateRagStatusOnBar } from 'utils/manager-utils';
import { map } from 'lodash';

class OverviewPerformance extends React.Component {
  constructor(props) {
    super(props);
  }

  togglePerf = (event) => {
    this.props.togglePerformance();
  }

  render = () => {
    const { perfOpened, performanceData } = this.props;
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
          <div className={
        perfOpened == 0
        ? styles.upArrow + ' pure-g'
        : styles.downArrow + ' pure-g'
      }>
          </div>
          
        </div>
        <div className="pure-u-1">
          {performanceData && <ResponsiveContainer minHeight={200}>
              <BarChart layout="horizontal" data={performanceData}
                margin={{top: 0, right: 90, left: 60, bottom: 5}}>
                <XAxis dataKey="name"/>
                <YAxis/>
                <CartesianGrid strokeDasharray="3 3"/>
                <Tooltip/>
                <Bar dataKey="achieved" stackId="a"  >
                    {
                      performanceData.map((entry, index) => (
                        <Cell fill={calculateRagStatusOnBar(performanceData[index].achieved, 
                        performanceData[index].kpi)}/>
                      ))
                    }
                </Bar>
                <Bar dataKey="kpi" stackId="a" fill="#2d3e50" />
              </BarChart>
            </ResponsiveContainer>
            }
        </div>
      </div>
    );
  }
}

   

const mapStateToProps = ({ managerReducer }) => {
  
  const { perfOpened, performanceData } = managerReducer;

  return {
    perfOpened,
    performanceData,
  };
};

export default connect(mapStateToProps, null)(OverviewPerformance);
