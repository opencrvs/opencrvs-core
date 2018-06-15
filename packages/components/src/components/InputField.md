An Input Field with the custom and default HTML attributes:

```js
<InputField
  id="default-input"
  label="Mobile number"
  placeholder="e.g: +44-XXXX-XXXXXX"
  type="text"
  meta={{
    touched: false
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
  meta={{
    touched: true,
    error: "I think you made a mistake"
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
    touched: false
  }}
/>
```


