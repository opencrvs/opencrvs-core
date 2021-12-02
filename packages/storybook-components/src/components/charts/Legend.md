Component for listing chart data points.

```js
const data = [
  {
    percentage: 17,
    value: 500,
    label: 'Live births registered within 45 days of actual birth',
    description: '500 out of 3000 total',
    categoricalData: [
      { name: 'female', label: 'Female', value: 280, icon: Female },
      { name: 'male', label: 'Male', value: 220, icon: Male }
    ]
  },
  {
    percentage: 33,
    value: 1000,
    label: 'Live births registered within 1 year of actual birth',
    description: '1000 out of 3000 total',
    categoricalData: [
      { name: 'female', label: 'Female', value: 440, icon: Female },
      { name: 'male', label: 'Male', value: 560, icon: Male }
    ]
  },
  {
    value: 3000,
    label: 'Total Live Births registered',
    description: '3000 out of estimated 4000',
    total: true
  },
  {
    percentage: 100,
    value: 4000,
    label: 'Estimated Births in [time period]',
    estimate: true,
    description: 'Provided from 2018 population census'
  }
]
;<Legend data={data} />
```
