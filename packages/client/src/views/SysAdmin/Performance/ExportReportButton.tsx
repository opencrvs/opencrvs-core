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
import { useIntl, FormattedMessage } from 'react-intl'
import {
  LabelContainer,
  ValueContainer,
  DynamicHeightLinkButton
} from '@client/views/Settings/items/components'
import { useSelector, useDispatch } from 'react-redux'
import { IStoreState } from '@client/store'
import {
  constantsMessages,
  buttonMessages,
  userMessages
} from '@client/i18n/messages'
import { ListViewItemSimplified } from '@opencrvs/components/lib/ListViewSimplified'
import { Toast } from '@opencrvs/components/lib/Toast'
import { useOnlineStatus } from '@client/views/OfficeHome/LoadingIndicator'
import { ChangePhoneModal } from '@client/views/Settings/ChangePhoneModal/ChangePhoneModal'
import { Box, Link } from '@client/../../components/lib'
import {
  Hamburger,
  MapPin,
  SortArrow
} from '@client/../../components/lib/icons'
import { config } from 'localforage'
import { FileText } from 'react-feather'
import styled from '@client/styledComponents'
import { ExportReportModal } from './ExportReportModal'

const ButtonIcon = styled(FileText)`
  position: relative;
  top: 3px;
  margin-right: 5px;
`

export function ExportReportButton() {
  // WHAT CAN I GET RID OF HERE?
  const intl = useIntl()
  const isOnline = useOnlineStatus()
  const mobile = useSelector<IStoreState, string>(
    (state) => state.profile.userDetails?.mobile || ''
  )
  const dispatch = useDispatch()

  // WHAT CAN I GET RID OF HERE?
  const [showSuccessNotification, setShowSuccessNotification] =
    React.useState(false)
  const [showModal, setShowModal] = React.useState(false)
  const toggleSuccessNotification = () => {
    setShowSuccessNotification((prevValue) => !prevValue)
  }
  const toggleReportExportModal = () => {
    setShowModal((prevValue) => !prevValue)
  }
  const handleSuccess = () => {
    toggleReportExportModal()
    toggleSuccessNotification()
  }

  return (
    <>
      <Box>
        {/* How do I set this colour and font weight correctly? */}
        <ButtonIcon size={18} fontWeight="bold" color="#4972BB" />
        <Link font="bold14" onClick={toggleReportExportModal}>
          Export report
        </Link>
      </Box>
      <ExportReportModal
        show={showModal}
        onClose={toggleReportExportModal}
        onSuccess={handleSuccess}
      />
      {/* DO WE NEED A SUCCESS TOAST? */}
      {showSuccessNotification && (
        <Toast type="success" onClose={toggleSuccessNotification}>
          <FormattedMessage {...userMessages.phoneNumberUpdated} />
        </Toast>
      )}
    </>
  )
}
