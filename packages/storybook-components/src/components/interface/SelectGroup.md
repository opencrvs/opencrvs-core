Passes new value after change and the value that causes the change in onChange method.

```js
<SelectGroup
  values={{ Filter1: '', Filter2: '', Filter3: '' }}
  options={[
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
  ]}
/>
```

### Inside an input field

```js
const Inputfield = require('../forms/InputField/InputField').InputField
;<InputField id="select-group-input" label="Filter by:">
  <SelectGroup
    values={{ Filter1: '', Filter2: '', Filter3: '' }}
    options={[
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
    ]}
  />
</InputField>
```
