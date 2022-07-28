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
  StepOneForm,
  IProps,
  IDispatchProps,
  FullProps
} from '@login/views/StepOne/StepOneForm'
import { IStoreState } from '@login/store'

import * as actions from '@login/login/actions'
import { getSubmissionError, getErrorCode } from '@login/login/selectors'

const FORM_NAME = 'STEP_ONE'

const mapStateToProps = (store: IStoreState): IProps => {
  return {
    formId: FORM_NAME,
    submissionError: getSubmissionError(store),
    errorCode: getErrorCode(store)
  }
}

const mapDispatchToProps = {
  forgetAction: actions.goToForgottenItemForm
}

const stepOneForm = injectIntl(StepOneForm)

export const StepOneContainer = connect<
  IProps,
  IDispatchProps,
  FullProps,
  IStoreState
>(
  mapStateToProps,
  mapDispatchToProps
)(stepOneForm) as any
