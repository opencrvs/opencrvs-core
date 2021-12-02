```js
const { Settings, LogoutDark, ProfileIcon } = require('../icons')

const menuItems = [
  {
    icon: <Settings />,
    label: 'Settings',
    handler: () => alert('Settings')
  },
  {
    icon: <LogoutDark />,
    label: 'Logout',
    handler: () => alert('Logout')
  }
]
const userNameStyle = {
  'font-size': '18px',
  height: '27px',
  'line-height': '27px'
}
const userRoleStyle = {
  'font-size': '12px',
  height: '24px',
  'line-height': '150%'
}
const header = (
  <>
    <div style={userNameStyle}>Atiq Zaman</div>
    <div style={userRoleStyle}>Field Agent</div>
  </>
)

class SubMenuExample extends React.Component {
  constructor() {
    super()
  }

  render() {
    return (
      <ToggleMenu
        id="ToggleMenuExample"
        toggleButton={<ProfileIcon />}
        menuHeader={header}
        menuItems={menuItems}
      />
    )
  }
}
;<SubMenuExample />
```
