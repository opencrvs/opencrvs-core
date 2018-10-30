```js
const list = [
  {
    name: {
      label: 'Name',
      value: 'John Doe'
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
        type: 'gray'
      },
      {
        label: 'APPLICATION',
        type: 'orange'
      }
    ]
  },
  {
    name: {
      label: 'Name',
      value: 'Jane Doe'
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
        type: 'gray'
      },
      {
        label: 'APPLICATION',
        type: 'orange'
      }
    ]
  },
  {
    name: {
      label: 'Name',
      value: 'Jackson Strong'
    },
    dod: {
      label: 'D.o.M',
      value: '10.10.2018'
    },
    doa: {
      label: 'Date of registration',
      value: '10.10.2018'
    },
    regNo: {
      label: 'Registration number',
      value: '1234567'
    },
    status: [
      {
        label: 'MARRIAGE',
        type: 'gray'
      },
      {
        label: 'REGISTERED',
        type: 'green'
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
