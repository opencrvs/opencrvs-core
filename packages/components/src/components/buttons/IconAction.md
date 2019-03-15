A button component with icon on the left side.

```js
const DraftIcon = require('../icons').DraftDocument
;<IconAction title="My Drafts" icon={() => <DraftIcon />} />
```

```js
const PendingIcon = require('../icons').PendingDocument
;<IconAction
  title="Pending Submissions"
  description="List of documents which haven't been synced yet"
  icon={() => <PendingIcon />}
/>
```

### Action list

```js
const ActionList = require('./Action').ActionList
const DraftIcon = require('../icons').DraftDocument
const PendingIcon = require('../icons').PendingDocument
;<ActionList>
  <IconAction title="My Drafts" icon={() => <DraftIcon />} />
  <IconAction title="Death" icon={() => <PendingIcon />} />
</ActionList>
```
