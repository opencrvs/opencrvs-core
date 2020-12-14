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
import * as React from 'react'
import { ExpandableNotification } from '@opencrvs/components/lib/interface'
import styled from '@client/styledComponents'
import { connect } from 'react-redux'
import { IStoreState } from '@client/store'
import {
  defineMessages,
  WrappedComponentProps as IntlShapeProps,
  injectIntl
} from 'react-intl'
import Outbox from './Outbox'
import { IApplication, SUBMISSION_STATUS } from '@client/applications'

const messages = defineMessages({
  processingText: {
    id: 'misc.notif.processingText',
    defaultMessage: '{num} application processing...',
    description: 'Application processing text'
  },
  outboxText: {
    id: 'misc.notif.outboxText',
    defaultMessage: 'Outbox({num})',
    description: 'Application outbox text'
  }
})
const ExpandableNotificationContainer = styled.div`
  display: flex;
  bottom: 0;
  position: fixed;
  width: 100%;
  flex-direction: column;
`

interface IProps {
  application: IApplication[]
  showPaginated?: boolean
}
type IFullProps = IProps & IntlShapeProps
class NotificationToast extends React.Component<IFullProps> {
  render() {
    const outboxData = this.props.application.filter(
      item =>
        item.submissionStatus === SUBMISSION_STATUS.READY_TO_SUBMIT ||
        item.submissionStatus === SUBMISSION_STATUS.READY_TO_APPROVE ||
        item.submissionStatus === SUBMISSION_STATUS.READY_TO_REGISTER ||
        item.submissionStatus === SUBMISSION_STATUS.READY_TO_REJECT ||
        item.submissionStatus === SUBMISSION_STATUS.READY_TO_CERTIFY ||
        item.submissionStatus === SUBMISSION_STATUS.SUBMITTING ||
        item.submissionStatus === SUBMISSION_STATUS.APPROVING ||
        item.submissionStatus === SUBMISSION_STATUS.REGISTERING ||
        item.submissionStatus === SUBMISSION_STATUS.REJECTING ||
        item.submissionStatus === SUBMISSION_STATUS.CERTIFYING ||
        item.submissionStatus === SUBMISSION_STATUS.FAILED_NETWORK
    )

    return outboxData.length > 0 ? (
      <ExpandableNotificationContainer>
        <ExpandableNotification
          outboxText={this.props.intl.formatMessage(messages.outboxText, {
            num: outboxData.length
          })}
          processingText={this.props.intl.formatMessage(
            messages.processingText,
            {
              num: outboxData.length
            }
          )}
        >
          <Outbox
            application={outboxData}
            showPaginated={this.props.showPaginated}
          />
        </ExpandableNotification>
      </ExpandableNotificationContainer>
    ) : null
  }
}

function mapStatetoProps(state: IStoreState) {
  return {
    application:
      state.applicationsState && state.applicationsState.applications
        ? [...state.applicationsState.applications]
        : []
  }
}
export default connect(mapStatetoProps)(injectIntl(NotificationToast))
