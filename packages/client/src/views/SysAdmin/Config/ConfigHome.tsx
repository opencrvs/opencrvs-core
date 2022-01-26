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
import { IOfflineData } from '@client/offline/reducer'
import { getOfflineData } from '@client/offline/selectors'
import { IStoreState } from '@client/store'
import * as React from 'react'
import {
  FormattedMessage,
  injectIntl,
  IntlShape,
  WrappedComponentProps
} from 'react-intl'
import { connect } from 'react-redux'
import { RouteComponentProps } from 'react-router'
import styled from 'styled-components'
import { SysAdminContentWrapper } from '@client/views/SysAdmin/SysAdminContentWrapper'
import { Button } from '@opencrvs/components/lib/buttons'
import { messages } from '@client/i18n/messages/views/config'
import { messages as imageUploadMessages } from '@client/i18n/messages/views/imageUpload'
import {
  DataSection,
  FloatingNotification,
  NOTIFICATION_TYPE,
  ToggleMenu,
  TopBar
} from '@opencrvs/components/lib/interface'
import { VerticalThreeDots } from '@opencrvs/components/lib/icons'
import { ALLOWED_IMAGE_TYPE_FOR_CERTIFICATE_TEMPLATE } from '@client/utils/constants'
import {
  ERROR_TYPES,
  IImage,
  validateCertificateTemplate
} from '@client/utils/imageUtils'
import { GET_ACTIVE_CERTIFICATES } from '@client/certificate/queries'
import { Query } from '@client/components/Query'
import { errorMessages } from '@client/i18n/messages/errors'
import * as _ from 'lodash'
import { formatLongDate } from '@client/utils/date-formatting'
import { certificateTemplateMutations } from '@client/certificate/mutations'
import { GET_USER } from '@client/user/queries'
import { getScope, getUserDetails } from '@client/profile/profileSelectors'
import { IUserDetails } from '@client/utils/userUtils'

const SubMenuTab = styled(Button)<{ active: boolean }>`
  color: ${({ theme }) => theme.colors.copy};
  ${({ theme }) => theme.fonts.subtitleStyle};
  margin-left: 88px;
  padding-top: 15px;
  padding-bottom: 12px;
  border-radius: 0;
  flex-shrink: 0;
  outline: none;

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    margin-left: 8px;
  }
  ${({ active }) =>
    active
      ? 'border-bottom: 3px solid #5E93ED'
      : 'border-bottom: 3px solid transparent'};
  & > div {
    padding: 0 8px;
  }
  :first-child > div {
    position: relative;
    padding-left: 0;
  }
  & div > div {
    margin-right: 8px;
  }
  &:focus {
    outline: none;
    background: ${({ theme }) => theme.colors.focus};
    color: ${({ theme }) => theme.colors.copy};
  }
  &:not([data-focus-visible-added]) {
    background: transparent;
    outline: none;
    color: ${({ theme }) => theme.colors.copy};
  }
`
const HiddenInput = styled.input`
  display: none;
`

const ColoredDataSection = styled.div`
  background-color: ${({ theme }) => theme.colors.white};
  width: 776px;
  position: absolute;
  top: 81px;
  left: 162px;
  padding-left: 32px;
  padding-right: 47px;
  padding-bottom: 37px;
  border: 1px solid '#D7DCDE';
  box-sizing: border-box;
  border-radius: 4px;
`

const ListTitleDiv = styled.div`
  width: 645px;
  height: 46px;
  ${({ theme }) => theme.fonts.bodyStyle};
`

const BlueTitle = styled.span`
  color: ${({ theme }) => theme.colors.tertiary};
`

const TopBarContainer = styled.div`
  position: absolute;
  left: 0px;
  top: 64px;
  width: 100%;
  height: 48px;
`
const ErrorText = styled.div`
  color: ${({ theme }) => theme.colors};
  ${({ theme }) => theme.fonts.bodyStyle};
  text-align: center;
  margin-top: 100px;
`
export type Scope = string[]

type Props = WrappedComponentProps &
  Pick<RouteComponentProps, 'history'> & {
    offlineCountryConfiguration: IOfflineData
    userDetails: IUserDetails | null
    scope: Scope | null
  }

interface State {
  selectedSubMenuItem: string
  imageUploading: boolean
  imageLoadingError: string
  showNotification: boolean
  eventName: string
}

