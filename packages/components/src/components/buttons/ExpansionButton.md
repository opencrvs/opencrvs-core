```js
<ExpansionButton
  id="myButton"
  expanded={false}
  onClick={() => alert('Hello')}
/>
```

This expansion button is used to work with any expandable view and shows expanded or collapsed state with its rotated position. It detects state with its `expanded` prop.

```js
class ExpansionButtonExample extends React.Component {
  constructor() {
    super()
    this.state = {
      expanded: false
    }

    this.toggleExpansion = this.toggleExpansion.bind(this)
  }

  toggleExpansion() {
    this.setState((prevState, props) => ({
      expanded: !prevState.expanded
    }))
  }

  render() {
    return (
      <div>
        <ExpansionButton
          id="myButton"
          expanded={this.state.expanded}
          onClick={this.toggleExpansion}
        />
        <br />
        <h1>{this.state.expanded ? 'Expanded' : 'Not expanded'}</h1>
      </div>
    )
  }
}
;<ExpansionButtonExample />
```
