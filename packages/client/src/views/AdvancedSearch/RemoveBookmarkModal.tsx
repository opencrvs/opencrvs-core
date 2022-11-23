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
import { useIntl } from 'react-intl'
import { REMOVE_ADVANCED_SEARCH_RESULT_BOOKMARK_MUTATION } from '@client/profile/mutations'
import {
  BookMarkedSearches,
  MutationRemoveBookmarkedAdvancedSearchArgs
} from '@client/utils/gateway'
import { useDispatch, useSelector } from 'react-redux'
import { useMutation } from '@apollo/client'
import { getUserDetails } from '@client/profile/profileSelectors'
import { modifyUserDetails } from '@client/profile/profileActions'
import { GQLBookmarkedSeachItem } from '@opencrvs/gateway/src/graphql/schema'
import { ResponsiveModal } from '@opencrvs/components/lib/ResponsiveModal'
import { messages as messagesSearch } from '@client/i18n/messages/views/search'
import { Button } from '@opencrvs/components/lib/Button'
import { buttonMessages } from '@client/i18n/messages'
import { Message } from '@client/views/AdvancedSearch/SaveBookmarkModal'
import { getPartialState } from '@client/search/advancedSearch/advancedSearchSelectors'
import { setAdvancedSearchParam } from '@client/search/advancedSearch/actions'
import { NOTIFICATION_STATUS } from '@client/views/SysAdmin/Config/Application/utils'
import { EMPTY_STRING } from '@client/utils/constants'

interface IRemoveBookmarkModalProps {
  showRemoveBookmarkModal: boolean
  toggleRemoveBookmarkModal: () => void
  setNotificationStatus: (status: NOTIFICATION_STATUS) => void
  setNotificationMessages: (notificationMessage: string) => void
}

interface IRemoveBookmarkData {
  removeBookmarkedAdvancedSearch: BookMarkedSearches
}

export function RemoveBookmarkAdvancedSearchModal({
  showRemoveBookmarkModal,
  toggleRemoveBookmarkModal,
  setNotificationStatus,
  setNotificationMessages
}: IRemoveBookmarkModalProps) {
  const intl = useIntl()
  const dispatch = useDispatch()
  const { searchId, ...rest } = useSelector(getPartialState)
  const userDetails = useSelector(getUserDetails)

  const [removeAdvancedSearchResultBookmark] = useMutation<
    IRemoveBookmarkData,
    MutationRemoveBookmarkedAdvancedSearchArgs
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
    if (mutatedData.data) {
      dispatch(
        modifyUserDetails({
          ...userDetails,
          searches: mutatedData.data.removeBookmarkedAdvancedSearch
            .searchList as GQLBookmarkedSeachItem[]
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
            disabled={false}
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
