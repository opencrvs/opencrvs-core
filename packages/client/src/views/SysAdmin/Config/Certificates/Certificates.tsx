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
import styled from 'styled-components'
import { SysAdminContentWrapper } from '@client/views/SysAdmin/SysAdminContentWrapper'
import { LinkButton, TertiaryButton } from '@opencrvs/components/lib/buttons'
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
import { VerticalThreeDots } from '@opencrvs/components/lib/icons'
import { EMPTY_STRING } from '@client/utils/constants'
import { certificateTemplateMutations } from '@client/certificate/mutations'
import { getScope, getUserDetails } from '@client/profile/profileSelectors'
import { IUserDetails } from '@client/utils/userUtils'
import { IAttachmentValue, IForm } from '@client/forms'
import { Event } from '@client/utils/gateway'
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
import { updateOfflineCertificate } from '@client/offline/actions'
import { ICertificateTemplateData } from '@client/utils/referenceApi'
import { IDeclaration } from '@client/declarations'
import {
  ApplyButton,
  Field
} from '@client/views/SysAdmin/Config/Application/Components'
import { SimpleDocumentUploader } from '@client/components/form/DocumentUploadfield/SimpleDocumentUploader'
import { constantsMessages } from '@client/i18n/messages/constants'
import { FormTabs } from '@opencrvs/components/lib/FormTabs'
import { ISVGTemplate as File } from '@client/pdfRenderer/transformer/types'
import { Link, Toggle } from '@client/../../components/lib'

const ListViewContainer = styled.div`
  margin-top: 24px;
`

const Label = styled.span`
  ${({ theme }) => theme.fonts.bold16};
`
const Value = styled.span`
  ${({ theme }) => theme.fonts.reg16}
`

export type Scope = string[]

export enum SVGFile {
  type = 'image/svg+xml'
}

type Props = WrappedComponentProps & {
  intl: IntlShape
  userDetails: IUserDetails | null
  scope: Scope | null
  offlineResources: IOfflineData
  registerForm: {
    birth: IForm
    death: IForm
  }
} & { updateOfflineCertificate: typeof updateOfflineCertificate }

interface State {
  selectedSubMenuItem: string
  imageUploading: boolean
  imageLoadingError: string
  showNotification: boolean
  showPrompt: boolean
  eventName: string
  previewImage: IAttachmentValue | null
  imageFile: IAttachmentValue
  activeTabId: Event
  allowPrinting: boolean
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

function blobToBase64(blob: Blob): Promise<string | null | ArrayBuffer> {
  return new Promise((resolve, _) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.readAsDataURL(blob)
  })
}

async function updatePreviewSvgWithSampleSignature(
  svgCode: string
): Promise<string> {
  const html = document.createElement('html')
  if (svgCode.includes('data:image/svg+xml;base64')) {
    svgCode = atob(svgCode.split(',')[1])
  }
  html.innerHTML = svgCode

  const certificateImages = html.querySelectorAll('image')
  const signatureImage = Array.from(certificateImages).find(
    (image) => image.getAttribute('data-content') === 'signature'
  )

  if (signatureImage) {
    const baseURL = window.location.origin
    const res = await fetch(`${baseURL}/assets/sample-signature.png`)
    const blob = await res.blob()
    const base64signature = await blobToBase64(blob)
    signatureImage.setAttribute('xlink:href', base64signature as string)
  }
  svgCode = html.getElementsByTagName('svg')[0].outerHTML
  return unescape(encodeURIComponent(svgCode))
}

export const printDummyCertificate = async (
  event: string,
  registerForm: { birth: IForm; death: IForm },
  intl: IntlShape,
  userDetails: IUserDetails,
  offlineData: IOfflineData
) => {
  const data = getDummyDeclarationData(event, registerForm)
  let certEvent: Event
  if (event === 'death') {
    certEvent = Event.Death
  } else {
    certEvent = Event.Birth
  }
  const updatedOfflineData: IOfflineData = {
    ...offlineData,
    templates: {
      ...offlineData.templates,
      certificates: {
        ...offlineData.templates.certificates!,
        [certEvent]: {
          ...offlineData.templates.certificates![certEvent]!,
          definition: await updatePreviewSvgWithSampleSignature(
            offlineData.templates.certificates![certEvent].definition
          )
        }
      }
    }
  }

  printCertificate(
    intl,
    { data, event } as IDeclaration,
    userDetails,
    updatedOfflineData
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
      showPrompt: false,
      eventName: '',
      previewImage: null,
      imageFile: {
        name: EMPTY_STRING,
        type: EMPTY_STRING,
        data: EMPTY_STRING
      },
      allowPrinting: false
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

          svgCode = executeHandlebarsTemplate(svgCode, dummyTemplateData)
          svgCode = await updatePreviewSvgWithSampleSignature(svgCode)
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
            this.props.userDetails as IUserDetails,
            this.props.offlineResources
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

    const ToggleWrapper = styled.div`
      margin-left: 24px;
    `
    const { intl, offlineResources } = this.props
    const tabSections = [
      {
        id: Event.Birth,
        title: intl.formatMessage(constantsMessages.births)
      },
      {
        id: Event.Death,
        title: intl.formatMessage(constantsMessages.deaths)
      }
    ]

    const birthCertFileName =
      offlineResources.templates.certificates?.birth.fileName
    const deathCertFileName =
      offlineResources.templates.certificates?.death.fileName

    const birthLastModified =
      offlineResources.templates.certificates?.birth.lastModifiedDate
    const deathLastModified =
      offlineResources.templates.certificates?.death.lastModifiedDate

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
                  toggleButton={<VerticalThreeDots />}
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
                  toggleButton={<VerticalThreeDots />}
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
        }
      ]
    }

    let certificateFileName

    const toggleOnChange = () => {
      this.setState({
        allowPrinting: !this.state.allowPrinting
      })
    }

    const TabContent = (props: CertificationProps) => {
      certificateFileName =
        props.item.id === 'birth' ? birthCertFileName : deathCertFileName

      return (
        <>
          <ListViewSimplified key={1}>
            <ListViewItemSimplified
              compactLabel
              key={`${props.item.id}`}
              label={props.item.label}
              value={
                <Value id={`${props.item.id}_value`}>
                  {certificateFileName}
                </Value>
              }
              actions={props.item.actionsMenu}
            />

            <ListViewItemSimplified
              key={`${props.item.id}`}
              label={intl.formatMessage(messages.allowPrinting)}
              actions={
                <ToggleWrapper>
                  <Toggle
                    id={'toggle'}
                    defaultChecked={true}
                    onChange={() => toggleOnChange()}
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
                  onTabClick={(id) => this.handleTabChange(id)}
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
              {/* <ListViewContainer>
                <ListViewSimplified>
                  {CertificateSection.items.map((item) => {
                    return (
                      <ListViewItemSimplified
                        key={item.id}
                        label={
                          <Label id={`${item.id}_label`}>{item.label}</Label>
                        }
                        value={
                          <Value id={`${item.id}_value`}>{item.value}</Value>
                        }
                        actions={item.actionsMenu}
                      />
                    )
                  })}
                </ListViewSimplified>
              </ListViewContainer> */}

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
                  } else if (eventName === Event.Death)
                    this.handleSelectFile(
                      `${offlineResources.templates.certificates?.death.id}`
                    )
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
                    dummyTemplateData
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
                  : intl.formatMessage(messages.deathTemplate)
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
    scope: getScope(state)
  }
}

export const CertificatesConfig = connect(mapStateToProps, {
  updateOfflineCertificate
})(injectIntl(CertificatesConfigComponent))
