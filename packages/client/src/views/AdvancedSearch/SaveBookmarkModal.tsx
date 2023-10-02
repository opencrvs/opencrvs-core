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
import { InputField } from '@opencrvs/components/lib/InputField'
import { TextInput } from '@opencrvs/components/lib/TextInput'
import { BOOKMARK_ADVANCED_SEARCH_RESULT_MUTATION } from '@client/profile/mutations'
import {
  AdvancedSearchParametersInput,
  BookmarkAdvancedSearchMutation,
  BookmarkAdvancedSearchMutationVariables,
  BookmarkedSeachItem
} from '@client/utils/gateway'
import { useDispatch, useSelector } from 'react-redux'
import { useMutation } from '@apollo/client'
import { getAdvancedSearchParamsState } from '@client/search/advancedSearch/advancedSearchSelectors'
import { getUserDetails } from '@client/profile/profileSelectors'
import { modifyUserDetails } from '@client/profile/profileActions'
import { ResponsiveModal } from '@opencrvs/components/lib/ResponsiveModal'
import { messages as messagesSearch } from '@client/i18n/messages/views/search'
import { Button } from '@opencrvs/components/lib/Button'
import { buttonMessages } from '@client/i18n/messages'
import styled from 'styled-components'
import { setAdvancedSearchParam } from '@client/search/advancedSearch/actions'
import { NOTIFICATION_STATUS } from '@client/views/SysAdmin/Config/Application/utils'
import { omitBy } from 'lodash'
import { EMPTY_STRING } from '@client/utils/constants'
import { useOnlineStatus } from '@client/utils'

export const Message = styled.div`
  margin-bottom: 16px;
`

interface IBookmarkModalProps {
  showBookmarkModal: boolean
  toggleBookmarkModal: () => void
  setNotificationStatus: (status: NOTIFICATION_STATUS) => void
  setNotificationMessages: (notificationMessage: string) => void
}

export function BookmarkAdvancedSearchModal({
  showBookmarkModal,
  toggleBookmarkModal,
  setNotificationStatus,
  setNotificationMessages
}: IBookmarkModalProps) {
  const intl = useIntl()
  const isOnline = useOnlineStatus()
  const dispatch = useDispatch()
  const userDetails = useSelector(getUserDetails)
  const { searchId, ...advancedSearchParams } = useSelector(
    getAdvancedSearchParamsState
  )
  //remove null and empty properties
  const filteredAdvancedSearchParams = omitBy(
    advancedSearchParams,
    (properties) => properties === null || properties === EMPTY_STRING
  ) as AdvancedSearchParametersInput
  const [queryName, setQueryName] = React.useState('')
  const onChangeQueryName = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setQueryName(value)
  }

  const [bookmarkAdvancedSearchResult] = useMutation<
    BookmarkAdvancedSearchMutation,
    BookmarkAdvancedSearchMutationVariables
  >(BOOKMARK_ADVANCED_SEARCH_RESULT_MUTATION, {
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
          messagesSearch.advancedSearchBookmarkSuccessNotification
        )
      )
      setNotificationStatus(NOTIFICATION_STATUS.SUCCESS)
    }
  })

  const bookmarkAdvancedSearchHandler = async () => {
    const mutatedData = await bookmarkAdvancedSearchResult({
      variables: {
        bookmarkSearchInput: {
          userId: userDetails?.userMgntUserID as string,
          name: queryName,
          parameters: {
            ...filteredAdvancedSearchParams
          }
        }
      }
    })
    if (mutatedData.data?.bookmarkAdvancedSearch) {
      const { __typename, ...rest } = mutatedData.data.bookmarkAdvancedSearch
      const filteredSearchListData =
        rest.searchList &&
        rest.searchList.map((item) => {
          const { __typename, ...restParams } = item.parameters
          return {
            name: item.name,
            searchId: item.searchId,
            parameters: restParams
          }
        })
      dispatch(
        modifyUserDetails({
          ...userDetails,
          searches: filteredSearchListData as BookmarkedSeachItem[]
        })
      )
      dispatch(
        setAdvancedSearchParam({
          ...advancedSearchParams,
          searchId: rest.searchList?.[rest.searchList.length - 1].searchId
        })
      )
    }
  }

  return (
    <>
      <ResponsiveModal
        id="bookmarkModal"
        show={showBookmarkModal}
        title={intl.formatMessage(
          messagesSearch.bookmarkAdvancedSearchModalTitle
        )}
        autoHeight={true}
        actions={[
          <Button
            type="tertiary"
            id="cancel"
            key="cancel"
            onClick={() => {
              toggleBookmarkModal()
              setQueryName('')
            }}
          >
            {intl.formatMessage(buttonMessages.cancel)}
          </Button>,
          <Button
            type="primary"
            key="bookmark-advanced-search-result"
            id="bookmark_advanced_search_result"
            onClick={async () => {
              setNotificationMessages(
                intl.formatMessage(
                  messagesSearch.advancedSearchBookmarkLoadingNotification
                )
              )
              setNotificationStatus(NOTIFICATION_STATUS.IN_PROGRESS)
              toggleBookmarkModal()
              setQueryName('')
              await bookmarkAdvancedSearchHandler()
            }}
            disabled={!Boolean(queryName) || !isOnline}
          >
            {intl.formatMessage(buttonMessages.confirm)}
          </Button>
        ]}
        handleClose={() => {
          toggleBookmarkModal()
          setQueryName('')
        }}
      >
        <Message>
          {intl.formatMessage(messagesSearch.bookmarkAdvancedSearchModalBody)}
        </Message>

        <InputField id="queryName" touched={true} required={false}>
          <TextInput
            id="queryName"
            type="text"
            placeholder="Name of query"
            touched={true}
            error={false}
            value={queryName}
            onChange={onChangeQueryName}
          />
        </InputField>
      </ResponsiveModal>
    </>
  )
}
