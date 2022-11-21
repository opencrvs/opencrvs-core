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
import { ToggleIcon } from '@opencrvs/components/lib/ToggleIcon'
import { Button } from '@opencrvs/components/lib/Button'
import { ResponsiveModal } from '@opencrvs/components/lib/ResponsiveModal'
import { messages as messagesSearch } from '@client/i18n/messages/views/search'
import { buttonMessages } from '@client/i18n/messages'
import { InputField } from '@opencrvs/components/lib/InputField'
import { TextInput } from '@opencrvs/components/lib/TextInput'
import styled from '@client/styledComponents'

export const Message = styled.div`
  margin-bottom: 16px;
`
export const Field = styled.div`
  width: 100%;
  margin-bottom: 30px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    margin-bottom: 0px;
  }
`
interface IBookmarkModalProps {
  showBookmarkModal: boolean
  queryName: string
  toggleBookmarkModal: () => void
  onChangeQueryName: (event: React.ChangeEvent<HTMLInputElement>) => void
}

interface IRemoveBookmarkModalProps {
  showRemoveBookmarkModal: boolean
  toggleRemoveBookmarkModal: () => void
}

export function BookmarkAdvancedSearchResult() {
  const [bookmark, setBookmark] = React.useState(false)
  const [queryName, setQueryName] = React.useState('')
  const [showBookmarkModal, setShowBookmarkModal] = React.useState(false)
  const [showRemoveBookmarkModal, setShowRemoveBookmarkModal] =
    React.useState(false)
  const toggleBookmarkModal = () => {
    setShowBookmarkModal((prev) => !prev)
  }
  const toggleRemoveBookmarkModal = () => {
    setShowRemoveBookmarkModal((prev) => !prev)
  }
  const onChangeQueryName = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setQueryName(value)
  }

  return (
    <>
      <ToggleIcon
        defaultChecked={bookmark}
        onChange={() => {
          setBookmark(!bookmark)
          if (bookmark) {
            toggleRemoveBookmarkModal()
          } else {
            toggleBookmarkModal()
          }
        }}
        name={'Star'}
        color={bookmark ? 'yellow' : 'blue'}
        fill={'yellow'}
      />
      <BookmarkAdvancedSearchModal
        showBookmarkModal={showBookmarkModal}
        toggleBookmarkModal={toggleBookmarkModal}
        onChangeQueryName={onChangeQueryName}
        queryName={queryName}
      />
      <RemoveBookmarkAdvancedSearchModal
        showRemoveBookmarkModal={showRemoveBookmarkModal}
        toggleRemoveBookmarkModal={toggleRemoveBookmarkModal}
      />
    </>
  )
}

export function BookmarkAdvancedSearchModal({
  showBookmarkModal,
  toggleBookmarkModal,
  onChangeQueryName,
  queryName
}: IBookmarkModalProps) {
  const intl = useIntl()
  return (
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
          onClick={toggleBookmarkModal}
        >
          {intl.formatMessage(buttonMessages.cancel)}
        </Button>,
        <Button
          type="primary"
          id="bookmark_advanced_search_result"
          onClick={() => {}}
          disabled={!Boolean(queryName)}
        >
          {intl.formatMessage(buttonMessages.confirm)}
        </Button>
      ]}
      handleClose={toggleBookmarkModal}
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
  )
}

export function RemoveBookmarkAdvancedSearchModal({
  showRemoveBookmarkModal,
  toggleRemoveBookmarkModal
}: IRemoveBookmarkModalProps) {
  const intl = useIntl()
  return (
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
          id="bookmark_advanced_search_result"
          onClick={() => {}}
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
  )
}
