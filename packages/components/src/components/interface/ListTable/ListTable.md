```js
function reviewClicked() {
  alert('review clicked')
}

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
  }
]
const ColumnContentAlignment = require('../GridTable')
class ListTableExample extends React.Component {
  render() {
    return (
      <ListTable
        content={list}
        columns={[
          {
            label: 'Name',
            icon: name => {
              return (
                <>
                  <DefaultProfilePhoto /> <span>{name}</span>
                </>
              )
            },
            width: 30,
            key: 'name'
          },
          {
            label: 'Role',
            width: 30,
            key: 'role'
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
        noResultText="No result to display"
      />
    )
  }
}
;<ListTableExample />
```
