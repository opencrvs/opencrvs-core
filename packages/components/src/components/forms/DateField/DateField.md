A Date Field that auto-selects the next input box as you type.

```js
<DateField label="Birthdate"/>
```

A Date Field when thing go wrong

```js
<DateField label="Birthdate" meta={{ touched: true, error: "Something went boom =(" }}/>
```

A disabled Date Field

```js
<DateField label="Birthdate" disabled/>
```

A Date Field with a pre-defined value

```js
<DateField label="Birthdate" value="04-06-1986" onChange={(dob) => { console.log(dob) }}/>
```
