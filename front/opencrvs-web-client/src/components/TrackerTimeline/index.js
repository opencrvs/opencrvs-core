

import React from 'react';
import styles from './styles.css';
import {Timeline, TimelineEvent} from 'react-event-timeline';
import { BarChart, Bar } from 'recharts';
import { map } from 'lodash';
import { calculateRagStatusOnBar } from 'utils/manager-utils';
import { head, get } from 'lodash';


class TrackerTimeline extends React.Component {
  constructor(props) {
    super(props);
  }

  render = () => {
    const {caseNotes, caseData} = this.props;
   
    return (
      <div className={styles.trackerTimeline + ' pure-g'}>
        <div className={styles.timeline + ' pure-u-1-1 pure-u-md-1-1'}>
          <div className={styles.timelinePerfTitle}>
            <p className={styles.title}>Performance</p>
          </div>
          <Timeline>

          {
            map(caseNotes, (caseEvent, index ) => (
            <TimelineEvent
              key={caseEvent.id}
              title={caseEvent.title}
              createdAt={caseEvent.createdAt}
              icon={<i className={ 'material-icons ' + caseEvent.icon + ' ' + styles.timelineIcon}>{caseEvent.iconAlt}</i>}
            >{caseEvent.note}
            <BarChart width={40} height={150} data={caseEvent.kpiData} className={styles.kpiChart}>
              <Bar dataKey="pv" stackId="a" fill="#2d3e50" />
              <Bar dataKey="uv" stackId="a" fill={calculateRagStatusOnBar(get(head(caseEvent.kpiData), 'uv'), get(head(caseEvent.kpiData), 'pv'))} />
            </BarChart>
            </TimelineEvent>


          ))}
            
          </Timeline>
        </div>
      </div>
    );
  }
}

   

export default TrackerTimeline;
