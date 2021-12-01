Component for password input

**With show/hide functionality**

```js
<PasswordInput />
```

**Without show/hide functionality**

```js
<PasswordInput ignoreVisibility={true} />
```

**Control show/hide icons as props**

```js
const PlusTransparent = require('../icons').PlusTransparent
const MinusTransparent = require('../icons').MinusTransparent
;<PasswordInput
  showIcon={<PlusTransparent />}
  hideIcon={<MinusTransparent />}
/>
```
