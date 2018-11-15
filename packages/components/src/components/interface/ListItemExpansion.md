The action is optional. You can provide any content as children of the component. Takes an array of buttons in its `actions` prop.

```js
<ListItemExpansion
  actions={[
    <PrimaryButton onClick={() => alert('Hello')}>
      Expansion Action
    </PrimaryButton>
  ]}
>
  <p>Expansion content</p>
</ListItemExpansion>
```
