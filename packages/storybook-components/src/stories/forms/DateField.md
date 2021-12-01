A Date Field that auto-selects the next input box as you type.

```js
<InputField
  component={DateField}
  label="Birthdate"
/>
```

A Date Field with a pre-defined value and an `onChange` handler. Note, the `onChange` handler calls back with a string value in the ISO8601 format. E.g. '1980-04-21'.

```js
<InputField
  component={DateField}
  label="Birthdate"
  value="1980-04-21"
  onChange={(dob) => { console.log(dob) }}
/>
```
