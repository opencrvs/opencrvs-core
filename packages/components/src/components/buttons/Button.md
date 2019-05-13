A skeleton button component that can be used as a baseline for all other buttons. It should cover all core functionality, accessibility requirements and some highly used features for instance rendering an icon next to the button action text. It also removes the default browser styling from HTML <button>button</button>.

It should not be styled in any way and all changes that won't apply to **all** other buttons should be handled elsewhere.

```js
<Button id="myButton" onClick={() => alert('Hello')}>
  Press me
</Button>
```

**With icon**

```js
const { ArrowWithGradientIcon } = require('../icons/ArrowWithGradient.tsx')
;<Button icon={ArrowWithGradientIcon}>Press me</Button>
```
