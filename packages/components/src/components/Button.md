A button that can be used both for primary and secondary actions:

```js
<Button id="PrimaryButton" onClick={() => alert("Primary")}>primary</Button>
```
```js
<Button id="SecondaryButton" secondary={true} onClick={() => alert("Secondary")}>secondary</Button>
```
