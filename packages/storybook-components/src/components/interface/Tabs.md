**Inside a `<Header />`**

```js
const Tab = require('./Tabs').Tab
const Header = require('./Header').Header

;<Header>
  <Tabs>
    <Tab active>Child</Tab>
    <Tab>Mother</Tab>
    <Tab>Father</Tab>
    <Tab disabled>Informant</Tab>
    <Tab>Registration</Tab>
  </Tabs>
</Header>
```
