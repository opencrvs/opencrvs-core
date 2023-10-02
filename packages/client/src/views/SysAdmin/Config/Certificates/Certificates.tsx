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
import styled from 'styled-components'
import { SysAdminContentWrapper } from '@client/views/SysAdmin/SysAdminContentWrapper'
import { TertiaryButton } from '@opencrvs/components/lib/buttons'
import { messages } from '@client/i18n/messages/views/config'
import { messages as imageUploadMessages } from '@client/i18n/messages/views/imageUpload'
import { buttonMessages } from '@client/i18n/messages/buttons'
import {
  ListViewItemSimplified,
  ListViewSimplified
} from '@opencrvs/components/lib/ListViewSimplified'
import { ToggleMenu } from '@opencrvs/components/lib/ToggleMenu'
import { Toast } from '@opencrvs/components/lib/Toast'
import { ResponsiveModal } from '@opencrvs/components/lib/ResponsiveModal'
import { EMPTY_STRING } from '@client/utils/constants'
import { certificateTemplateMutations } from '@client/certificate/mutations'
import { getScope, getUserDetails } from '@client/profile/profileSelectors'
import { Event } from '@client/utils/gateway'
import { IAttachmentValue, IForm } from '@client/forms'
import { DocumentPreview } from '@client/components/form/DocumentUploadfield/DocumentPreview'
import {
  getDummyCertificateTemplateData,
  getDummyDeclarationData
} from './previewDummyData'
import { getRegisterForm } from '@client/forms/register/declaration-selectors'
import {
  executeHandlebarsTemplate,
  printCertificate,
  downloadFile
} from '@client/views/PrintCertificate/PDFUtils'
import { Content } from '@opencrvs/components/lib/Content'
import {
  updateOfflineCertificate,
  updateOfflineConfigData
} from '@client/offline/actions'
import { Icon } from '@opencrvs/components/lib/Icon'

import { ICertificateTemplateData } from '@client/utils/referenceApi'
import { IDeclaration } from '@client/declarations'
import {
  ApplyButton,
  Field
} from '@client/views/SysAdmin/Config/Application/Components'
import { SimpleDocumentUploader } from '@client/components/form/DocumentUploadfield/SimpleDocumentUploader'
import { constantsMessages } from '@client/i18n/messages/constants'
import { FormTabs } from '@opencrvs/components/lib/FormTabs'
import { Link, Text, Toggle } from '@client/../../components/lib'
import { NOTIFICATION_STATUS } from '@client/views/SysAdmin/Config/Application/utils'
import { configApplicationMutations } from '@client/views/SysAdmin/Config/Application/mutations'
import { UserDetails } from '@client/utils/userUtils'

const Value = styled.span`
  ${({ theme }) => theme.fonts.reg16};
  margin-top: 15px;
  margin-bottom: 8px;
  max-width: 340px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    display: block;
  }
`

const ToggleWrapper = styled.div`
  margin-left: 24px;
`
const StyledText = styled.h6`
  ${({ theme }) => theme.fonts.h4}
  color: ${({ theme }) => theme.colors.copy};
  margin-top: 15px;
  margin-bottom: 8px;
`
const StyledSubtext = styled(Text)`
  flex: none;
  color: ${({ theme }) => theme.colors.grey500};
  order: 1;
  flex-grow: 0;
`

const StyledHeader = styled(ListViewItemSimplified)`
  color: ${({ theme }) => theme.colors.grey400};
`

export type Scope = string[]

export enum SVGFile {
  type = 'image/svg+xml'
}

type Props = WrappedComponentProps & {
  intl: IntlShape
  userDetails: UserDetails | null
  scope: Scope | null
  offlineResources: IOfflineData
  registerForm: {
    birth: IForm
    death: IForm
    marriage: IForm
  }
} & {
  updateOfflineCertificate: typeof updateOfflineCertificate
  updateOfflineConfigData: typeof updateOfflineConfigData
  state: IStoreState
}

interface State {
  selectedSubMenuItem: string
  imageUploading: boolean
  imageLoadingError: string
  showNotification: boolean
  notificationForPrinting: NOTIFICATION_STATUS
  showPrompt: boolean
  eventName: string
  previewImage: IAttachmentValue | null
  imageFile: IAttachmentValue
  activeTabId: Event
}

