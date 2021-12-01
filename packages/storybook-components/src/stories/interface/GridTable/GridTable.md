```js
function reviewClicked() {
  alert('review clicked')
}

const list = [
  {
    date_of_application: '3 days ago',
    tracking_id: '1234567',
    date_of_event: '2017-12-10',
    event: 'birth',
    actions: [
      {
        label: 'review',
        handler: () => reviewClicked
      }
    ]
  },
  {
    date_of_application: '5 days ago',
    tracking_id: '1234567',
    date_of_event: '2017-11-10',
    event: 'death',
    actions: [
      {
        label: 'review',
        handler: () => reviewClicked
      }
    ]
  },
  {
    date_of_application: '23 days ago',
    tracking_id: '1234567',
    date_of_event: '2017-11-10',
    event: 'marriage',
    actions: [
      {
        label: 'review',
        handler: () => reviewClicked
      }
    ]
  },
  {
    date_of_application: '12 days ago',
    tracking_id: '1234567',
    date_of_event: '2017-09-10',
    event: 'birth',
    actions: [
      {
        label: 'review',
        handler: () => reviewClicked
      }
    ]
  },
  {
    date_of_application: '3 days ago',
    tracking_id: '1234567',
    date_of_event: '2017-10-10',
    event: 'birth',
    actions: [
      {
        label: 'review',
        handler: () => reviewClicked
      }
    ]
  },
  {
    date_of_application: '18 days ago',
    tracking_id: '1234567',
    date_of_event: '2017-10-10',
    event: 'marriage',
    actions: [
      {
        label: 'review',
        handler: () => reviewClicked
      }
    ]
  },
  {
    date_of_application: '23 days ago',
    tracking_id: '1234567',
    date_of_event: '2017-10-09',
    event: 'birth',
    actions: [
      {
        label: 'review',
        handler: () => reviewClicked
      }
    ]
  },
  {
    date_of_application: '7 days ago',
    tracking_id: '1234567',
    date_of_event: '2017-10-08',
    event: 'birth',
    actions: [
      {
        label: 'review',
        handler: () => reviewClicked
      }
    ]
  },
  {
    date_of_application: '9 days ago',
    tracking_id: '1234567',
    date_of_event: '2017-10-09',
    event: 'death',
    actions: [
      {
        label: 'review',
        handler: () => reviewClicked
      }
    ]
  },
  {
    date_of_application: '11 days ago',
    tracking_id: '1234567',
    date_of_event: '2017-10-09',
    event: 'marriage',
    actions: [
      {
        label: 'review',
        handler: () => reviewClicked
      }
    ]
  },
  {
    date_of_application: '3 days ago',
    tracking_id: '1234567',
    date_of_event: '2017-10-06',
    event: 'birth',
    actions: [
      {
        label: 'review',
        handler: () => reviewClicked
      }
    ]
  },
  {
    date_of_application: '5 days ago',
    tracking_id: '1234567',
    date_of_event: '2017-10-09',
    event: 'birth',
    actions: [
      {
        label: 'review',
        handler: () => reviewClicked
      }
    ]
  },
  {
    date_of_application: '3 days ago',
    tracking_id: '1234567',
    date_of_event: '2017-10-09',
    event: 'death',
    actions: [
      {
        label: 'review',
        handler: () => reviewClicked
      }
    ]
  },
  {
    date_of_application: '7 days ago',
    tracking_id: '1234567',
    date_of_event: '2017-10-09',
    event: 'marriage',
    actions: [
      {
        label: 'review',
        handler: () => reviewClicked
      }
    ]
  },
  {
    date_of_application: '9 days ago',
    tracking_id: '1234567',
    createdAt: '2017-10-09',
    event: 'birth',
    actions: [
      {
        label: 'review',
        handler: () => reviewClicked
      }
    ]
  }
]
const ColumnContentAlignment = require('./GridTable')
class GridTableExample extends React.Component {
  render() {
    return (
      <GridTable
        content={list}
        columns={[
          {
            label: 'Type',
            width: 14,
            key: 'event'
          },
          {
            label: 'Tracking ID',
            width: 20,
            key: 'tracking_id'
          },
          {
            label: 'Date of Application',
            width: 23,
            key: 'date_of_application'
          },
          {
            label: 'Date of event',
            width: 23,
            key: 'date_of_event'
          },
          {
            label: 'Action',
            width: 20,
            key: 'actions',
            isActionColumn: true,
            alignment: ColumnContentAlignment.CENTER
          }
        ]}
        noResultText="No result to display"
        expandable={false}
        itemPerPage={10}
        totalItems={(list && list.length) || 0}
        initialPage={1}
      />
    )
  }
}
;<GridTableExample />
```
