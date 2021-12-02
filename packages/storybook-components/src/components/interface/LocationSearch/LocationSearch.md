```js
<LocationSearch
  locationList={[
    {
      id: '123',
      searchableText: 'Location one',
      displayLabel: 'Location one, Dhaka'
    },
    {
      id: '234',
      searchableText: 'Location two',
      displayLabel: 'Location two, Dhaka'
    },
    {
      id: '345',
      searchableText: 'Location three',
      displayLabel: 'Location three, Dhaka'
    }
  ]}
  searchHandler={param => {
    alert(param)
  }}
/>
```