interface ICertification {
  id: string
  label: string
  value: string
  actionsMenu: JSX.Element
}

type CertificationProps = {
  item: ICertification
}

export const printDummyCertificate = async (
  event: string,
  registerForm: { birth: IForm; death: IForm; marriage: IForm },
  intl: IntlShape,
  userDetails: UserDetails,
  offlineData: IOfflineData,
  state: IStoreState
) => {
  const data = getDummyDeclarationData(event, registerForm)

  printCertificate(
    intl,
    { data, event } as IDeclaration,
    userDetails,
    offlineData,
    state
  )
}

class CertificatesConfigComponent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      activeTabId: Event.Birth,
      selectedSubMenuItem: this.SUB_MENU_ID.certificatesConfig,
      imageUploading: false,
      imageLoadingError: '',
      showNotification: false,
      notificationForPrinting: NOTIFICATION_STATUS.IDLE,
      showPrompt: false,
      eventName: '',
      previewImage: null,
      imageFile: {
        name: EMPTY_STRING,
        type: EMPTY_STRING,
        data: EMPTY_STRING
      }
    }
  }

  SUB_MENU_ID = {
    certificatesConfig: 'Certificates'
  }

  handleTabChange = (tab: Event) => {
    this.setState({ activeTabId: tab })
  }
  getMenuItems(
    intl: IntlShape,
    event: string,
    svgCode: string,
    svgFilename: string
  ) {
    const menuItems = [
      {
        label: intl.formatMessage(buttonMessages.preview),
        handler: async () => {
          const dummyTemplateData = getDummyCertificateTemplateData(
            event,
            this.props.registerForm
          )

          svgCode = executeHandlebarsTemplate(
            svgCode,
            dummyTemplateData,
            this.props.state
          )
          const linkSource = `data:${SVGFile.type};base64,${window.btoa(
            svgCode
          )}`
          this.setState({
            eventName: event,
            previewImage: { type: SVGFile.type, data: linkSource }
          })
        }
      },
      {
        label: intl.formatMessage(buttonMessages.print),
        handler: async () => {
          await printDummyCertificate(
            event,
            this.props.registerForm,
            intl,
            this.props.userDetails as UserDetails,
            this.props.offlineResources,
            this.props.state
          )
        }
      },
      {
        label: intl.formatMessage(messages.downloadTemplate),
        handler: () => {
          downloadFile(SVGFile.type, svgCode, svgFilename)
        }
      },
      {
        label: intl.formatMessage(buttonMessages.upload),
        handler: () => {
          this.setState({
            eventName: event
          })
          this.togglePrompt()
        }
      }
    ]
    return menuItems
  }

  handleSelectFile = async (certificateId: string) => {
    const status = 'ACTIVE'
    const userMgntUserID = this.props.userDetails?.userMgntUserID
    this.setState({
      imageUploading: true,
      imageLoadingError: ''
    })
    this.toggleNotification()

    // Convert base64 data to svg
    const svgCode = atob(this.state.imageFile.data.split(',')[1])

    this.updateCertificateTemplate(
      certificateId,
      svgCode,
      this.state.imageFile.name || '',
      userMgntUserID as string,
      status,
      this.state.eventName
    )
  }

  onUploadingStateChanged = (isUploading: boolean) => {
    this.setState({ ...this.state, imageUploading: isUploading })
  }

  handleCertificateFile(file: IAttachmentValue) {
    this.setState({
      ...this.state,
      imageFile: file
    })
  }

  toggleNotification = () => {
    this.setState((state) => ({
      showNotification: !state.showNotification
    }))
  }

  togglePrompt = () => {
    this.setState((prevState) => ({ showPrompt: !prevState.showPrompt }))
    this.setState({
      imageFile: {
        name: EMPTY_STRING,
        type: EMPTY_STRING,
        data: EMPTY_STRING
      }
    })
  }

  closePreviewSection = () => {
    this.setState({ previewImage: null })
  }

  onDelete = () => {
    this.closePreviewSection()
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
        event
      )
      if (res && res.createOrUpdateCertificateSVG) {
        this.setState({ imageUploading: false })
        this.props.updateOfflineCertificate(
          res.createOrUpdateCertificateSVG as ICertificateTemplateData
        )
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
    const {
      eventName,
      imageUploading,
      imageLoadingError,
      showNotification,
      showPrompt,
      activeTabId
    } = this.state

    const { intl, offlineResources } = this.props
    const tabSections = [
      {
        id: Event.Birth,
        title: intl.formatMessage(constantsMessages.births)
      },
      {
        id: Event.Death,
        title: intl.formatMessage(constantsMessages.deaths)
      },
      {
        id: Event.Marriage,
        title: intl.formatMessage(constantsMessages.marriages)
      }
    ]

    const birthCertFileName =
      offlineResources.templates.certificates?.birth.fileName
    const deathCertFileName =
      offlineResources.templates.certificates?.death.fileName
    const marriageCertFileName =
      offlineResources.templates.certificates?.marriage.fileName

    const birthLastModified =
      offlineResources.templates.certificates?.birth.lastModifiedDate
    const deathLastModified =
      offlineResources.templates.certificates?.death.lastModifiedDate
    const marriageLastModified =
      offlineResources.templates.certificates?.marriage.lastModifiedDate
    const CertificateSection = {
      title: intl.formatMessage(messages.listTitle),
      items: [
        {
          id: 'birth',
          label: intl.formatMessage(messages.certificateTemplate),
          value: birthLastModified
            ? intl.formatMessage(messages.eventUpdatedTempDesc, {
                lastModified: birthLastModified
              })
            : intl.formatMessage(messages.birthDefaultTempDesc),
          actionsMenu: (
            <>
              {offlineResources.templates.certificates?.birth && (
                <ToggleMenu
                  id={`template-birth-action-menu`}
                  toggleButton={
                    <Icon
                      name="DotsThreeVertical"
                      color="primary"
                      size="large"
                    />
                  }
                  menuItems={this.getMenuItems(
                    intl,
                    Event.Birth,
                    offlineResources.templates.certificates.birth.definition,
                    offlineResources.templates.certificates.birth.fileName
                  )}
                />
              )}
            </>
          )
        },
        {
          id: 'death',
          label: intl.formatMessage(messages.certificateTemplate),
          value: deathLastModified
            ? intl.formatMessage(messages.eventUpdatedTempDesc, {
                lastModified: deathLastModified
              })
            : intl.formatMessage(messages.deathDefaultTempDesc),
          actionsMenu: (
            <>
              {offlineResources.templates.certificates?.death && (
                <ToggleMenu
                  id={`template-death-action-menu`}
                  toggleButton={
                    <Icon
                      name="DotsThreeVertical"
                      color="primary"
                      size="large"
                    />
                  }
                  menuItems={this.getMenuItems(
                    intl,
                    Event.Death,
                    offlineResources.templates.certificates.death.definition,
                    offlineResources.templates.certificates.death.fileName
                  )}
                />
              )}
            </>
          )
        },
        {
          id: 'marriage',
          label: intl.formatMessage(messages.certificateTemplate),
          value: marriageLastModified
            ? intl.formatMessage(messages.eventUpdatedTempDesc, {
                lastModified: marriageLastModified
              })
            : intl.formatMessage(messages.marriageDefaultTempDesc),
          actionsMenu: (
            <>
              {offlineResources.templates.certificates?.marriage && (
                <ToggleMenu
                  id={`template-marriage-action-menu`}
                  toggleButton={
                    <Icon
                      name="DotsThreeVertical"
                      color="primary"
                      size="large"
                    />
                  }
                  menuItems={this.getMenuItems(
                    intl,
                    Event.Marriage,
                    offlineResources.templates.certificates.marriage.definition,
                    offlineResources.templates.certificates.marriage.fileName
                  )}
                />
              )}
            </>
          )
        }
      ]
    }

    let certificateFileName

    const toggleOnChange = async (event: Event) => {
      const upperCaseEvent = event.toUpperCase() as Uppercase<Event>

      this.props.updateOfflineConfigData({
        config: {
          ...offlineResources.config,
          [upperCaseEvent]: {
            ...offlineResources.config[upperCaseEvent],
            PRINT_IN_ADVANCE:
              !offlineResources.config[upperCaseEvent].PRINT_IN_ADVANCE
          }
        }
      })
      try {
        await configApplicationMutations.mutateApplicationConfig({
          [upperCaseEvent]: {
            PRINT_IN_ADVANCE:
              !offlineResources.config[upperCaseEvent].PRINT_IN_ADVANCE
          }
        })
        this.setState({
          notificationForPrinting: NOTIFICATION_STATUS.SUCCESS
        })
      } catch (err) {
        this.setState({
          notificationForPrinting: NOTIFICATION_STATUS.ERROR
        })
      }
    }

    const TabContent = (props: CertificationProps) => {
      certificateFileName =
        props.item.id === 'birth'
          ? birthCertFileName
          : props.item.id === 'death'
          ? deathCertFileName
          : marriageCertFileName

      return (
        <>
          <ListViewSimplified key={'certification'}>
            <StyledHeader
              key="template"
              label={
                <Text variant="bold14" element="p" color="grey400">
                  {intl.formatMessage(messages.template)}
                </Text>
              }
            />

            <ListViewItemSimplified
              compactLabel
              key={`${props.item.id}_file`}
              label={
                <div>
                  <StyledText>{props.item.label}</StyledText>
                </div>
              }
              value={
                <Value id={`${props.item.id}_value`}>
                  {certificateFileName}
                </Value>
              }
              actions={props.item.actionsMenu}
            />

            <StyledHeader
              key="options"
              label={
                <Text variant="bold14" element="p" color="grey400">
                  {intl.formatMessage(messages.options)}
                </Text>
              }
            />
            <ListViewItemSimplified
              key={`${props.item.id}`}
              label={
                <div>
                  <StyledText>
                    {intl.formatMessage(messages.allowPrinting)}
                  </StyledText>
                  <StyledSubtext element="p" variant="reg14">
                    {intl.formatMessage(messages.allowPrintingDescription)}
                  </StyledSubtext>
                </div>
              }
              actions={
                <ToggleWrapper>
                  <Toggle
                    id={'allow-printing-toggle'}
                    defaultChecked={
                      this.state.activeTabId === Event.Birth
                        ? offlineResources.config.BIRTH.PRINT_IN_ADVANCE
                        : this.state.activeTabId === Event.Death
                        ? offlineResources.config.DEATH.PRINT_IN_ADVANCE
                        : offlineResources.config.MARRIAGE.PRINT_IN_ADVANCE
                    }
                    onChange={async () => {
                      await toggleOnChange(this.state.activeTabId)
                    }}
                  />
                </ToggleWrapper>
              }
            />
          </ListViewSimplified>
        </>
      )
    }
    return (
      <>
        <SysAdminContentWrapper
          isCertificatesConfigPage={true}
          hideBackground={true}
        >
          {this.state.selectedSubMenuItem ===
            this.SUB_MENU_ID.certificatesConfig && (
            <Content
              title={CertificateSection.title}
              titleColor={'copy'}
              tabBarContent={
                <FormTabs
                  sections={tabSections}
                  activeTabId={activeTabId}
                  onTabClick={(id: Event) => this.handleTabChange(id)}
                />
              }
            >
              <>
                {intl.formatMessage(messages.listDetails)}
                <Link
                  id="certificate-instructions-link"
                  onClick={() => {
                    window.open(
                      'https://documentation.opencrvs.org/setup/4.-functional-configuration/4.4-configure-a-certificate-template',
                      '_blank',
                      'noopener,noreferrer'
                    )
                  }}
                >
                  {intl.formatMessage(messages.listDetailsQsn)}
                </Link>
              </>
              <TabContent
                item={
                  CertificateSection.items.find(
                    (item) => item.id === activeTabId
                  ) as ICertification
                }
              />
            </Content>
          )}
          {showNotification && (
            <Toast
              type={
                imageLoadingError
                  ? 'warning'
                  : this.state.imageUploading
                  ? 'loading'
                  : 'success'
              }
              onClose={
                imageUploading ? undefined : () => this.toggleNotification()
              }
            >
              <FormattedMessage
                {...(this.state.imageUploading
                  ? messages.certificateUploading
                  : !!this.state.imageLoadingError
                  ? messages.certificateValidationError
                  : messages.certificateUpdated)}
                values={{
                  eventName: !this.state.imageUploading
                    ? eventName.toUpperCase()[0] +
                      eventName.toLowerCase().slice(1)
                    : eventName
                }}
              />
            </Toast>
          )}

          {this.state.notificationForPrinting !== NOTIFICATION_STATUS.IDLE && (
            <Toast
              id="allow-printing-notification"
              type={
                this.state.notificationForPrinting ===
                NOTIFICATION_STATUS.SUCCESS
                  ? 'success'
                  : this.state.notificationForPrinting ===
                    NOTIFICATION_STATUS.IN_PROGRESS
                  ? 'loading'
                  : this.state.notificationForPrinting ===
                    NOTIFICATION_STATUS.ERROR
                  ? 'error'
                  : 'warning'
              }
              onClose={() =>
                this.setState({
                  notificationForPrinting: NOTIFICATION_STATUS.IDLE
                })
              }
            >
              {this.state.notificationForPrinting ===
              NOTIFICATION_STATUS.IN_PROGRESS
                ? intl.formatMessage(messages.applicationConfigUpdatingMessage)
                : this.state.notificationForPrinting ===
                  NOTIFICATION_STATUS.SUCCESS
                ? intl.formatMessage(messages.updateAllowPrintingNotification)
                : intl.formatMessage(messages.applicationConfigChangeError)}
            </Toast>
          )}

          <ResponsiveModal
            id="withoutVerificationPrompt"
            show={showPrompt}
            title={intl.formatMessage(messages.uploadCertificateDialogTitle)}
            autoHeight={true}
            handleClose={this.togglePrompt}
            actions={[
              <TertiaryButton
                id="cancel"
                key="cancel"
                onClick={this.togglePrompt}
              >
                {intl.formatMessage(messages.uploadCertificateDialogCancel)}
              </TertiaryButton>,
              <ApplyButton
                key="apply"
                id="apply_change"
                disabled={!Boolean(this.state.imageFile.name)}
                onClick={() => {
                  this.togglePrompt()
                  if (eventName === Event.Birth) {
                    this.handleSelectFile(
                      `${offlineResources.templates.certificates?.birth.id}`
                    )
                  } else if (eventName === Event.Death) {
                    this.handleSelectFile(
                      `${offlineResources.templates.certificates?.death.id}`
                    )
                  } else if (eventName === Event.Marriage) {
                    this.handleSelectFile(
                      `${offlineResources.templates.certificates?.marriage.id}`
                    )
                  }
                }}
              >
                {intl.formatMessage(buttonMessages.apply)}
              </ApplyButton>
            ]}
          >
            {intl.formatMessage(messages.uploadCertificateDialogDescription)}
            <Field id="certificate">
              <SimpleDocumentUploader
                label={
                  this.state.imageFile.name ? this.state.imageFile.name : ''
                }
                disableDeleteInPreview={false}
                name="Simple"
                allowedDocType={[SVGFile.type]}
                key="cancel"
                onComplete={(file) => {
                  this.handleCertificateFile(file as IAttachmentValue)
                }}
                files={this.state.imageFile}
                onUploadingStateChanged={this.onUploadingStateChanged}
                previewTransformer={(file) => {
                  const dummyTemplateData = getDummyCertificateTemplateData(
                    this.state.eventName,
                    this.props.registerForm
                  )
                  let svgCode = atob(file.data.split(',')[1])
                  svgCode = executeHandlebarsTemplate(
                    svgCode,
                    dummyTemplateData,
                    this.props.state
                  )
                  const data = `data:${SVGFile.type};base64,${window.btoa(
                    svgCode
                  )}`
                  return { ...file, data }
                }}
              />
            </Field>
          </ResponsiveModal>
          {this.state.previewImage && (
            <DocumentPreview
              previewImage={this.state.previewImage}
              disableDelete={true}
              title={
                eventName === Event.Birth
                  ? intl.formatMessage(messages.birthTemplate)
                  : eventName === Event.Death
                  ? intl.formatMessage(messages.deathTemplate)
                  : intl.formatMessage(messages.marriageTemplate)
              }
              goBack={this.closePreviewSection}
              onDelete={this.onDelete}
            />
          )}
        </SysAdminContentWrapper>
      </>
    )
  }
}

function mapStateToProps(state: IStoreState) {
  return {
    offlineResources: getOfflineData(state),
    registerForm: getRegisterForm(state),
    userDetails: getUserDetails(state),
    scope: getScope(state),
    state
  }
}

export const CertificatesConfig = connect(mapStateToProps, {
  updateOfflineConfigData,
  updateOfflineCertificate
})(injectIntl(CertificatesConfigComponent))
