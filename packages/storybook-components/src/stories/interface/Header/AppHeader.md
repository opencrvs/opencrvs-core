**Header for OpenCRVS**

Determines whether to view desktop header or mobile header depending on window width.

```js
const menuItems = [
  {
    key: 'application',
    title: 'Application',
    selected: true
  },
  {
    key: 'performance',
    title: 'Performance',
    selected: false
  }
]

;<AppHeader
  menuItems={menuItems}
  id="register_app_header"
  left={{ icon: () => <Hamburger /> }}
  title="Mobile header"
  right={{ icon: () => <SearchDark /> }}
/>
```
