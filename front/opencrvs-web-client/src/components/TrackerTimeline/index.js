

import React from 'react';
import styles from './styles.css';
import {Timeline, TimelineEvent} from 'react-event-timeline';
import ReactSpeedometer from 'react-d3-speedometer';
import StaffCard from 'components/StaffCard';
import head from 'lodash/head';
import get from 'lodash/get';
import map from 'lodash/map';

class TrackerTimeline extends React.Component {
  constructor(props) {
    super(props);
  }

  render = () => {
    const {caseNotes} = this.props;
   
    return (
      <div className={styles.trackerTimeline + ' pure-g'}>
        <div className={styles.timeline + ' pure-u-1-1 pure-u-md-1-1'}>
          <Timeline>

          {
            map(caseNotes, (caseEvent, index ) => (
            <TimelineEvent
              key={caseEvent.id}
              title={caseEvent.title}
              createdAt={caseEvent.createdAt}
              icon={<i className={ 'material-icons ' + caseEvent.icon + ' ' + styles.timelineIcon}>{caseEvent.iconAlt}</i>}
            >
              <div className="pure-g">
                <div className="pure-u-1-3">
                  {caseEvent.note}
                </div>
                <div className="pure-u-1-3">
                  <div className="pure-g">
                    {caseEvent.caseManager && <StaffCard cardType="M" managerData={caseEvent.caseManager}/> }
                  </div>
                </div>
                <div className="pure-u-1-3">
                <div className={styles.speedometer}>
                  <div className={styles.title}>
                    Process performance:
                  </div>
                  <ReactSpeedometer
                    maxValue={get(head(caseEvent.kpiData), 'maxValue')}
                    minValue={get(head(caseEvent.kpiData), 'minValue')}
                    value={get(head(caseEvent.kpiData), 'value')}
                    needleColor="black"
                    startColor="green"
                    segments={5}
                    width="200"
                    height="150"
                    endColor="red"
                    />
                  </div>
                </div>
              </div>
              
            </TimelineEvent>


          ))}
            
          </Timeline>
        </div>
      </div>
    );
  }
}

   

export default TrackerTimeline;
