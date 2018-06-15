import * as React from 'react'
import { InputField } from '@opencrvs/components/lib/InputField'
import { Button } from '@opencrvs/components/lib/Button'
import { Spinner } from '@opencrvs/components/lib/Spinner'
import styled from 'styled-components'

const FormWrapper = styled.div`
  position: relative;
  margin: auto;
  width: 90%;
  margin-bottom: 50px;
`

const ActionWrapper = styled.div`
  position: absolute;
  right: 0px;
`
export class StepOne extends React.Component {
  render() {
    const meta = {
      touched: false
    }
    return (
      <FormWrapper>
        <form id="login-mobile-number-form">
          <InputField
            id="login-mobile-number"
            label="Mobile number"
            placeholder="e.g: +44-7557-394986"
            type="text"
            disabled={false}
            meta={meta}
          />
          <Spinner id="test-spinner" />
          <ActionWrapper>
            <Button id="login-mobile-submit">Submit</Button>
          </ActionWrapper>
        </form>
      </FormWrapper>
    )
  }
}
