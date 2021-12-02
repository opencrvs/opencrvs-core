```js
const section = {
  title: 'Section Title',
  items: [
    {
      label: 'Name',
      value: 'Atiq Zaman',
      action: {
        label: 'Change',
        disabled: true
      }
    }
  ]
}
class DataSectionExample extends React.Component {
  constructor() {
    super()
  }

  render() {
    return <DataSection {...section} />
  }
}
;<DataSectionExample />
```
