```js
const data = [
  {
    label: 'Oct',
    registeredIn45Days: 0,
    totalRegistered: 0,
    totalEstimate: 17000
  },
  {
    label: 'Nov',
    registeredIn45Days: 0,
    totalRegistered: 0,
    totalEstimate: 17000
  },
  {
    label: 'Dec,20',
    registeredIn45Days: 0,
    totalRegistered: 0,
    totalEstimate: 17000
  },
  {
    label: 'Jan',
    registeredIn45Days: 0,
    totalRegistered: 0,
    totalEstimate: 17000
  },
  {
    label: 'Feb',
    registeredIn45Days: 500,
    totalRegistered: 1000,
    totalEstimate: 17000
  },
  {
    label: 'Mar',
    registeredIn45Days: 1000,
    totalRegistered: 2000,
    totalEstimate: 17000
  },
  {
    label: 'Apr',
    registeredIn45Days: 1500,
    totalRegistered: 3000,
    totalEstimate: 17000
  },
  {
    label: 'May',
    registeredIn45Days: 4000,
    totalRegistered: 6000,
    totalEstimate: 17000
  },
  {
    label: 'Jun',
    registeredIn45Days: 4500,
    totalRegistered: 6500,
    totalEstimate: 17000
  },
  {
    label: 'Jul',
    registeredIn45Days: 8000,
    totalRegistered: 9000,
    totalEstimate: 17000
  },
  {
    label: 'Aug',
    registeredIn45Days: 6000,
    totalRegistered: 7000,
    totalEstimate: 17000
  },
  {
    label: 'Sept',
    registeredIn45Days: 7500,
    totalRegistered: 8000,
    totalEstimate: 17000
  }
]

const { fountainBlue, swansDown, silverSand } = require('../colors')

function LegendDot(props) {
  return (
    <svg width={10} height={10} viewBox="0 0 10 10" fill="none" {...props}>
      <rect width={10} height={10} rx={5} fill={props.color} />
    </svg>
  )
}

class RegRatesLineChartComponent extends React.Component {
  constructor(props) {
    super(props)
    this.setLatestData = this.setLatestData.bind(this)
    this.customizedLegend = this.customizedLegend.bind(this)
    this.customizedTooltip = this.customizedTooltip.bind(this)
    this.mouseMoveHandler = this.mouseMoveHandler.bind(this)
    this.mouseLeaveHandler = this.mouseLeaveHandler.bind(this)
    this.setLatestData()
  }
  setLatestData() {
    const { data } = this.props
    const latestData = (data && data[data.length - 1]) || {}
    this.state = {
      activeLabel: (latestData && latestData.label) || '',
      activeRegisteredIn45Day: {
        value: (latestData && latestData.registeredIn45Days) || 0,
        stroke: fountainBlue
      },
      activeTotalRegistered: {
        value: (latestData && latestData.totalRegistered) || 0,
        stroke: swansDown
      },
      activeTotalEstimate: {
        value: (latestData && latestData.totalEstimate) || 0,
        stroke: silverSand
      }
    }
  }
  customizedLegend(props) {
    const {
      activeLabel,
      activeRegisteredIn45Day,
      activeTotalRegistered,
      activeTotalEstimate
    } = this.state
    return (
      <div>
        <h5>{activeLabel}</h5>
        <div>
          <div>
            <div>
              <LegendDot color={activeTotalEstimate.stroke} />
            </div>
            <div>
              Estimated no. of births
              <br />
              {activeTotalEstimate.value}
            </div>
          </div>
          <div>
            <div>
              <LegendDot color={activeTotalRegistered.stroke} />
            </div>
            <div>
              Total registered
              <br />
              {activeTotalRegistered.value}
            </div>
          </div>
          <div>
            <div>
              <LegendDot color={activeRegisteredIn45Day.stroke} />
            </div>
            <div>
              Registered in 45 days
              <br />
              {activeRegisteredIn45Day.value}
            </div>
          </div>
        </div>
      </div>
    )
  }
  customizedTooltip(dataPoint) {
    const wrapperPayload = dataPoint.payload[0]
    return (
      (wrapperPayload && (
        <div>
          {(
            wrapperPayload &&
            wrapperPayload.payload &&
            (wrapperPayload.payload.registeredIn45Days /
              wrapperPayload.payload.totalEstimate) *
              100
          ).toFixed(2)}
          %
        </div>
      )) || <></>
    )
  }
  mouseMoveHandler(data) {
    if (data && data.activePayload) {
      this.setState({
        activeLabel: data.activeLabel || '',
        activeRegisteredIn45Day: {
          value: data.activePayload[0].value || 0,
          stroke: fountainBlue
        },
        activeTotalRegistered: {
          value: data.activePayload[1].value || 0,
          stroke: swansDown
        },
        activeTotalEstimate: {
          value: data.activePayload[2].value || 0,
          stroke: silverSand
        }
      })
    }
  }
  mouseLeaveHandler() {
    this.setLatestData()
  }
  render() {
    const { data } = this.props

    return (
      <TriLineChart
        data={data}
        dataKeys={['totalEstimate', 'totalRegistered', 'registeredIn45Days']}
        mouseMoveHandler={this.mouseMoveHandler}
        mouseLeaveHandler={this.mouseLeaveHandler}
        tooltipContent={this.customizedTooltip}
        legendContent={this.customizedLegend}
      />
    )
  }
}

;<RegRatesLineChartComponent data={data} />
```
