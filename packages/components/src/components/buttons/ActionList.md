```js
const Action = require('./ActionList').Action;
const ArrowWithGradientIcon = require('../icons/ArrowWithGradient').ArrowWithGradientIcon;

<ActionList>
  <Action title="Birth" icon={() => <ArrowWithGradientIcon />} />
  <Action title="Death" icon={() => <ArrowWithGradientIcon />} />
</ActionList>
```
