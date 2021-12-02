```js
const data = [
  { label: '45d', value: 2100 },
  { label: '46d - 1yr', value: 2400 },
  { label: '1', value: 1398 },
  { label: '2', value: 6800 },
  { label: '3', value: 3908 },
  { label: '4', value: 4800 },
  { label: '5', value: 3800 },
  { label: '6', value: 4300 },
  { label: '7', value: 2500 },
  { label: '8', value: 5680 },
  { label: '9', value: 4980 },
  { label: '10', value: 2570 }
]
;<div>
  <VerticalBar
    data={data}
    xAxisLabel="Age (years)"
    yAxisLabel="Total Births Registered (%)"
  />
</div>
```
