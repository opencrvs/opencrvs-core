```js
const ArrowDownBlue = require('../../icons').ArrowDownBlue
const isLoading = true
const list = [
  {
    name: 'Euan',
    role: 'Registrar',
    type: 'Chairman',
    status: 'Active'
  },
  {
    name: 'Euan',
    role: 'Registrar',
    type: 'Chairman',
    status: 'Active'
  },
  {
    name: 'Euan',
    role: 'Registrar',
    type: 'Chairman',
    status: 'Active'
  },
  {
    name: 'Euan',
    role: 'Registrar',
    type: 'Chairman',
    status: 'Active'
  },
  {
    name: 'Euan',
    role: 'Registrar',
    type: 'Chairman',
    status: 'Active'
  },
  {
    name: 'Euan',
    role: 'Registrar',
    type: 'Chairman',
    status: 'Active'
  },
  {
    name: 'Euan',
    role: 'Registrar',
    type: 'Chairman',
    status: 'Active'
  },
  {
    name: 'Euan',
    role: 'Registrar',
    type: 'Chairman',
    status: 'Active'
  },
  {
    name: 'Euan',
    role: 'Registrar',
    type: 'Chairman',
    status: 'Active'
  }
]

class ListTableExample extends React.Component {
  render() {
    return (
      <ListTable
        tableTitle="Table Title"
        isLoading={isLoading}
        content={list}
        columns={[
          {
            label: 'Name',
            width: 30,
            key: 'name',
            isSortable: true,
            icon: <ArrowDownBlue />,
            sortFunction: key => alert(`Sort by: ${key}`)
          },
          {
            label: 'Role',
            width: 30,
            key: 'role',
            isSortable: true,
            icon: <ArrowDownBlue />,
            sortFunction: key => alert(`Sort by: ${key}`)
          },
          {
            label: 'Type',
            width: 30,
            key: 'type'
          },
          {
            label: 'Status',
            width: 10,
            key: 'status'
          }
        ]}
        footerColumns={[
          {
            label: 'Name',
            width: 30,
            key: 'name'
          },
          {
            label: 'Name',
            width: 30,
            key: 'name'
          },
          {
            label: 'Name',
            width: 30,
            key: 'name'
          },
          {
            label: 'Name',
            width: 10,
            key: 'name'
          }
        ]}
        noResultText="No result to display"
      />
    )
  }
}
;<ListTableExample />
```
