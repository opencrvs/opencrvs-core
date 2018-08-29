A Date Field that auto-selects the next input box as you type.

```js
<InputField component={DateField} label="Birthdate" />
```

A Date Field when thing go wrong

```js
<InputField component={DateField} label="Birthdate" meta={{ touched: true, error: "Something went boom =(" }}/>
```

A disabled Date Field

```js
<InputField component={DateField} label="Birthdate" disabled/>
```

A Date Field with a pre-defined value

```js
<InputField component={DateField} label="Birthdate" value="04-06-1986" onChange={(dob) => { console.log(dob) }}/>
```
