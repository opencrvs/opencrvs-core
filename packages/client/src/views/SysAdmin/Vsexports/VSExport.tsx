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
import React from 'react'
import { SysAdminContentWrapper } from '@client/views/SysAdmin/SysAdminContentWrapper'
import { FormTabs } from '@opencrvs/components/lib/FormTabs'
import styled from 'styled-components'
import { useIntl } from 'react-intl'
import { BodyContent, Content } from '@opencrvs/components/lib/Content'
import { messages } from '@client/i18n/messages/views/config'
import {
  ListViewItemSimplified,
  ListViewSimplified
} from '@opencrvs/components/lib/ListViewSimplified'
import { Query } from '@client/components/Query'
import { GET_TOTAL_VSEXPORT } from './queries'
import {
  Label,
  Value
} from '@client/views/SysAdmin/Config/Application/Components'
import { LoadingIndicator } from '@client/views/OfficeHome/LoadingIndicator'
import { DynamicHeightLinkButton } from '@client/views/Settings/items/components'
import { GenericErrorToast } from '@client/components/GenericErrorToast'
import { Event, GetVsExportsQuery, VsExport } from '@client/utils/gateway'
import { Link } from '@client/../../components/lib'
import { chunk, sortBy } from 'lodash'
import { Pagination } from '@opencrvs/components/lib/Pagination'
import { Toast } from '@opencrvs/components/lib/Toast'

const DEFAULT_LIST_SIZE = 12

const UserTable = styled(BodyContent)`
  padding: 0px;
  margin: 8px auto 0;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    padding: 0px;
  }
`
type VSExportProps = {
  items: VsExport[]
}

async function downloadURI(uri: string, name: string) {
  await fetch(uri)
    .then((res) => {
      return res.blob()
    })
    .then((data) => {
      const a = document.createElement('a')
      a.href = window.URL.createObjectURL(data)
      a.download = name
      a.click()
    })
}

const VSExport = () => {
  const intl = useIntl()
  const [activeTabId, setActiveTabId] = React.useState(Event.Birth)
  const [documentDownloadError, setDocumentDownloadError] =
    React.useState(false)
  const tabSections = [
    {
      id: Event.Birth,
      title: intl.formatMessage(messages.birthTabTitleExport)
    },
    {
      id: Event.Death,
      title: intl.formatMessage(messages.deathTabTitleExport)
    }
  ]

  function TabContent(props: VSExportProps) {
    const items: VsExport[] = props.items
    const totalItems = items.length
    const [currentPageNumber, setCurrentPageNumber] = React.useState(1)
    const pages = chunk(items, DEFAULT_LIST_SIZE)
    const getPage = (pageNumber: number) => pages[pageNumber - 1]

    return (
      <>
        {sortBy(getPage(currentPageNumber), 'startDate').map(
          (item: VsExport) => {
            const fileName = intl.formatMessage(
              messages.vitalStatisticsExport,
              {
                month: intl.formatDate(new Date(item.startDate), {
                  month: 'long'
                }),
                event: item.event,
                fileSize: ''
              }
            )

            const label = intl.formatMessage(messages.vitalStatisticsExport, {
              month: intl.formatDate(new Date(item.startDate), {
                month: 'long'
              }),
              event: item.event,
              fileSize: item.fileSize
            })

            return (
              <ListViewSimplified
                key={`${item.createdOn}_${item.event}`}
                bottomBorder
              >
                <ListViewItemSimplified
                  compactLabel
                  label={
                    <Label id={`${item.createdOn}_label`}>
                      {new Date(item.startDate).getFullYear()}
                    </Label>
                  }
                  value={<Value id={`${item.createdOn}_value`}>{label}</Value>}
                  actions={
                    <DynamicHeightLinkButton
                      id={`${item.createdOn}_export_button`}
                      disabled={false}
                      onClick={async () => {
                        try {
                          await downloadURI(item.url, fileName.trim())
                        } catch (error) {
                          setDocumentDownloadError(true)
                        }
                      }}
                    >
                      {intl.formatMessage(messages.export)}
                    </DynamicHeightLinkButton>
                  }
                />
              </ListViewSimplified>
            )
          }
        )}
        {totalItems > 0 && (
          <Pagination
            currentPage={currentPageNumber}
            totalPages={Math.ceil(totalItems / DEFAULT_LIST_SIZE)}
            onPageChange={(page: any) => setCurrentPageNumber(page)}
          />
        )}
      </>
    )
  }

  // TODO: Replace with Frame component */

  return (
    <>
      <SysAdminContentWrapper
        id="vsexport-wrapper"
        hideBackground={true}
        isCertificatesConfigPage={true}
        headerTitle={intl.formatMessage(messages.vsexport)}
      >
        <UserTable id="vsexport_list">
          <Content
            title={intl.formatMessage(messages.vsexport)}
            titleColor={'copy'}
            subtitle={intl.formatMessage(messages.vsEmptyStateText, {
              posit: (
                <Link
                  onClick={() => {
                    window.open('https://posit.co/', '_blank')
                  }}
                  font="reg16"
                >
                  RStudio/Posit
                </Link>
              )
            })}
            tabBarContent={
              <FormTabs
                sections={tabSections}
                activeTabId={activeTabId}
                onTabClick={(id) => setActiveTabId(id)}
              />
            }
          >
            <Query<GetVsExportsQuery>
              query={GET_TOTAL_VSEXPORT}
              fetchPolicy={'no-cache'}
            >
              {({ data, loading, error }) => {
                if (error) {
                  return <GenericErrorToast />
                } else if (loading) {
                  return (
                    <>
                      <LoadingIndicator loading={true} />
                    </>
                  )
                } else {
                  const vsExports = data?.getVSExports?.results || []
                  return (
                    <>
                      <TabContent
                        items={vsExports.filter(
                          ({ event }) => event === activeTabId
                        )}
                      />
                    </>
                  )
                }
              }}
            </Query>
          </Content>
        </UserTable>
        {documentDownloadError && (
          <Toast
            id={`document_download_error_notification`}
            type={'error'}
            onClose={() => {
              setDocumentDownloadError(false)
            }}
          >
            {intl.formatMessage(messages.vsExportDownloadFailed)}
          </Toast>
        )}
      </SysAdminContentWrapper>
    </>
  )
}

export default VSExport
