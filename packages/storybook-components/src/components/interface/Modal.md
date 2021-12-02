The title is optional. You can provide any content as children of the component. Actions are provided as an array of components which will be displayed in a centered column.


```js
class ModalExample extends React.Component {
  constructor() {
    super()
    this.state = {
      show: false
    }

    this.toggleOpen = this.toggleOpen.bind(this)
  }

  toggleOpen() {
    this.setState((prevState, props) => ({
      show: !prevState.show
    }))
  }

  render() {
    return (
      <div>
        <PrimaryButton onClick={this.toggleOpen}>Open</PrimaryButton>
        <Modal title="Are you ready to submit?" actions={[<PrimaryButton onClick={this.toggleOpen}>Submit</PrimaryButton>, <button onClick={this.toggleOpen}>Preview</button>]} show={this.state.show} handleClose={this.toggleOpen}>
          By clicking “Submit” you confirm that the informant has read and reviewed the information and understands that this information will be shared with Civil Registration authorities.
        </Modal>
      </div>
    )
  }
}
;<ModalExample />
```
