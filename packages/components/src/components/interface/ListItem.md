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

class ListItemExample extends React.Component {
  constructor() {
    super()
  }
  render() {
    return (
      <ListItem
        infoItems={infoItems}
        statusItems={statusItems}
        key={1}
        expandedCellRenderer={() => <div>Dummy expanded view</div>}
      />
    )
  }
}
;<ListItemExample />
```
