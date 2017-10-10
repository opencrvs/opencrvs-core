

import React from 'react';
import styles from './styles.css';
import { connect } from 'react-redux';
import {BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell} from 'recharts';
import { calculateRagStatusOnBar } from 'utils/manager-utils';

const CustomizedAxisTick = React.createClass({
  render() {
    const {x, y, payload} = this.props;
		
    return (
      <g transform={`translate(${x},${y})`}>
        <text x={0} y={0} dy={16} textAnchor="end" fill="#666" className={styles.labels}>{payload.value}</text>
      </g>
    );
  },
});


class OverviewPerformance extends React.Component {
  constructor(props) {
    super(props);
  }

  render = () => {
    const { performanceData } = this.props;
    return (

      
      <div className={styles.graphHolder + ' pure-g'}>
        <div className="pure-u-1">
          <div className={styles.title}>
            PERFORMANCE
          </div>
        </div>
        <div className="pure-u-1">
          {performanceData && <BarChart width={400} height={200} layout="horizontal" data={performanceData}
                margin={{top: 0, right: 0, left: 5, bottom: 50}}>
                <XAxis interval={0} dataKey="name" tick={<CustomizedAxisTick/>}/>
                <YAxis/>
                <CartesianGrid strokeDasharray="3 3"/>
                <Tooltip/>
                <Bar dataKey="achieved" stackId="a"  >
                    {
                      performanceData.map((entry, index) => (
                        <Cell key={index} fill={calculateRagStatusOnBar(performanceData[index].achieved, 
                        performanceData[index].kpi)}/>
                      ))
                    }
                </Bar>
                <Bar dataKey="kpi" stackId="a" fill="#2d3e50" />
              </BarChart>
            }
        </div>
      </div>
    );
  }
}

   

const mapStateToProps = ({ managerReducer }) => {
  
  const { performanceData } = managerReducer;

  return {
    performanceData,
  };
};

export default connect(mapStateToProps, null)(OverviewPerformance);
