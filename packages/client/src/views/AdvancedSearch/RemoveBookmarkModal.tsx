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
import { useIntl } from 'react-intl'
import { REMOVE_ADVANCED_SEARCH_RESULT_BOOKMARK_MUTATION } from '@client/profile/mutations'
import {
  RemoveBookmarkedAdvancedSearchMutation,
  RemoveBookmarkedAdvancedSearchMutationVariables,
  BookmarkedSeachItem
} from '@client/utils/gateway'
import { useDispatch, useSelector } from 'react-redux'
import { useMutation } from '@apollo/client'
import { getUserDetails } from '@client/profile/profileSelectors'
import { modifyUserDetails } from '@client/profile/profileActions'
import { ResponsiveModal } from '@opencrvs/components/lib/ResponsiveModal'
import { messages as messagesSearch } from '@client/i18n/messages/views/search'
import { Button } from '@opencrvs/components/lib/Button'
import { buttonMessages } from '@client/i18n/messages'
import { Message } from '@client/views/AdvancedSearch/SaveBookmarkModal'
import { getAdvancedSearchParamsState } from '@client/search/advancedSearch/advancedSearchSelectors'
import { setAdvancedSearchParam } from '@client/search/advancedSearch/actions'
import { NOTIFICATION_STATUS } from '@client/views/SysAdmin/Config/Application/utils'
import { EMPTY_STRING } from '@client/utils/constants'
import { useOnlineStatus } from '@client/utils'

interface IRemoveBookmarkModalProps {
  showRemoveBookmarkModal: boolean
  toggleRemoveBookmarkModal: () => void
  setNotificationStatus: (status: NOTIFICATION_STATUS) => void
  setNotificationMessages: (notificationMessage: string) => void
}

export function RemoveBookmarkAdvancedSearchModal({
  showRemoveBookmarkModal,
  toggleRemoveBookmarkModal,
  setNotificationStatus,
  setNotificationMessages
}: IRemoveBookmarkModalProps) {
  const intl = useIntl()
  const dispatch = useDispatch()
  const { searchId, ...rest } = useSelector(getAdvancedSearchParamsState)
  const userDetails = useSelector(getUserDetails)
  const isOnline = useOnlineStatus()

  const [removeAdvancedSearchResultBookmark] = useMutation<
    RemoveBookmarkedAdvancedSearchMutation,
    RemoveBookmarkedAdvancedSearchMutationVariables
  >(REMOVE_ADVANCED_SEARCH_RESULT_BOOKMARK_MUTATION, {
    onError() {
      setNotificationMessages(
        intl.formatMessage(
          messagesSearch.advancedSearchBookmarkErrorNotification
        )
      )
      setNotificationStatus(NOTIFICATION_STATUS.ERROR)
    },
    onCompleted() {
      setNotificationMessages(
        intl.formatMessage(
          messagesSearch.removedAdvancedSearchBookmarkSuccessNotification
        )
      )
      setNotificationStatus(NOTIFICATION_STATUS.SUCCESS)
    }
  })

  const removeAdvancedSearchBookmarkHandler = async () => {
    const mutatedData = await removeAdvancedSearchResultBookmark({
      variables: {
        removeBookmarkedSearchInput: {
          userId: String(userDetails?.userMgntUserID),
          searchId: String(searchId)
        }
      }
    })
    if (mutatedData.data?.removeBookmarkedAdvancedSearch) {
      dispatch(
        modifyUserDetails({
          ...userDetails,
          searches: mutatedData.data.removeBookmarkedAdvancedSearch
            .searchList as BookmarkedSeachItem[]
        })
      )
      dispatch(setAdvancedSearchParam({ searchId: EMPTY_STRING, ...rest }))
    }
  }
  return (
    <>
      <ResponsiveModal
        id="removeBookmarkModal"
        show={showRemoveBookmarkModal}
        title={intl.formatMessage(
          messagesSearch.removeBookmarkAdvancedSearchModalTitle
        )}
        autoHeight={true}
        actions={[
          <Button
            type="tertiary"
            id="cancel"
            key="cancel"
            onClick={toggleRemoveBookmarkModal}
          >
            {intl.formatMessage(buttonMessages.cancel)}
          </Button>,
          <Button
            key="remove-advanced-search-bookmark"
            type="primary"
            id="remove_advanced_search_bookmark"
            onClick={async () => {
              setNotificationMessages(
                intl.formatMessage(
                  messagesSearch.removeAdvancedSearchBookmarkLoadingNotification
                )
              )
              setNotificationStatus(NOTIFICATION_STATUS.IN_PROGRESS)
              toggleRemoveBookmarkModal()
              await removeAdvancedSearchBookmarkHandler()
            }}
            disabled={!isOnline}
          >
            {intl.formatMessage(buttonMessages.confirm)}
          </Button>
        ]}
        handleClose={toggleRemoveBookmarkModal}
      >
        <Message>
          {intl.formatMessage(
            messagesSearch.removeBookmarkAdvancedSearchModalBody
          )}
        </Message>
      </ResponsiveModal>
    </>
  )
}
