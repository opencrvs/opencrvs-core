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
    <svg width="29" height="14">
      <title>Group</title>
      <g
        fill-rule="nonzero"
        stroke="#FFF"
        stroke-width="2.5"
        fill="none"
        stroke-linecap="round"
      >
        <path d="M27 7H4.059" />
        <path
          stroke-linejoin="round"
          d="M7.17 12.355L1.762 6.948l5.304-5.303"
        />
      </g>
    </svg>
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
