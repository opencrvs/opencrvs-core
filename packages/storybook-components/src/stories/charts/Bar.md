Component for visualizing values in a bar chart format.

**With an estimate**

```js
<Bar
  data={[
    {
      value: 500,
      label: 'Live births registered within 45 days of actual birth'
    },
    {
      value: 1000,
      label: 'Live births registered within 1 year of actual birth'
    },
    {
      value: 3000,
      label: 'Total Live Births registered',
      total: true
    },
    {
      value: 4000,
      label: 'Estimated Births in [time period]',
      estimate: true,
      description: 'Provided from 2018 population census'
    }
  ]}
/>
```

**Without an estimate**

```js
<Bar
  data={[
    {
      value: 500,
      label: 'Live births registered within 45 days of actual birth'
    },
    {
      value: 1000,
      label: 'Live births registered within 1 year of actual birth'
    },
    {
      value: 3000,
      label: 'Total Live Births registered',
      total: true
    }
  ]}
/>
```

**With legend**

```js
const Legend = require('./Legend').Legend
const data = [
  {
    percentage: 17,
    value: 500,
    label: 'Live births registered within 45 days of actual birth',
    description: '500 out of 3000 total'
  },
  {
    percentage: 33,
    value: 1000,
    label: 'Live births registered within 1 year of actual birth',
    description: '1000 out of 3000 total'
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
;<div>
  <Bar data={data} />
  <Legend data={data} />
</div>
```
