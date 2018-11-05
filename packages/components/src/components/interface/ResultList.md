```js
const list = [
  {
    info: [
      {
        label: 'Name',
        value: 'John Doe'
      },
      {
        label: 'D.o.B',
        value: '10.10.2018'
      },
      {
        label: 'Date of application',
        value: '10.10.2018'
      },
      {
        label: 'Tracking ID',
        value: '1234567'
      }
    ],
    status: [
      {
        label: 'Birth',
        type: 'gray'
      },
      {
        label: 'Application',
        type: 'orange'
      }
    ]
  },
  {
    info: [
      {
        label: 'Name',
        value: 'Jane Doe'
      },
      {
        label: 'D.o.D',
        value: '10.10.2018'
      },
      {
        label: 'Date of application',
        value: '10.10.2018'
      },
      {
        label: 'Tracking ID',
        value: '1234567'
      }
    ],
    status: [
      {
        label: 'Death',
        type: 'gray'
      },
      {
        label: 'Application',
        type: 'orange'
      }
    ]
  },
  {
    info: [
      {
        label: 'Name',
        value: 'Jackson Strong'
      },
      {
        label: 'D.o.M',
        value: '10.10.2018'
      },
      {
        label: 'Date of registration',
        value: '10.10.2018'
      },
      {
        label: 'Registration number',
        value: '1234567'
      }
    ],
    status: [
      {
        label: 'Marriage',
        type: 'gray'
      },
      {
        label: 'Registered',
        type: 'green'
      }
    ]
  },
  {
    info: [
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
    ],
    status: [
      {
        label: 'Birth',
        type: 'gray'
      },
      {
        label: 'Collected',
        type: 'collected'
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
