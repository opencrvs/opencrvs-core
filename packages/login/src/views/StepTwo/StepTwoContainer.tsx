/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import { connect } from 'react-redux'
import { injectIntl } from 'react-intl'
import {
  IProps,
  IDispatchProps,
  StepTwoForm,
  FullProps
} from '@login/views/StepTwo/StepTwoForm'
import { IStoreState } from '@login/store'

import * as actions from '@login/login/actions'
import {
  getSubmissionError,
  getResentSMS,
  getsubmitting,
  selectApplicationName
} from '@login/login/selectors'

const FORM_NAME = 'STEP_TWO'

const mapStateToProps = (store: IStoreState): IProps => {
  return {
    formId: FORM_NAME,
    submissionError: getSubmissionError(store),
    resentSMS: getResentSMS(store),
    submitting: getsubmitting(store),
    stepOneDetails: { mobile: store.login.authenticationDetails.mobile },
    applicationName: selectApplicationName(store)
  }
}

const mapDispatchToProps: IDispatchProps = {
  submitAction: actions.verifyCode,
  onResendSMS: actions.resendSMS
}

const stepTwoForm = injectIntl(StepTwoForm)

export const StepTwoContainer = connect<
  IProps,
  IDispatchProps,
  FullProps,
  IStoreState
>(
  mapStateToProps,
  mapDispatchToProps
)(stepTwoForm) as any
