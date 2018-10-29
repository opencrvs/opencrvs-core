```js
const list = [
  {
    name: {
      label: 'Name',
      value: 'Atiq'
    },
    dob: {
      label: 'D.o.B',
      value: '10.10.2018'
    },
    doa: {
      label: 'Date of application',
      value: '10.10.2018'
    },
    trackingID: {
      label: 'Tracking ID',
      value: '1234567'
    },
    status: [
      {
        label: 'BIRTH',
        color: 'gray'
      },
      {
        label: 'APPLICATION',
        color: 'orange'
      }
    ]
  },
  {
    name: {
      label: 'Name',
      value: 'Mehedi'
    },
    dod: {
      label: 'D.o.D',
      value: '10.10.2018'
    },
    doa: {
      label: 'Date of application',
      value: '10.10.2018'
    },
    trackingID: {
      label: 'Tracking ID',
      value: '1234567'
    },
    status: [
      {
        label: 'DEATH',
        color: 'gray'
      },
      {
        label: 'APPLICATION',
        color: 'orange'
      }
    ]
  },
  {
    name: {
      label: 'Name',
      value: 'Laila'
    },
    dod: {
      label: 'D.o.M',
      value: '10.10.2018'
    },
    doa: {
      label: 'Date of application',
      value: '10.10.2018'
    },
    trackingID: {
      label: 'Tracking ID',
      value: '1234567'
    },
    status: [
      {
        label: 'MARRIAGE',
        color: 'gray'
      },
      {
        label: 'REGISTERED',
        color: 'green'
      }
    ]
  }
]
class ResultListExample extends React.Component {
  constructor() {
    super()
  }
  render() {
    return <ResultList list={list} />
  }
}
;<ResultListExample />
```
