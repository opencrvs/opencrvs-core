```js
const ArrowWithGradient = require('../icons/ArrowWithGradient').ArrowWithGradient;
<Action title="Birth" icon={() => <ArrowWithGradient />} />
```

```js
const ArrowWithGradient = require('../icons/ArrowWithGradient').ArrowWithGradient;
<Action
  title="Self (18+)"
  description="Required: Details of the individual and informant. Optional: Details of the mother/father."
  icon={() => <ArrowWithGradient />}
/>
```

### Action list
```js
const ActionList = require('./Action').ActionList;
const ArrowWithGradient = require('../icons/ArrowWithGradient').ArrowWithGradient;

<ActionList>
  <Action title="Birth" icon={() => <ArrowWithGradient />} />
  <Action title="Death" icon={() => <ArrowWithGradient />} />
</ActionList>
```
