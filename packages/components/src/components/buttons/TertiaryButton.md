```js
<TertiaryButton id="myButton" onClick={() => alert('Hello')}>
  Press me
</TertiaryButton>
```

### Tertiary button with icon

```js
<TertiaryButton
  id="myButton"
  align={0}
  onClick={() => alert('Hello')}
  icon={() => (
    <svg width="29" height="14">
      <title>Group</title>
      <g
        fill-rule="nonzero"
        stroke="#4C68C1"
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
>
  Press me
</TertiaryButton>
```

```js
<TertiaryButton
  id="myButton"
  onClick={() => alert('Hello')}
  icon={() => (
    <svg width="29" height="14">
      <title>Group</title>
      <g
        fill-rule="nonzero"
        stroke="#4C68C1"
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
>
  Press me
</TertiaryButton>
```
