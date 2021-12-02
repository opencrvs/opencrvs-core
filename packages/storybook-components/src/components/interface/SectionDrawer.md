```js
class SectionDrawerExample extends React.Component {
  constructor(props) {
    super(props)
    this.state = { isExpanded: false }
  }
  render() {
    return (
      <div>
        <SectionDrawer
          title="Child's details"
          expandable={true}
          linkText="Edit"
          isExpanded={this.state.isExpanded}
          linkClickHandler={() => alert('Click Handler')}
          expansionButtonHandler={() => {
            this.setState(prevState => ({ isExpanded: !prevState.isExpanded }))
          }}
        >
          Section Information populates here
        </SectionDrawer>
      </div>
    )
  }
}
;<SectionDrawerExample />
```
