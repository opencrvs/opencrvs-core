import * as React from 'react'
import { InputField } from '@opencrvs/components/lib/InputField'

export class MobileNumberForm extends React.Component {
  render() {
    const meta = {
      touched: true,
      error: true
    }
    return (
      <form id="login-mobile-number-form">
        <InputField
          id="login-mobile-number"
          label="Mobile number"
          placeholder="e.g: +44-7557-394986"
          type="text"
          disabled={false}
          meta={meta}
        />
      </form>
    )
  }
}

