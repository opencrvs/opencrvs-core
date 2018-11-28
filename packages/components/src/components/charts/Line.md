```js
const data = [
  { name: 'Jan', value: 2100, total: 10000 },
  { name: 'Feb', value: 2400, total: 10000 },
  { name: 'Mar', value: 1398, total: 10000 },
  { name: 'Apr', value: 6800, total: 10000 },
  { name: 'May', value: 3908, total: 10000 },
  { name: 'Jun', value: 4800, total: 10000 },
  { name: 'Jul', value: 3800, total: 10000 },
  { name: 'Aug', value: 4300, total: 10000 },
  { name: 'Sep', value: 2500, total: 10000 },
  { name: 'Oct', value: 5680, total: 10000 },
  { name: 'Nov', value: 4980, total: 10000 },
  { name: 'Dec', value: 8570, total: 10000 }
]
;<div>
  <Line
    data={data}
    xAxisLabel="Calendar Month"
    yAxisLabel="Birth Registration % of estimate"
  />
</div>
```
