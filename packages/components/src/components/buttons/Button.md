A skeleton button component that can be used as a baseline for all other buttons. It should cover all core functionality, accessibility requirements and some highly used features for instance rendering an icon next to the button action text. It also removes the default browser styling from HTML <button>button</button>.

It should not be styled in any way and all changes that won't apply to **all** other buttons should be handled elsewhere.

### ⚠️ Please do not use this button for any other clicable components. You can simply make new component from scratch.

## How to use this Button

1. only pass text as child,
2. only pass icon as props
3. pass alignment from Button Libray `align={ ICON_ALIGNMENT.LEFT }`

```js
<Button id="myButton" onClick={() => alert('Hello')}>
  Press me
</Button>
```

### button with Icon only

```js
<Button
  id="myButton"
  onClick={() => alert('Hello')}
  icon={() => (
    <span style={{ color: '#fff', fontSize: '40px', lineHeight: '30px' }}>
      +
    </span>
  )}
/>
```

### button with Icon and text

```js
<Button id="myButton" onClick={() => alert('Hello')} icon={() => ' 😲'}>
  Press me
</Button>
```

```js
<Button
  align={0}
  id="myButton"
  onClick={() => alert('Hello')}
  icon={() => ' 😲'}
>
  Press me
</Button>
```
