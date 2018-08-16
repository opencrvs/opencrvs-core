```js
const ArrowWithGradient = require('../icons/ArrowWithGradient').ArrowWithGradient;
<Action title="Birth" icon={() => <ArrowWithGradient />} />
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
