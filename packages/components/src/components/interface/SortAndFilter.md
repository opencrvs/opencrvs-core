```js
const sortBy = {
  input: {
    label: 'Sort By'
  },
  selects: {
    values: { Sort1: '' },
    options: [
      {
        name: 'Sort1',
        options: [
          { value: 'chocolate', label: 'Chocolate' },
          { value: 'strawberry', label: 'Strawberry' },
          { value: 'vanilla', label: 'Vanilla' }
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
    values: { Filter1: '', Filter2: '', Filter3: '' },
    options: [
      {
        name: 'Filter1',
        options: [
          { value: 'chocolate', label: 'Chocolate' },
          { value: 'strawberry', label: 'Strawberry' },
          { value: 'vanilla', label: 'Vanilla' }
        ]
      },
      {
        name: 'Filter2',
        options: [
          { value: 'chocolate', label: 'Chocolate' },
          { value: 'strawberry', label: 'Strawberry' },
          { value: 'vanilla', label: 'Vanilla' }
        ]
      },
      {
        name: 'Filter3',
        options: [
          { value: 'chocolate', label: 'Chocolate' },
          { value: 'strawberry', label: 'Strawberry' },
          { value: 'vanilla', label: 'Vanilla' }
        ]
      }
    ]
  }
}
;<SortAndFilter sortBy={sortBy} filterBy={filterBy} />
```