const SUB_MENU_ID = {
  certificatesConfig: 'Certificates'
}
function getMenuItems(
  intl: IntlShape,
  fileUploader: React.RefObject<HTMLInputElement>,
  id: string
) {
  const menuItems = [
    {
      label: intl.formatMessage(messages.previewTemplate),
      handler: () => {
        alert('Preview clicked')
      }
    },
    {
      label: intl.formatMessage(messages.printTemplate),
      handler: () => {
        alert('Print clicked')
      }
    },
    {
      label: intl.formatMessage(messages.downloadTemplate),
      handler: () => {
        alert('Download clicked')
      }
    },
    {
      label: intl.formatMessage(messages.uploadTemplate),
      handler: () => {
        fileUploader.current!.click()
      }
    }
  ]
  return menuItems
}
class ConfigHomeComponent extends React.Component<Props, State> {
  birthCertificatefileUploader: React.RefObject<HTMLInputElement>
  deathCertificatefileUploader: React.RefObject<HTMLInputElement>
  constructor(props: Props) {
    super(props)
    this.birthCertificatefileUploader = React.createRef()
    this.deathCertificatefileUploader = React.createRef()
    this.state = {
      selectedSubMenuItem: '',
      imageUploading: false,
      imageLoadingError: '',
      showNotification: false,
      eventName: ''
    }
  }
  handleSelectFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const { id, files } = event.target
    const eventName: string = id.split('_')[0]
    const certificateId: string = id.split('_')[4]
    const status = 'ACTIVE'
    const userMgntUserID =
      this.props.userDetails && this.props.userDetails.userMgntUserID
    this.setState({
      imageUploading: true,
      eventName: eventName[0].toUpperCase() + eventName.slice(1)
    })
    this.toggleNotification()

