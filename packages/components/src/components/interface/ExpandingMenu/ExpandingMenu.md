```js
const {
  ApplicationBlack,
  ApplicationBlue,
  StatsBlack,
  StatsBlue,
  SettingsBlack,
  SettingsBlue,
  HelpBlack,
  HelpBlue,
  LogoutBlack,
  LogoutBlue,
  Hamburger
} = require('../../icons')

const menuItems = [
  {
    icon: <ApplicationBlack />,
    iconHover: <ApplicationBlue />,
    label: 'Applications',
    onClick: () => alert('on Click Event')
  },
  {
    icon: <StatsBlack />,
    iconHover: <StatsBlue />,
    label: 'Performance',
    onClick: () => alert('on Click Event')
  },
  {
    icon: <SettingsBlack />,
    iconHover: <SettingsBlue />,
    label: 'Settings',
    onClick: () => alert('on Click Event')
  },
  {
    icon: <HelpBlack />,
    iconHover: <HelpBlue />,
    label: 'Help',
    onClick: () => alert('on Click Event')
  },
  {
    icon: <LogoutBlack />,
    iconHover: <LogoutBlue />,
    label: 'Logout',
    secondary: true,
    onClick: () => alert('Logout')
  }
]
const userDetails = { name: 'Yeasin', role: 'Field agent' }
class ExpandingMenuExample extends React.Component {
  constructor() {
    super()
    this.state = {
      showMenu: false
    }
  }
  render() {
    return (
      <>
        <Hamburger
          onClick={() =>
            this.setState(prevState => ({
              showMenu: true
            }))
          }
        />

        <ExpandingMenu
          showMenu={this.state.showMenu}
          userDetails={userDetails}
          menuItems={menuItems}
          menuCollapse={() => {
            this.setState(() => ({
              showMenu: false
            }))
          }}
        />
      </>
    )
  }
}
;<ExpandingMenuExample />
```
