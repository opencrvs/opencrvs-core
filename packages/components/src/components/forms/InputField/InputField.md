A wrapper for input elements that adds a label, an error message and an indicator if the input field is optional

**With TextInput (default)**

```js
<InputField
  id="default-input"
  label="Mobile number"
  placeholder="e.g: +44-XXXX-XXXXXX"
  meta={{
    touched: false
  }}
/>
```

**With Select**

```js
const Select = require('../Select').Select;

<InputField
  component={Select}
  required={false}
  id="select-input"
  label="Mobile number"
  placeholder="e.g: +44-XXXX-XXXXXX"
  options={[
    { value: 'chocolate', label: 'Chocolate' },
    { value: 'strawberry', label: 'Strawberry' },
    { value: 'vanilla', label: 'Vanilla' }
  ]}
/>
```

**With an error**
```js
<InputField
  id="erro-on-input"
  label="Mobile number"
  placeholder="e.g: +44-XXXX-XXXXXX"
  value="An input error"
  onChange={() => {}}
  meta={{
    touched: true,
    error: "I think you made a mistake"
  }}
/>
```

**Disabled field**
```js
<InputField
  id="disabled-input"
  label="A disabled field"
  disabled
  meta={{
    touched: false
  }}
/>
```

**Optional field**

```js
<InputField
  id="optional-input"
  label="An optional field"
  required={false}
  meta={{
    touched: false
  }}
/>
```

**Field with prefix and postfix**

The prefix postfix props can take either a `string` or a `Component` to render.

```js
<InputField
  id="optional-input"
  label="Dollar weight?"
  prefix="$"
  postfix="kg"
/>
```

**Select field with postfix as a component**

```js
<InputField
  id="optional-input"
  label="Select a way forward"
  component={Select}
  options={[
    { value: 'chocolate', label: 'Chocolate' },
    { value: 'strawberry', label: 'Strawberry' },
    { value: 'vanilla', label: 'Vanilla' }
  ]}
  postfix={ArrowWithGradient}
/>
```

**Text field with postfix for async validity**

This is used for async validation.

```js
<InputField
  id="optional-input"
  label="Is Valid?"
  postfix={VerifyingIndicator}
/>
```


**Text field with postfix for async validity**

This is used for async validation.

```js
<InputField
  id="optional-input"
  label="Is Valid?"
  postfix={ValidIndicator}
/>
```
