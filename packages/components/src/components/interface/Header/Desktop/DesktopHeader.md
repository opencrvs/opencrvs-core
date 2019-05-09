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

class DesktopHeaderSample extends React.Component {
  render() {
    return <DesktopHeader menuItems={menuItems} />
  }
}
;<DesktopHeaderSample />
```
