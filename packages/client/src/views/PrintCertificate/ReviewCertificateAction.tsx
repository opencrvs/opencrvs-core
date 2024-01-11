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
import {
  PrimaryButton,
  SuccessButton,
  DangerButton,
  TertiaryButton
} from '@opencrvs/components/lib/buttons'
import { Check } from '@opencrvs/components/lib/icons'
import { Content } from '@opencrvs/components/lib/Content'

import { ActionPageLight } from '@opencrvs/components/lib/ActionPageLight'
import { ResponsiveModal } from '@opencrvs/components/lib/ResponsiveModal'
import {
  IPrintableDeclaration,
  modifyDeclaration,
  writeDeclaration,
  storeDeclaration,
  SUBMISSION_STATUS
} from '@opencrvs/client/src/declarations'
import { SubmissionAction, CorrectionSection } from '@client/forms'
import { Event } from '@client/utils/gateway'
import { buttonMessages } from '@client/i18n/messages/buttons'
import { messages as certificateMessages } from '@client/i18n/messages/views/certificate'
import {
  goToHomeTab,
  goBack,
  goToCertificateCorrection,
  formatUrl
} from '@client/navigation'
import { IStoreState } from '@client/store'
import styled from 'styled-components'
import * as React from 'react'
import { WrappedComponentProps as IntlShapeProps, injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import { Redirect, RouteComponentProps } from 'react-router'
import { getUserDetails, getScope } from '@client/profile/profileSelectors'
import {
  previewCertificate,
  printCertificate
} from '@client/views/PrintCertificate/PDFUtils'
import { getEventRegisterForm } from '@client/forms/register/declaration-selectors'
import {
  getCountryTranslations,
  isCertificateForPrintInAdvance,
  getEventDate,
  isFreeOfCost,
  calculatePrice,
  getRegisteredDate
} from './utils'
import { getOfflineData } from '@client/offline/selectors'
import { countries } from '@client/utils/countries'
import { PDFViewer } from '@opencrvs/components/lib/PDFViewer'
import { WORKQUEUE_TABS } from '@client/components/interface/Navigation'
import { hasRegisterScope } from '@client/utils/authUtils'
import { REGISTRAR_HOME_TAB } from '@client/navigation/routes'

const CustomTertiaryButton = styled(TertiaryButton)`
  height: 48px;
  &:disabled {
    background: ${({ theme }) => theme.colors.white};
    color: ${({ theme }) => theme.colors.grey300};
  }
`
const ButtonWrapper = styled.div`
  display: flex;

  button {
    margin-right: 10px;
  }
  button:last-child {
    margin-right: 0px;
  }
`
const PdfWrapper = styled.div`
  display: flex;
  margin-top: 24px;
  margin-bottom: 56px;
  width: 595px;
  height: 841px;
  margin-inline: auto;
  background: ${({ theme }) => theme.colors.white};
  align-items: center;
  justify-content: center;
`

type State = {
  certificatePdf: string | null
  showConfirmationModal: boolean
}

type IFullProps = IntlShapeProps &
  RouteComponentProps<{}, {}, { isNavigatedInsideApp: boolean }> &
  ReturnType<typeof mapStatetoProps> &
  typeof mapDispatchToProps

class ReviewCertificateActionComponent extends React.Component<
  IFullProps,
  State
> {
  componentRef: React.RefObject<HTMLImageElement>
  constructor(props: IFullProps) {
    super(props)
    this.componentRef = React.createRef()
    this.state = {
      certificatePdf: null,
      showConfirmationModal: false
    }
  }
  componentDidMount() {
    if (this.state.certificatePdf === null) {
      previewCertificate(
        this.props.intl,
        this.props.draft,
        this.props.userDetails,
        this.props.offlineCountryConfig,
        (svg: string) => {
          this.setState({
            certificatePdf: svg
          })
        },
        this.props.state,
        this.props.countries
      )
    }
  }

  toggleModal = () => {
    this.setState({
      showConfirmationModal: !this.state.showConfirmationModal
    })
  }

  readyToCertifyAndIssueOrCertify = () => {
    const { draft } = this.props
    const isPrintInAdvanced = isCertificateForPrintInAdvance(draft)
    draft.submissionStatus = SUBMISSION_STATUS.READY_TO_CERTIFY
    draft.action = isPrintInAdvanced
      ? SubmissionAction.CERTIFY_DECLARATION
      : SubmissionAction.CERTIFY_AND_ISSUE_DECLARATION

    const registeredDate = getRegisteredDate(draft.data)
    const certificate = draft.data.registration.certificates[0]
    const eventDate = getEventDate(draft.data, draft.event)
    if (!isPrintInAdvanced) {
      if (
        isFreeOfCost(
          draft.event,
          eventDate,
          registeredDate,
          this.props.offlineCountryConfig
        )
      ) {
        certificate.payments = {
          type: 'MANUAL' as const,
          amount: 0,
          outcome: 'COMPLETED' as const,
          date: new Date().toISOString()
        }
      } else {
        const paymentAmount = calculatePrice(
          draft.event,
          eventDate,
          registeredDate,
          this.props.offlineCountryConfig
        )
        certificate.payments = {
          type: 'MANUAL' as const,
          amount: Number(paymentAmount),
          outcome: 'COMPLETED' as const,
          date: new Date().toISOString()
        }
      }
    }

    draft.data.registration = {
      ...draft.data.registration,
      certificates: [
        {
          ...certificate,
          data: this.state.certificatePdf || ''
        }
      ]
    }

    printCertificate(
      this.props.intl,
      draft,
      this.props.userDetails,
      this.props.offlineCountryConfig,
      this.props.state,
      this.props.countries
    )
    this.props.modifyDeclaration(draft)
    this.props.writeDeclaration(draft)
    this.toggleModal()
    this.props.goToHomeTab(WORKQUEUE_TABS.readyToPrint)
  }

  goBack = () => {
    const historyState = this.props.location.state
    const navigatedFromInsideApp = Boolean(
      historyState && historyState.isNavigatedInsideApp
    )

    if (navigatedFromInsideApp) {
      this.props.goBack()
    } else {
      this.props.goToHomeTab(WORKQUEUE_TABS.readyToPrint)
    }
  }

  render = () => {
    const { intl, scope } = this.props
    const isPrintInAdvanced = isCertificateForPrintInAdvance(this.props.draft)
    const isEventMarriage = this.props.draft.event === Event.Marriage

    /* The id of the draft is an empty string if it's not found in store*/
    if (!this.props.draft.id) {
      return (
        <Redirect
          to={formatUrl(REGISTRAR_HOME_TAB, {
            tabId: WORKQUEUE_TABS.readyToPrint,
            selectorId: ''
          })}
        />
      )
    }

    return (
      <ActionPageLight
        id="collector_form"
        hideBackground
        title={intl.formatMessage(
          certificateMessages.certificateCollectionTitle
        )}
        goBack={this.goBack}
        goHome={() => this.props.goToHomeTab(WORKQUEUE_TABS.readyToPrint)}
      >
        <PdfWrapper id="pdfwrapper">
          {this.state.certificatePdf && (
            <PDFViewer id="pdfholder" pdfSource={this.state.certificatePdf} />
          )}
        </PdfWrapper>
        <Content
          title={intl.formatMessage(certificateMessages.reviewTitle)}
          subtitle={intl.formatMessage(certificateMessages.reviewDescription)}
        >
          <ButtonWrapper>
            <SuccessButton
              align={0}
              id="confirm-print"
              onClick={this.toggleModal}
              icon={() => <Check />}
            >
              {intl.formatMessage(certificateMessages.confirmAndPrint)}
            </SuccessButton>
            {!isEventMarriage && hasRegisterScope(scope) && (
              <DangerButton
                onClick={() =>
                  this.props.goToCertificateCorrection(
                    this.props.registrationId,
                    CorrectionSection.Corrector
                  )
                }
              >
                {intl.formatMessage(buttonMessages.editRecord)}
              </DangerButton>
            )}
          </ButtonWrapper>
        </Content>
        <ResponsiveModal
          id="confirm-print-modal"
          title={
            isPrintInAdvanced
              ? intl.formatMessage(certificateMessages.printModalTitle)
              : intl.formatMessage(certificateMessages.printAndIssueModalTitle)
          }
          actions={[
            <CustomTertiaryButton
              key="close-modal"
              onClick={this.toggleModal}
              id="close-modal"
            >
              {intl.formatMessage(buttonMessages.cancel)}
            </CustomTertiaryButton>,
            <PrimaryButton
              key="print-certificate"
              onClick={this.readyToCertifyAndIssueOrCertify}
              id="print-certificate"
            >
              {intl.formatMessage(buttonMessages.print)}
            </PrimaryButton>
          ]}
          show={this.state.showConfirmationModal}
          handleClose={this.toggleModal}
          contentHeight={100}
        >
          {isPrintInAdvanced
            ? intl.formatMessage(certificateMessages.printModalBody)
            : intl.formatMessage(certificateMessages.printAndIssueModalBody)}
        </ResponsiveModal>
      </ActionPageLight>
    )
  }
}

const getEvent = (eventType: string | undefined) => {
  switch (eventType && eventType.toLowerCase()) {
    case 'birth':
    default:
      return Event.Birth
    case 'death':
      return Event.Death
    case 'marriage':
      return Event.Marriage
  }
}

export const getDraft = (
  drafts: IPrintableDeclaration[],
  registrationId: string,
  eventType: string
) =>
  drafts.find((draftItem) => draftItem.id === registrationId) ||
  ({
    id: '',
    data: {},
    event: getEvent(eventType)
  } as IPrintableDeclaration)

function mapStatetoProps(
  state: IStoreState,
  props: RouteComponentProps<{ registrationId: string; eventType: string }>
) {
  const { registrationId, eventType } = props.match.params
  const declarations = state.declarationsState
    .declarations as IPrintableDeclaration[]

  const draft = getDraft(declarations, registrationId, eventType)
  const event = getEvent(draft.event)
  const offlineCountryConfig = getOfflineData(state)

  return {
    event,
    registrationId,
    draft: {
      ...draft,
      data: {
        ...draft.data,
        template: {
          ...draft.data.template,
          ...(isCertificateForPrintInAdvance(draft) && { printInAdvance: true })
        }
      }
    },
    scope: getScope(state),
    countries: getCountryTranslations(state.i18n.languages, countries),
    userDetails: getUserDetails(state),
    offlineCountryConfig,
    registerForm: getEventRegisterForm(state, event),
    state
  }
}

const mapDispatchToProps = {
  modifyDeclaration,
  writeDeclaration,
  goToHomeTab,
  storeDeclaration,
  goBack,
  goToCertificateCorrection
}

export const ReviewCertificateAction = connect(
  mapStatetoProps,
  mapDispatchToProps
)(injectIntl(ReviewCertificateActionComponent))
