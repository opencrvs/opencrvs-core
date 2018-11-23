```js
const data = [
  { name: 'Jan', value: 2100 },
  { name: 'Feb', value: 2400 },
  { name: 'Mar', value: 1398 },
  { name: 'Apr', value: 6800 },
  { name: 'May', value: 3908 },
  { name: 'Jun', value: 4800 },
  { name: 'Jul', value: 3800 },
  { name: 'Aug', value: 4300 },
  { name: 'Sep', value: 2500 },
  { name: 'Oct', value: 5680 },
  { name: 'Nov', value: 4980 },
  { name: 'Dec', value: 2570 }
]
;<div>
  <Line
    data={data}
    xAxisLabel="Calendar Month"
    yAxisLabel="Birth Registration % of estimate"
  />
</div>
```
