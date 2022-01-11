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
import { IPrintableApplication } from '@client/applications'
import { IForm, IFormSection, IFormSectionGroup } from '@client/forms'
import { ITheme } from '@client/styledComponents'
import * as React from 'react'
import { WrappedComponentProps as IntlShapeProps } from 'react-intl'

interface IState {}
interface IBaseProps {
  registerForm: IForm
  event: Event
  pageRoute: string
  applicationId: string
  application: IPrintableApplication | undefined
  formSection: IFormSection
  formGroup: IFormSectionGroup
  theme: ITheme
}

type IProps = IBaseProps & IntlShapeProps
class CorrectRecordFormComponent extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)
  }
  render() {
    const {
      intl,
      event,
      applicationId,
      application,
      formSection,
      formGroup,
      registerForm
    } = this.props
    return <></>
  }
}
