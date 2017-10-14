

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

  
  isOnTime = ( val, max ) => {
    const result = (val * 100) / max;
    const onTime = result > 50 ? 'Late' : 'On Time';
    return onTime;
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
                  { caseEvent.id == 4 && 
                    <div className={styles.onTime}><strong>On Time</strong></div>
                  }
                  {caseEvent.note}
                </div>
                { caseEvent.id != 1 && caseEvent.id != 4 && caseEvent.id != 5 && 
                  <div className="pure-u-1-3">
                    <div className="pure-g">
                      {caseEvent.caseManager && <StaffCard cardType="P" managerData={caseEvent.caseManager}/> }
                    </div>
                  </div>
                  
                }
                  
                { caseEvent.id != 1 && caseEvent.id != 4 && caseEvent.id != 5 && 
                  <div className="pure-u-1-3">
                    <div className={styles.speedometer}>
                      <p>Days</p>
                      <div className={styles.circle}></div>
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
                    <div className={styles.perfTarget}>Target:&nbsp;   
                      <strong>
                        {get(head(caseEvent.kpiData), 'maxValue')}
                      </strong> 
                      &nbsp;&nbsp;Actual:&nbsp;
                      <strong>
                        {get(head(caseEvent.kpiData), 'value')}
                      </strong>
                    </div>
                  </div>
                }
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
