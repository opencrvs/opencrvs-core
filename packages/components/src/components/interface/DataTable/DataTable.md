```js
const list = [
  {
    name: 'John Doe 1',
    dob: 'dob',
    date_of_application: '10.10.2018',
    tracking_id: '1234567',
    createdAt: '2017-12-10T18:00:00.000Z',
    declaration_status: 'application',
    event: 'birth',
    location: 'gazipur'
  },
  {
    name: 'John Doe 2',
    dob: 'dob',
    date_of_application: '10.10.2018',
    tracking_id: '1234567',
    createdAt: '2017-11-10T18:00:00.000Z',
    declaration_status: 'application',
    event: 'death',
    location: 'demra'
  },
  {
    name: 'John Doe 2',
    dob: 'dob',
    date_of_application: '10.10.2018',
    tracking_id: '1234567',
    createdAt: '2017-11-10T18:00:00.000Z',
    createdAt: '2017-10-10T18:00:00.000Z',
    declaration_status: 'registered',
    event: 'marriage',
    location: 'dohar'
  },
  {
    name: 'John Doe 3',
    dob: 'dob',
    date_of_application: '10.10.2018',
    tracking_id: '1234567',
    createdAt: '2017-09-10T18:00:00.000Z',
    declaration_status: 'collected',
    event: 'birth',
    location: 'badda'
  },
  {
    name: 'John Doe 4',
    dob: 'dob',
    date_of_application: '10.10.2018',
    tracking_id: '1234567',
    createdAt: '2017-10-10T18:00:00.000Z',
    declaration_status: 'application',
    event: 'birth',
    location: 'badda'
  },
  {
    name: 'John Doe 5',
    dob: 'dob',
    date_of_application: '10.10.2018',
    tracking_id: '1234567',
    createdAt: '2017-10-10T18:00:00.000Z',
    declaration_status: 'registered',
    event: 'marriage',
    location: 'dohar'
  },
  {
    name: 'John Doe 6',
    dob: 'dob',
    date_of_application: '10.10.2018',
    tracking_id: '1234567',
    createdAt: '2017-10-09T18:00:00.000Z',
    declaration_status: 'collected',
    event: 'birth',
    location: 'dhamrai'
  },
  {
    name: 'John Doe 7',
    dob: 'dob',
    date_of_application: '10.10.2018',
    tracking_id: '1234567',
    createdAt: '2017-10-08T18:00:00.000Z',
    declaration_status: 'application',
    event: 'birth',
    location: 'dhamrai'
  },
  {
    name: 'John Doe 8',
    dob: 'dob',
    date_of_application: '10.10.2018',
    tracking_id: '1234567',
    createdAt: '2017-10-09T18:00:00.000Z',
    declaration_status: 'application',
    event: 'death',
    location: 'badda'
  },
  {
    name: 'John Doe 9',
    dob: 'dob',
    date_of_application: '10.10.2018',
    tracking_id: '1234567',
    createdAt: '2017-10-09T18:00:00.000Z',
    declaration_status: 'registered',
    event: 'marriage',
    location: 'dhamrai'
  },
  {
    name: 'John Doe 10',
    dob: 'dob',
    date_of_application: '10.10.2018',
    tracking_id: '1234567',
    createdAt: '2017-10-06T18:00:00.000Z',
    declaration_status: 'collected',
    event: 'birth',
    location: 'savar'
  },
  {
    name: 'John Doe 11',
    dob: 'dob',
    date_of_application: '10.10.2018',
    tracking_id: '1234567',
    createdAt: '2017-10-09T18:00:00.000Z',
    declaration_status: 'application',
    event: 'birth',
    location: 'dhamrai'
  },
  {
    name: 'John Doe 12',
    dob: 'dob',
    date_of_application: '10.10.2018',
    tracking_id: '1234567',
    createdAt: '2017-10-09T18:00:00.000Z',
    declaration_status: 'application',
    event: 'death',
    location: 'dhamrai'
  },
  {
    name: 'John Doe 13',
    dob: 'dob',
    date_of_application: '10.10.2018',
    tracking_id: '1234567',
    createdAt: '2017-10-09T18:00:00.000Z',
    declaration_status: 'registered',
    event: 'marriage',
    location: 'dhamrai'
  },
  {
    name: 'John Doe 14',
    dob: 'dob',
    date_of_application: '10.10.2018',
    tracking_id: '1234567',
    createdAt: '2017-10-09T18:00:00.000Z',
    declaration_status: 'collected',
    event: 'birth',
    location: 'badda'
  }
]
const sortBy = {
  input: {
    label: 'Sort By'
  },
  selects: {
    options: [
      {
        name: 'createdAt',
        options: [
          { value: 'asc', label: 'Oldest to newest' },
          { value: 'desc', label: 'Newest to oldest' }
        ]
      }
    ]
  }
}

const filterBy = {
  input: {
    label: 'Filter By'
  },
  selects: {
    options: [
      {
        name: 'event',
        options: [
          { value: 'birth', label: 'Birth' },
          { value: 'death', label: 'Death' },
          { value: 'marriage', label: 'Marriage' }
        ]
      },
      {
        name: 'declaration_status',
        options: [
          { value: 'application', label: 'Application' },
          { value: 'collected', label: 'Collected' },
          { value: 'registered', label: 'Registered' }
        ]
      },
      {
        name: 'location',
        options: [
          { value: 'gazipur', label: 'Gazipur Union' },
          { value: 'badda', label: 'Badda Union' },
          { value: 'dhamrai', label: 'Dhamrai Union' },
          { value: 'savar', label: 'Savar Union' },
          { value: 'dohar', label: 'Dohar Union' }
        ]
      }
    ]
  }
}

const {
  StatusGreen,
  StatusOrange,
  StatusGray,
  StatusCollected
} = require('../../icons')

const ListItem = require('../').ListItem

const getDeclarationStatusIcon = status => {
  switch (status) {
    case 'application':
      return <StatusOrange />
    case 'registered':
      return <StatusGreen />
    case 'collected':
      return <StatusCollected />
    default:
      return <StatusOrange />
  }
}

class DataTableExample extends React.Component {
  renderCell(item, key) {
    const info = []
    const status = []
    const actions = []

    info.push({ label: 'Name', value: item.name })
    info.push({ label: 'D.o.B', value: item.dob })
    info.push({ label: 'Date of application', value: item.date_of_application })
    info.push({ label: 'Tracking ID', value: item.tracking_id })

    actions.push({ label: 'review', handler: () => alert('Hello') })
    status.push({ icon: <StatusGray />, label: item.event })
    status.push({
      icon: getDeclarationStatusIcon(item.declaration_status),
      label: item.declaration_status
    })
    return (
      <ListItem
        actions={actions}
        infoItems={info}
        statusItems={status}
        key={key}
        expandedCellRenderer={() => <div>Dummy expanded view</div>}
      />
    )
  }

  render() {
    return (
      <DataTable
        data={list}
        sortBy={sortBy}
        filterBy={filterBy}
        cellRenderer={this.renderCell}
        resultLabel="Results"
        noResultText="No result to display"
      />
    )
  }
}
;<DataTableExample />
```
