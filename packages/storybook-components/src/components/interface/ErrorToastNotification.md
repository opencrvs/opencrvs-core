```js
class ErrorToastNotificationExample extends React.Component {
  constructor() {
    super()
    this.state = {
      show: false
    }

    this.toggleShow = this.toggleShow.bind(this)
  }

  toggleShow() {
    this.setState(prevState => ({
      show: !prevState.show
    }))
  }

  render() {
    return (
      <div>
        <div style={{ marginBottom: '5px' }}>
          <PrimaryButton onClick={this.toggleShow}>
            Show toast notification
          </PrimaryButton>
        </div>

        {this.state.show && (
          <ErrorToastNotification callback={this.toggleShowError}>
            Something went wrong
          </ErrorToastNotification>
        )}
      </div>
    )
  }
}
;<ErrorToastNotificationExample />
```