    if (files && files.length > 0) {
      try {
        const svgCode = await validateCertificateTemplate(files[0])
        this.updateCertificateTemplate(
          certificateId,
          svgCode,
          files[0].name,
          userMgntUserID as string,
          status,
          eventName
        )
        this.birthCertificatefileUploader.current!.value = ''
        this.deathCertificatefileUploader.current!.value = ''
      } catch (error) {
        if (error.type === ERROR_TYPES.IMAGE_TYPE) {
          this.setState(() => ({
            imageUploading: false,
            imageLoadingError: this.props.intl.formatMessage(
              imageUploadMessages.imageFormat
            )
          }))
          this.birthCertificatefileUploader.current!.value = ''
          this.deathCertificatefileUploader.current!.value = ''
        }
      }
    }
  }

  toggleNotification = () => {
    this.setState((state) => ({
      showNotification: !state.showNotification
    }))
  }

  async updateCertificateTemplate(
    id: string,
    svgCode: string,
    svgFilename: string,
    user: string,
    status: string,
    event: string
  ) {
    try {
      const res = await certificateTemplateMutations.updateCertificateTemplate(
        id,
        svgCode,
        svgFilename,
        user,
        status,
        event,
        [
          {
            query: GET_ACTIVE_CERTIFICATES
          }
        ]
      )
      if (res && res.data) {
        this.setState({ imageUploading: false })
      }
    } catch (err) {
      this.setState({
        imageLoadingError: this.props.intl.formatMessage(
          imageUploadMessages.imageFormat
        )
      })
    }
  }

  render() {
    const { intl } = this.props

    const CertificateSection = {
      title: intl.formatMessage(messages.listTitle),
      items: [
        {
          id: 'birth',
          label: intl.formatMessage(messages.birthTemplate),
          value: intl.formatMessage(messages.birthDefaultTempDesc),
          actionsMenu: (
            <ToggleMenu
              id={`template-birth-action-menu`}
              toggleButton={<VerticalThreeDots />}
              menuItems={getMenuItems(
                intl,
                this.birthCertificatefileUploader,
                'birth'
              )}
            />
          )
        },
        {
          id: 'death',
          label: intl.formatMessage(messages.deathTemplate),
          value: intl.formatMessage(messages.deathDefaultTempDesc),
          actionsMenu: (
            <ToggleMenu
              id={`template-death-action-menu`}
              toggleButton={<VerticalThreeDots />}
              menuItems={getMenuItems(
                intl,
                this.deathCertificatefileUploader,
                'death'
              )}
            />
          )
        }
      ]
    }

    return (
      <Query query={GET_ACTIVE_CERTIFICATES} fetchPolicy={'cache-and-network'}>
        {({ data, loading, error }) => {
          if (error) {
            console.log('error', error)
            return (
              <ErrorText id="user_loading_error">
                {intl.formatMessage(errorMessages.userQueryError)}
              </ErrorText>
            )
          } else {
            const birthCertificateTemplate = _.find(
              data.getActiveCertificatesSVG,
              {
                event: 'birth'
              }
            )
            const deathCertificateTemplate = _.find(
              data.getActiveCertificatesSVG,
              {
                event: 'death'
              }
            )

            const birthLongDate =
              birthCertificateTemplate &&
              formatLongDate(
                new Date(
                  parseInt(birthCertificateTemplate.svgDateUpdated)
                ).toString(),
                intl.locale,
                'LL'
              )
            const deathLongDate =
              deathCertificateTemplate &&
              formatLongDate(
                new Date(
                  parseInt(deathCertificateTemplate.svgDateUpdated)
                ).toString(),
                intl.locale,
                'LL'
              )
            const CertificateSection = {
              title: intl.formatMessage(messages.listTitle),
              items: [
                {
                  id: 'birth',
                  label: intl.formatMessage(messages.birthTemplate),
                  value: intl.formatMessage(messages.birthDefaultTempDesc),
                  actionsMenu: (
                    <>
                      <ToggleMenu
                        id={`template-birth-action-menu`}
                        toggleButton={<VerticalThreeDots />}
                        menuItems={getMenuItems(
                          intl,
                          this.birthCertificatefileUploader,
                          birthCertificateTemplate &&
                            birthCertificateTemplate._id
                        )}
                      />
                      <HiddenInput
                        ref={this.birthCertificatefileUploader}
                        id={`birth_file_uploader_field_${
                          birthCertificateTemplate &&
                          birthCertificateTemplate._id
                        }`}
                        type="file"
                        accept={ALLOWED_IMAGE_TYPE_FOR_CERTIFICATE_TEMPLATE.join(
                          ','
                        )}
                        onChange={this.handleSelectFile}
                      />
                    </>
                  )
                },
                {
                  id: 'death',
                  label: intl.formatMessage(messages.deathTemplate),
                  value: intl.formatMessage(messages.deathDefaultTempDesc),
                  actionsMenu: (
                    <>
                      <ToggleMenu
                        id={`template-death-action-menu`}
                        toggleButton={<VerticalThreeDots />}
                        menuItems={getMenuItems(
                          intl,
                          this.deathCertificatefileUploader,
                          deathCertificateTemplate &&
                            deathCertificateTemplate._id
                        )}
                      />
                      <HiddenInput
                        ref={this.deathCertificatefileUploader}
                        id={`death_file_uploader_field_${
                          deathCertificateTemplate &&
                          deathCertificateTemplate._id
                        }`}
                        type="file"
                        accept={ALLOWED_IMAGE_TYPE_FOR_CERTIFICATE_TEMPLATE.join(
                          ','
                        )}
                        onChange={this.handleSelectFile}
                      />
                    </>
                  )
                }
              ]
            }

            CertificateSection.items.map((item) =>
              _.mapValues(item, (val) => {
                if (val === 'birth') {
                  item.value = intl.formatMessage(
                    messages.birthUpdatedTempDesc,
                    { birthLongDate }
                  )
                } else if (val === 'death') {
                  item.value = intl.formatMessage(
                    messages.deathUpdatedTempDesc,
                    { deathLongDate }
                  )
                }
              })
            )
            return (
              <>
                <SysAdminContentWrapper
                  subMenuComponent={
                    <TopBarContainer>
                      <TopBar id="top-bar">
                        <SubMenuTab
                          id={`tab_${SUB_MENU_ID.certificatesConfig}`}
                          key={SUB_MENU_ID.certificatesConfig}
                          active={
                            this.state.selectedSubMenuItem ===
                            SUB_MENU_ID.certificatesConfig
                          }
                          onClick={() =>
                            this.setState({
                              selectedSubMenuItem:
                                SUB_MENU_ID.certificatesConfig
                            })
                          }
                        >
                          {SUB_MENU_ID.certificatesConfig}
                        </SubMenuTab>
                      </TopBar>
                    </TopBarContainer>
                  }
                  isCertificatesConfigPage={true}
                >
                  {this.state.selectedSubMenuItem ===
                    SUB_MENU_ID.certificatesConfig && (
                    <ColoredDataSection>
                      <DataSection
                        title={CertificateSection.title}
                        items={CertificateSection.items}
                        responsiveContents={
                          <ListTitleDiv>
                            {intl.formatMessage(messages.listDetails)}
                            <BlueTitle>
                              {intl.formatMessage(messages.listDetailsQsn)}
                            </BlueTitle>
                          </ListTitleDiv>
                        }
                        isConfigPage={true}
                      />
                    </ColoredDataSection>
                  )}
                  <FloatingNotification
                    type={
                      this.state.imageLoadingError
                        ? NOTIFICATION_TYPE.ERROR
                        : this.state.imageUploading
                        ? NOTIFICATION_TYPE.IN_PROGRESS
                        : NOTIFICATION_TYPE.SUCCESS
                    }
                    show={this.state.showNotification}
                    callback={
                      this.state.imageUploading
                        ? undefined
                        : () => this.toggleNotification()
                    }
                  >
                    <FormattedMessage
                      {...(this.state.imageUploading
                        ? messages.certificateUploading
                        : !!this.state.imageLoadingError
                        ? messages.certificateValidationError
                        : messages.certificateUpdated)}
                      values={{
                        eventName: this.state.imageUploading
                          ? this.state.eventName.toLowerCase()
                          : this.state.eventName
                      }}
                    />
                  </FloatingNotification>
                </SysAdminContentWrapper>
              </>
            )
          }
        }}
      </Query>
    )
  }
}

function mapStateToProps(state: IStoreState) {
  return {
    offlineCountryConfiguration: getOfflineData(state),
    userDetails: getUserDetails(state),
    scope: getScope(state)
  }
}

export const ConfigHome = connect(mapStateToProps)(
  injectIntl(ConfigHomeComponent)
)
