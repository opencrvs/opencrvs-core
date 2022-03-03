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
import { IDeclaration, SUBMISSION_STATUS } from '@client/declarations'

const messages = defineMessages({
  processingText: {
    id: 'misc.notif.processingText',
    defaultMessage: '{num} declaration processing...',
    description: 'Declaration processing text'
  },
  outboxText: {
    id: 'misc.notif.outboxText',
    defaultMessage: 'Outbox({num})',
    description: 'Declaration outbox text'
  }
})
const ExpandableNotificationContainer = styled.div`
  display: flex;
  bottom: 0;
  position: fixed;
  width: 100%;
  z-index: 3;
  flex-direction: column;
`

interface IProps {
  declaration: IDeclaration[]
  showPaginated?: boolean
}
type IFullProps = IProps & IntlShapeProps
class NotificationToast extends React.Component<IFullProps> {
  render() {
    const outboxData = this.props.declaration.filter(
      (item) =>
        item.submissionStatus === SUBMISSION_STATUS.READY_TO_SUBMIT ||
        item.submissionStatus === SUBMISSION_STATUS.READY_TO_APPROVE ||
        item.submissionStatus === SUBMISSION_STATUS.READY_TO_REGISTER ||
        item.submissionStatus === SUBMISSION_STATUS.READY_TO_REJECT ||
        item.submissionStatus === SUBMISSION_STATUS.READY_TO_CERTIFY ||
        item.submissionStatus ===
          SUBMISSION_STATUS.READY_TO_REQUEST_CORRECTION ||
        item.submissionStatus === SUBMISSION_STATUS.SUBMITTING ||
        item.submissionStatus === SUBMISSION_STATUS.APPROVING ||
        item.submissionStatus === SUBMISSION_STATUS.REGISTERING ||
        item.submissionStatus === SUBMISSION_STATUS.REJECTING ||
        item.submissionStatus === SUBMISSION_STATUS.CERTIFYING ||
        item.submissionStatus === SUBMISSION_STATUS.REQUESTING_CORRECTION ||
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
            declaration={outboxData}
            showPaginated={this.props.showPaginated}
          />
        </ExpandableNotification>
      </ExpandableNotificationContainer>
    ) : null
  }
}

function mapStatetoProps(state: IStoreState) {
  return {
    declaration:
      state.declarationsState && state.declarationsState.declarations
        ? [...state.declarationsState.declarations]
        : []
  }
}
export default connect(mapStatetoProps)(injectIntl(NotificationToast))
