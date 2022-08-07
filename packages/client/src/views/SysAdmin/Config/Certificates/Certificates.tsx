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
import {
  LinkButton,
  PrimaryButton,
  TertiaryButton
} from '@opencrvs/components/lib/buttons'
import { messages } from '@client/i18n/messages/views/config'
import { messages as imageUploadMessages } from '@client/i18n/messages/views/imageUpload'
import { buttonMessages } from '@client/i18n/messages/buttons'
import {
  FloatingNotification,
  NOTIFICATION_TYPE,
  ResponsiveModal,
  ToggleMenu
} from '@opencrvs/components/lib/interface'
import { VerticalThreeDots } from '@opencrvs/components/lib/icons'
import { ALLOWED_IMAGE_TYPE_FOR_CERTIFICATE_TEMPLATE } from '@client/utils/constants'
import {
  ERROR_TYPES,
  validateCertificateTemplate
} from '@client/utils/imageUtils'
import { certificateTemplateMutations } from '@client/certificate/mutations'
import { getScope, getUserDetails } from '@client/profile/profileSelectors'
import { IUserDetails } from '@client/utils/userUtils'
import { IAttachmentValue, IFormFieldValue, IForm } from '@client/forms'
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
import { Content } from '@opencrvs/components/lib/interface/Content'
import {
  ListViewSimplified,
  ListViewItemSimplified
} from '@opencrvs/components/lib/interface/ListViewSimplified/ListViewSimplified'
import { updateOfflineCertificate } from '@client/offline/actions'
import { ICertificateTemplateData } from '@client/utils/referenceApi'
import { IDeclaration } from '@client/declarations'

const HiddenInput = styled.input`
  display: none;
`

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

type Props = WrappedComponentProps &
  Pick<RouteComponentProps, 'history'> & {
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
}

function blobToBase64(blob: Blob): Promise<string | null | ArrayBuffer> {
  return new Promise((resolve, _) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result)
    reader.readAsDataURL(blob)
  })
}

async function updatePreviewSvgWithSampleSignature(
  svgCode: string
): Promise<string> {
  const html = document.createElement('html')
  html.innerHTML = svgCode
  const certificateImages = html.querySelectorAll('image')
  const signatureImage = Array.from(certificateImages).find(
    (image) => image.getAttribute('data-content') === 'signature'
  )
  if (signatureImage) {
    const res = await fetch('/assets/sample-signature.png')
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
  birthCertificatefileUploader: React.RefObject<HTMLInputElement>
  deathCertificatefileUploader: React.RefObject<HTMLInputElement>
  constructor(props: Props) {
    super(props)
    this.birthCertificatefileUploader = React.createRef()
    this.deathCertificatefileUploader = React.createRef()
    this.state = {
      selectedSubMenuItem: this.SUB_MENU_ID.certificatesConfig,
      imageUploading: false,
      imageLoadingError: '',
      showNotification: false,
      showPrompt: false,
      eventName: '',
      previewImage: null
    }
  }

  SUB_MENU_ID = {
    certificatesConfig: 'Certificates'
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
  handleSelectFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const { id, files } = event.target
    const eventName: string = id.split('_')[0]
    const certificateId: string = id.split('_')[4]
    const status = 'ACTIVE'
    const userMgntUserID =
      this.props.userDetails && this.props.userDetails.userMgntUserID
    this.setState({
      imageUploading: true,
      imageLoadingError: ''
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
        if (
          error instanceof Error &&
          error.message === ERROR_TYPES.IMAGE_TYPE
        ) {
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

  togglePrompt = () => {
    this.setState((prevState) => ({ showPrompt: !prevState.showPrompt }))
  }

  selectForPreview = (previewImage: IAttachmentValue) => {
    this.setState({ previewImage: previewImage })
  }

  closePreviewSection = () => {
    this.setState({ previewImage: null })
  }

  onDelete = (image: IFormFieldValue) => {
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
      showPrompt
    } = this.state

    const { intl, offlineResources } = this.props
    const birthLastModified =
      offlineResources.templates.certificates?.birth.lastModifiedDate
    const deathLastModified =
      offlineResources.templates.certificates?.death.lastModifiedDate
    const CertificateSection = {
      title: intl.formatMessage(messages.listTitle),
      items: [
        {
          id: 'birth',
          label: intl.formatMessage(messages.birthTemplate),
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
              <HiddenInput
                ref={this.birthCertificatefileUploader}
                id={`birth_file_uploader_field_${offlineResources.templates.certificates?.birth.id}`}
                type="file"
                accept={ALLOWED_IMAGE_TYPE_FOR_CERTIFICATE_TEMPLATE.join(',')}
                onChange={this.handleSelectFile}
              />
            </>
          )
        },
        {
          id: 'death',
          label: intl.formatMessage(messages.deathTemplate),
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
              <HiddenInput
                ref={this.deathCertificatefileUploader}
                id={`death_file_uploader_field_${offlineResources.templates.certificates?.death.id}`}
                type="file"
                accept={ALLOWED_IMAGE_TYPE_FOR_CERTIFICATE_TEMPLATE.join(',')}
                onChange={this.handleSelectFile}
              />
            </>
          )
        }
      ]
    }
    return (
      <>
        <SysAdminContentWrapper
          isCertificatesConfigPage={true}
          hideBackground={true}
        >
          {this.state.selectedSubMenuItem ===
            this.SUB_MENU_ID.certificatesConfig && (
            <Content title={CertificateSection.title} titleColor={'copy'}>
              <>
                {intl.formatMessage(messages.listDetails)}
                <LinkButton
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
                </LinkButton>
              </>
              <ListViewContainer>
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
              </ListViewContainer>
            </Content>
          )}
          <FloatingNotification
            type={
              imageLoadingError
                ? NOTIFICATION_TYPE.ERROR
                : this.state.imageUploading
                ? NOTIFICATION_TYPE.IN_PROGRESS
                : NOTIFICATION_TYPE.SUCCESS
            }
            show={showNotification}
            callback={
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
          </FloatingNotification>
          <ResponsiveModal
            id="withoutVerificationPrompt"
            show={showPrompt}
            title={intl.formatMessage(messages.uploadCertificateDialogTitle)}
            contentHeight={96}
            handleClose={this.togglePrompt}
            actions={[
              <TertiaryButton
                id="cancel"
                key="cancel"
                onClick={this.togglePrompt}
              >
                {intl.formatMessage(messages.uploadCertificateDialogCancel)}
              </TertiaryButton>,
              <PrimaryButton
                id="send"
                key="continue"
                onClick={() => {
                  this.togglePrompt()
                  if (eventName === Event.Birth)
                    this.birthCertificatefileUploader.current!.click()
                  else if (eventName === Event.Death)
                    this.deathCertificatefileUploader.current!.click()
                }}
              >
                {intl.formatMessage(messages.uploadCertificateDialogConfirm)}
              </PrimaryButton>
            ]}
          >
            {intl.formatMessage(messages.uploadCertificateDialogDescription)}
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
