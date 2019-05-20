### Primary button

```js
<PrimaryButton id="myButton" onClick={() => alert('Hello')}>
  Press me
</PrimaryButton>
```

### Primary button with Icon only

```js
<PrimaryButton
  id="myButton"
  onClick={() => alert('Hello')}
  icon={() => (
    <span style={{ color: '#fff', fontSize: '40px', lineHeight: '30px' }}>
      +
    </span>
  )}
/>
```

### Primary button with Icon and text

```js
<PrimaryButton id="myButton" onClick={() => alert('Hello')} icon={() => ' 😲'}>
  Press me
</PrimaryButton>
```

```js
<PrimaryButton
  align={0}
  id="myButton"
  onClick={() => alert('Hello')}
  icon={() => ' 😲'}
>
  Press me
</PrimaryButton>
```
