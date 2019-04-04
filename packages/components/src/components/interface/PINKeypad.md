This component provides a keypad for entering PIN numbers. You may provide a callback function (`onComplete`) to be called when the 4 digit PIN has been entered. You may also, optionally, supply a `pin` prop to set the PIN to a partial entered value if needed.

```js
<PINKeypad onComplete={(pin) => alert(`The entered PIN is: ${pin}`)}></PINKeypad>
```
