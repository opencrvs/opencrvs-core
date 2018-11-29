```js
const data = [
  { name: '45d', value: 2100 },
  { name: '46d - 1yr', value: 2400 },
  { name: '1', value: 1398 },
  { name: '2', value: 6800 },
  { name: '3', value: 3908 },
  { name: '4', value: 4800 },
  { name: '5', value: 3800 },
  { name: '6', value: 4300 },
  { name: '7', value: 2500 },
  { name: '8', value: 5680 },
  { name: '9', value: 4980 },
  { name: '10', value: 2570 }
]
;<div>
  <VerticalBar
    data={data}
    xAxisLabel="Age (years)"
    yAxisLabel="Total Births Registered (%)"
  />
</div>
```
