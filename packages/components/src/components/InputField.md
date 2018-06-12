React component example:

```js

const meta = {
  touched: true
  error: true
}

<InputField
  id="login-mobile-number"
  label="Mobile number"
  placeholder="e.g: +XX-XXXX-XXXXXX"
  type="text"
  disabled={false}
  meta={meta}
  errorMessage='You have an error'
/>
