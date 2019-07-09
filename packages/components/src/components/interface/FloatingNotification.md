Notification type is optional but it accept the following notification types:

- NOTIF_TYPE.ERROR
- NOTIF_TYPE.WARNING
- NOTIF_TYPE.SUCCESS

callback is optional and can be bind with click event

```js
const { NOTIFICATION_TYPE } = require('./Notification')

class NotificationExample extends React.Component {
  constructor() {
    super()
    this.state = {
      show: false,
      showError: false,
      showWarning: false,
      showSuccess: false
    }

    this.toggleShow = this.toggleShow.bind(this)
    this.toggleShowSuccess = this.toggleShowSuccess.bind(this)
    this.toggleShowWarning = this.toggleShowWarning.bind(this)
    this.toggleShowError = this.toggleShowError.bind(this)
  }

  toggleShow() {
    this.setState(prevState => ({
      show: !prevState.show
    }))
  }

  toggleShowError() {
    this.setState(prevState => ({
      showError: !prevState.showError
    }))
  }

  toggleShowWarning() {
    this.setState(prevState => ({
      showWarning: !prevState.showWarning
    }))
  }

  toggleShowSuccess() {
    this.setState(prevState => ({
      showSuccess: !prevState.showSuccess
    }))
  }
  render() {
    return (
      <div>
        <div style={{ marginBottom: '5px' }}>
          <PrimaryButton onClick={this.toggleShow}>Show Default</PrimaryButton>
        </div>
        <div style={{ marginBottom: '5px' }}>
          <PrimaryButton onClick={this.toggleShowSuccess}>
            Show Success
          </PrimaryButton>
        </div>
        <div style={{ marginBottom: '5px' }}>
          <PrimaryButton onClick={this.toggleShowWarning}>
            Show Warning
          </PrimaryButton>
        </div>
        <div style={{ marginBottom: '5px' }}>
          <PrimaryButton onClick={this.toggleShowError}>
            Show Error
          </PrimaryButton>
        </div>

        <FloatingNotification show={this.state.show} callback={this.toggleShow}>
          We've made some updates, Please click here to refresh
        </FloatingNotification>

        <FloatingNotification
          type={NOTIFICATION_TYPE.SUCCESS}
          show={this.state.showSuccess}
          callback={this.toggleShowSuccess}
        >
          This is a success notification
        </FloatingNotification>

        <FloatingNotification
          type={NOTIFICATION_TYPE.WARNING}
          show={this.state.showWarning}
          callback={this.toggleShowWarning}
        >
          This is a warning notification
        </FloatingNotification>

        <FloatingNotification
          type={NOTIFICATION_TYPE.ERROR}
          show={this.state.showError}
          callback={this.toggleShowError}
        >
          This is a error notification
        </FloatingNotification>
      </div>
    )
  }
}
;<NotificationExample />
```
