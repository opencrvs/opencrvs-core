Component for visualizing values in a bar chart format.

**With an estimate**

```js
<Bar data={[
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
    label: 'Estimated Births in [time period]:',
    estimate: true
  }
]} />
```

**Without an estimate**

```js
<Bar data={[
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
]} />
```
