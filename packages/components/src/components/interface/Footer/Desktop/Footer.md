### Direct use will have fallback text on left

```js
<Footer />
```

### Replace default left side

```js
<Footer left={<p>BOOM COPYRIGHT</p>} />
```

### Only use right side of the footer

```js
<Footer left={<div />} right={<p>BOOM COPYRIGHT</p>} />
```

### Use left and right both content

```js
<Footer right={<a>Privacy & policy</a>} />
```
