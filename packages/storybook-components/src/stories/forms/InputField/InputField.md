A wrapper for input elements that adds a label, an error message and an asterisk indicator if the input field is required

**With TextInput (default)**

```js
const TextInput = require('../TextInput').TextInput

;<InputField id="default-input" label="Mobile number">
  <TextInput placeholder="e.g: +44-XXXX-XXXXXX" />
</InputField>
```

**With Select**

```js
const Select = require('../Select').Select

;<InputField
  required={false}
  id="select-input"
  label="Your favourite ice create flavour?"
>
  <Select
    options={[
      { value: 'chocolate', label: 'Chocolate' },
      { value: 'strawberry', label: 'Strawberry' },
      { value: 'vanilla', label: 'Vanilla' }
    ]}
  />
</InputField>
```

**With an error**

```js
const TextInput = require('../TextInput').TextInput
;<InputField
  id="erro-on-input"
  label="Mobile number"
  placeholder="e.g: +44-XXXX-XXXXXX"
  touched
  error="I think you made a mistake"
>
  <TextInput
    touched
    error
    value="An input error"
    onChange={() => {}}
    placeholder="e.g: +44-XXXX-XXXXXX"
  />
</InputField>
```

**Disabled field**

```js
const TextInput = require('../TextInput').TextInput
;<InputField id="disabled-input" label="A disabled field" disabled>
  <TextInput disabled placeholder="e.g: +44-XXXX-XXXXXX" />
</InputField>
```

**Optional field**

```js
const TextInput = require('../TextInput').TextInput
;<InputField id="optional-input" label="An optional field" required={false}>
  <TextInput placeholder="e.g: +44-XXXX-XXXXXX" />
</InputField>
```

**Field with prefix and postfix**

The prefix postfix props can take either a `string` or a `Component` to render.

```js
const TextInput = require('../TextInput').TextInput
;<InputField id="optional-input" label="Dollar weight?" prefix="$" postfix="kg">
  <TextInput />
</InputField>
```

**Select field with postfix as a component**

```js
<InputField
  id="optional-input"
  label="Select a way forward"
  postfix={ArrowWithGradient}
>
  <Select
    options={[
      { value: 'chocolate', label: 'Chocolate' },
      { value: 'strawberry', label: 'Strawberry' },
      { value: 'vanilla', label: 'Vanilla' }
    ]}
  />
</InputField>
```

**Text field with postfix for async validity**

This is used for async validation.

```js
const TextInput = require('../TextInput').TextInput
const VerifyingIndicator = require('../VerifyingIndicator').VerifyingIndicator

;<InputField
  id="optional-input"
  label="Is Valid?"
  postfix={<VerifyingIndicator />}
>
  <TextInput />
</InputField>
```

**Text field with postfix for async validity**

This is used for async validation.

```js
const TextInput = require('../TextInput').TextInput
const ValidIndicator = require('../ValidIndicator').ValidIndicator

;<InputField id="optional-input" label="Is Valid?" postfix={<ValidIndicator />}>
  <TextInput />
</InputField>
```

**Required without asterisk indicator**

Asterisk indicator can be hidden with `hideAsterisk` prop even if the input field is required

```js
const TextInput = require('../TextInput').TextInput

;<InputField id="default-input" label="Mobile number" hideAsterisk={true}>
  <TextInput placeholder="e.g: +44-XXXX-XXXXXX" />
</InputField>
```
