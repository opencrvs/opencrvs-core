```js
const {
  StatusGreen,
  StatusOrange,
  StatusGray,
  StatusCollected
} = require('../icons')

const infoItems = [
  {
    label: 'Name',
    value: 'Moon Walker'
  },
  {
    label: 'D.o.B',
    value: '10.10.2018'
  },
  {
    label: 'Date of collection',
    value: '10.10.2018'
  },
  {
    label: 'Registration number',
    value: '1234567'
  }
]

const statusItems = [
  {
    icon: <StatusGray />,
    label: 'Birth'
  },
  {
    icon: <StatusOrange />,
    label: 'Application'
  }
]

const style = {
  width: '100%',
  height: '100px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}

class ListItemExample extends React.Component {
  constructor() {
    super()
  }

  renderExpandedCell() {
    return (
      <div style={style}>
        <div>a expanded view</div>
      </div>
    )
  }

  render() {
    return (
      <ListItem
        actions={[{ label: 'review', handler: () => alert('Hello') }]}
        infoItems={infoItems}
        statusItems={statusItems}
        key={1}
        expandedCellRenderer={this.renderExpandedCell}
      />
    )
  }
}
;<ListItemExample />
```
