import {
  CustomResult,
  ISortAndFilter
} from '@opencrvs/components/lib/interface'

export const list: CustomResult[] = [
  {
    info: [
      {
        label: 'Name',
        value: 'John Doe 1'
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
    ],
    sortFilterFields: {
      createdAt: '2017-12-10T18:00:00.000Z',
      declaration_status: 'application',
      event: 'birth',
      location: 'gazipur'
    }
  },
  {
    info: [
      {
        label: 'Name',
        value: 'Jane Doe 2'
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
    ],
    sortFilterFields: {
      createdAt: '2017-11-10T18:00:00.000Z',
      declaration_status: 'application',
      event: 'death',
      location: 'demra'
    }
  },
  {
    info: [
      {
        label: 'Name',
        value: 'Jackson Strong 3'
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
    ],
    sortFilterFields: {
      createdAt: '2017-10-10T18:00:00.000Z',
      declaration_status: 'registered',
      event: 'marriage',
      location: 'dohar'
    }
  },
  {
    info: [
      {
        label: 'Name 4',
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
    ],
    sortFilterFields: {
      createdAt: '2017-09-10T18:00:00.000Z',
      declaration_status: 'marriage',
      event: 'birth',
      location: 'badda'
    }
  },
  {
    info: [
      {
        label: 'Name',
        value: 'John Doe 5'
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
    ],
    sortFilterFields: {
      createdAt: '2017-10-10T18:00:00.000Z',
      declaration_status: 'application',
      event: 'birth',
      location: 'badda'
    }
  },
  {
    info: [
      {
        label: 'Name',
        value: 'Jane Doe 5'
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
    ],
    sortFilterFields: {
      createdAt: '2017-10-10T18:00:00.000Z',
      declaration_status: 'application',
      event: 'death',
      location: 'savar'
    }
  },
  {
    info: [
      {
        label: 'Name',
        value: 'Jackson Strong 6'
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
    ],
    sortFilterFields: {
      createdAt: '2017-10-10T18:00:00.000Z',
      declaration_status: 'registered',
      event: 'marriage',
      location: 'dohar'
    }
  },
  {
    info: [
      {
        label: 'Name',
        value: 'Moon Walker 7'
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
    ],
    sortFilterFields: {
      createdAt: '2017-10-09T18:00:00.000Z',
      declaration_status: 'collected',
      event: 'birth',
      location: 'dhamrai'
    }
  },
  {
    info: [
      {
        label: 'Name',
        value: 'John Doe 8'
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
    ],
    sortFilterFields: {
      createdAt: '2017-10-08T18:00:00.000Z',
      declaration_status: 'application',
      event: 'birth',
      location: 'dhamrai'
    }
  },
  {
    info: [
      {
        label: 'Name',
        value: 'Jane Doe 9'
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
    ],
    sortFilterFields: {
      createdAt: '2017-10-09T18:00:00.000Z',
      declaration_status: 'application',
      event: 'death',
      location: 'badda'
    }
  },
  {
    info: [
      {
        label: 'Name',
        value: 'Jackson Strong 10'
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
    ],
    sortFilterFields: {
      createdAt: '2017-10-09T18:00:00.000Z',
      declaration_status: 'registered',
      event: 'marriage',
      location: 'dhamrai'
    }
  },
  {
    info: [
      {
        label: 'Name',
        value: 'Moon Walker 11'
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
    ],
    sortFilterFields: {
      createdAt: '2017-10-06T18:00:00.000Z',
      declaration_status: 'collected',
      event: 'birth',
      location: 'savar'
    }
  },
  {
    info: [
      {
        label: 'Name',
        value: 'John Doe 12'
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
    ],
    sortFilterFields: {
      createdAt: '2017-10-09T18:00:00.000Z',
      declaration_status: 'application',
      event: 'birth',
      location: 'dhamrai'
    }
  },
  {
    info: [
      {
        label: 'Name',
        value: 'Jane Doe 13'
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
    ],
    sortFilterFields: {
      createdAt: '2017-10-09T18:00:00.000Z',
      declaration_status: 'application',
      event: 'death',
      location: 'dhamrai'
    }
  },
  {
    info: [
      {
        label: 'Name',
        value: 'Jackson Strong 14'
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
    ],
    sortFilterFields: {
      createdAt: '2017-10-09T18:00:00.000Z',
      declaration_status: 'registered',
      event: 'marriage',
      location: 'dhamrai'
    }
  },
  {
    info: [
      {
        label: 'Name',
        value: 'Moon Walker 15'
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
    ],
    sortFilterFields: {
      createdAt: '2017-10-09T18:00:00.000Z',
      declaration_status: 'collected',
      event: 'birth',
      location: 'badda'
    }
  }
]
export const sortBy: ISortAndFilter = {
  input: {
    label: 'Sort By'
  },
  selects: {
    name: 'Sort',
    options: [
      {
        name: 'createdAt',
        value: 'asc',
        options: [
          { value: 'asc', label: 'Oldest to newest' },
          { value: 'desc', label: 'Newest to oldest' }
        ]
      }
    ]
  }
}

export const filterBy: ISortAndFilter = {
  input: {
    label: 'Filter By'
  },
  selects: {
    name: 'Filter',
    options: [
      {
        name: 'event',
        value: '',
        options: [
          { value: '', label: 'All events' },
          { value: 'birth', label: 'Birth' },
          { value: 'death', label: 'Death' },
          { value: 'marriage', label: 'Marriage' }
        ]
      },
      {
        name: 'declaration_status',
        value: '',
        options: [
          { value: '', label: 'All statuses' },
          { value: 'application', label: 'Application' },
          { value: 'collected', label: 'Collected' },
          { value: 'registered', label: 'Registered' }
        ]
      },
      {
        name: 'location',
        value: '',
        options: [
          { value: '', label: 'All regions' },
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
