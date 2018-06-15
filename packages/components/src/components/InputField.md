An Input Field with the custom and default HTML attributes:

```js
<InputField
  id="default-input"
  label="Mobile number"
  placeholder="e.g: +44-XXXX-XXXXXX"
  type="text"
  meta={{
    touched: false,
    error: false
  }}
/>
```

```js
<InputField
  id="erro-on-input"
  label="Mobile number"
  placeholder="e.g: +44-XXXX-XXXXXX"
  type="text"
  value="An input error"
  onChange={() => {}}
  errorMessage="I think you made a mistake"
  meta={{
    touched: true,
    error: true
  }}
/>
```

```js
<InputField
  id="disabled-input"
  label="A disabled field"
  type="text"
  disabled
  meta={{
    touched: false,
    error: false
  }}
/>
```


