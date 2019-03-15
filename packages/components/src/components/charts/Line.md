```js
const data = [
  { label: 'Jan', value: 2100, totalEstimate: 10000 },
  { label: 'Feb', value: 2400, totalEstimate: 10000 },
  { label: 'Mar', value: 1398, totalEstimate: 10000 },
  { label: 'Apr', value: 6800, totalEstimate: 10000 },
  { label: 'May', value: 3908, totalEstimate: 10000 },
  { label: 'Jun', value: 4800, totalEstimate: 10000 },
  { label: 'Jul', value: 3800, totalEstimate: 10000 },
  { label: 'Aug', value: 4300, totalEstimate: 10000 },
  { label: 'Sep', value: 2500, totalEstimate: 10000 },
  { label: 'Oct', value: 5680, totalEstimate: 10000 },
  { label: 'Nov', value: 4980, totalEstimate: 10000 },
  { label: 'Dec', value: 8570, totalEstimate: 10000 }
]
;<div>
  <Line
    data={data}
    xAxisLabel="Calendar Month"
    yAxisLabel="Birth Registration % of estimate"
  />
</div>
```
