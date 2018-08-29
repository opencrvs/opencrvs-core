```js
<Action title="Birth" />
```

**Disabled**
```js
<Action disabled title="Birth" />
```

```js
<Action
  title="Self (18+)"
  description="Required: Details of the individual and informant. Optional: Details of the mother/father."
/>
```
```js
<Action
  disabled
  title="Self (18+)"
  description="Required: Details of the individual and informant. Optional: Details of the mother/father."
/>
```

### Action list
```js
const ActionList = require('./Action').ActionList;

<ActionList>
  <Action title="Birth" />
  <Action title="Death" />
</ActionList>
```
