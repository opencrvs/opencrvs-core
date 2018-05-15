React component example:

```js
<Button size="large">Push Me</Button>
```

You can add a custom props to an example wrapper:

```js { "props": { "className": "checks" } }
<Button>I’m transparent!</Button>
```

Or disable an editor by passing a `noeditor` modifier:

```jsx noeditor
<Button>Push Me</Button>
```

To render an example as highlighted source code add a `static` modifier:

```jsx static
import React from 'react';
```

Examples with all other languages are rendered only as highlighted source code, not an actual component:

```html
<Button size="large">Push Me</Button>
```

Any [Markdown](http://daringfireball.net/projects/markdown/) is **allowed** _here_.