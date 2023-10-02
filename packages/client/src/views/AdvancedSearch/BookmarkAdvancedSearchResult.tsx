/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import * as React from 'react'
import { ToggleIcon } from '@opencrvs/components/lib/ToggleIcon'
import { useSelector } from 'react-redux'
import { getAdvancedSearchParamsState } from '@client/search/advancedSearch/advancedSearchSelectors'
import { BookmarkAdvancedSearchModal } from '@client/views/AdvancedSearch/SaveBookmarkModal'
import { RemoveBookmarkAdvancedSearchModal } from './RemoveBookmarkModal'
import { EMPTY_STRING } from '@client/utils/constants'
import { Toast } from '@opencrvs/components/lib/Toast'
import { NOTIFICATION_STATUS } from '@client/views/SysAdmin/Config/Application/utils'

export function BookmarkAdvancedSearchResult() {
  const advancedSearchState = useSelector(getAdvancedSearchParamsState)
  const bookmark = Boolean(advancedSearchState.searchId)
  const [showBookmarkModal, setShowBookmarkModal] = React.useState(false)
  const [showRemoveBookmarkModal, setShowRemoveBookmarkModal] =
    React.useState(false)
  const toggleBookmarkModal = () => {
    setShowBookmarkModal((prev) => !prev)
  }
  const toggleRemoveBookmarkModal = () => {
    setShowRemoveBookmarkModal((prev) => !prev)
  }
  const [notificationMessages, setNotificationMessages] =
    React.useState(EMPTY_STRING)
  const [notificationStatus, setNotificationStatus] =
    React.useState<NOTIFICATION_STATUS>(NOTIFICATION_STATUS.IDLE)
  return (
    <>
      <ToggleIcon
        id={bookmark ? 'toggleIconFill' : 'toggleIconEmpty'}
        defaultChecked={bookmark}
        onClick={() => {
          if (bookmark) {
            toggleRemoveBookmarkModal()
          } else {
            toggleBookmarkModal()
          }
        }}
        name={'Star'}
        color={bookmark ? 'yellow' : 'primary'}
        weight={bookmark ? 'fill' : 'bold'}
      />

      <BookmarkAdvancedSearchModal
        showBookmarkModal={showBookmarkModal}
        toggleBookmarkModal={toggleBookmarkModal}
        setNotificationStatus={setNotificationStatus}
        setNotificationMessages={setNotificationMessages}
      />
      <RemoveBookmarkAdvancedSearchModal
        showRemoveBookmarkModal={showRemoveBookmarkModal}
        toggleRemoveBookmarkModal={toggleRemoveBookmarkModal}
        setNotificationStatus={setNotificationStatus}
        setNotificationMessages={setNotificationMessages}
      />
      {notificationStatus !== NOTIFICATION_STATUS.IDLE && (
        <Toast
          id={`${notificationStatus}-save-bookmark-notification`}
          type={
            notificationStatus === NOTIFICATION_STATUS.IN_PROGRESS
              ? 'loading'
              : notificationStatus === NOTIFICATION_STATUS.ERROR
              ? 'error'
              : 'success'
          }
          onClose={() => {
            setNotificationStatus(NOTIFICATION_STATUS.IDLE)
          }}
        >
          {notificationMessages}
        </Toast>
      )}
    </>
  )
}
