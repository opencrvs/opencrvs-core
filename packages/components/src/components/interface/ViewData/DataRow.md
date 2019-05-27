```js
const changeButton = {
  label: 'Change',
  handler: () => alert('Change')
}
class DataRowExample extends React.Component {
  constructor() {
    super()
  }

  render() {
    return <DataRow label="Name" value="Atiq Zaman" action={changeButton} />
  }
}
;<DataRowExample />
```
