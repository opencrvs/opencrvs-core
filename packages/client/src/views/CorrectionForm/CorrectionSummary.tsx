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
import { modifyApplication, IApplication } from '@client/applications'
import { connect } from 'react-redux'
import {
  WrappedComponentProps as IntlShapeProps,
  injectIntl,
  MessageDescriptor
} from 'react-intl'
import {
  goBack,
  goToCertificateCorrection,
  goToHomeTab,
  goToPageGroup
} from '@client/navigation'
import { messages as registerMessages } from '@client/i18n/messages/views/register'
import { messages } from '@client/i18n/messages/views/correction'
import {
  buttonMessages,
  constantsMessages,
  formMessages
} from '@client/i18n/messages'
import {
  IFormSection,
  IFormField,
  IForm,
  IFormSectionGroup,
  IFormSectionData,
  CorrectionSection,
  ReviewSection
} from '@client/forms'
import {
  ActionPageLight,
  ColumnContentAlignment,
  ListTable
} from '@opencrvs/components/lib/interface'
import { Content } from '@opencrvs/components/lib/interface/Content'
import {
  SuccessButton,
  SecondaryButton,
  LinkButton,
  ICON_ALIGNMENT
} from '@opencrvs/components/lib/buttons'
import { Check, PaperClip } from '@opencrvs/components/lib/icons'
import { CERTIFICATE_CORRECTION_REVIEW } from '@client/navigation/routes'
import styled from 'styled-components'
import { FormFieldGenerator } from '@client/components/form'
import { group } from 'console'
import { correctionFeesPayment } from '@client/forms/correction/payment'

const SupportingDocument = styled.div`
  display: flex;
  margin: 4px 0;
`

type IStateProps = {
  application: IApplication
}

type IDispatchProps = {
  goBack: typeof goBack
  modifyApplication: typeof modifyApplication
  goToPageGroup: typeof goToPageGroup
  goToCertificateCorrection: typeof goToCertificateCorrection
  goToHomeTab: typeof goToHomeTab
}

type IProps = IStateProps & IDispatchProps & IntlShapeProps

class CorrectionSummaryComponent extends React.Component<IProps> {
  render() {
    const { application, intl, goBack } = this.props

    const backToReviewButton = (
      <SecondaryButton
        id="back_to_review"
        key="back_to_review"
        onClick={this.gotoReviewPage}
      >
        {intl.formatMessage(registerMessages.backToReviewButton)}
      </SecondaryButton>
    )

    const continueButton = (
      <SuccessButton
        id="make_correction"
        key="make_correction"
        onClick={this.makeCorrection}
        icon={() => <Check />}
        align={ICON_ALIGNMENT.LEFT}
      >
        {intl.formatMessage(buttonMessages.makeCorrection)}
      </SuccessButton>
    )

    return (
      <>
        <ActionPageLight
          id="corrector_form"
          title={intl.formatMessage(messages.title)}
          hideBackground
          goBack={goBack}
          goHome={this.cancelCorrection}
        >
          <Content
            title={intl.formatMessage(messages.correctionSummaryTitle)}
            topActionButtons={[backToReviewButton]}
            bottomActionButtons={[continueButton]}
          >
            <ListTable
              isLoading={false}
              content={[
                {
                  item: 'Date of death',
                  original: '2021-22-22',
                  correction: '2022-22-22'
                }
              ]}
              hideBoxShadow={true}
              columns={[
                {
                  label: intl.formatMessage(messages.correctionSummaryItem),
                  alignment: ColumnContentAlignment.LEFT,
                  width: 33,
                  key: 'item'
                },
                {
                  label: intl.formatMessage(messages.correctionSummaryOriginal),
                  width: 33,
                  alignment: ColumnContentAlignment.LEFT,
                  key: 'original'
                },
                {
                  label: intl.formatMessage(
                    messages.correctionSummaryCorrection
                  ),
                  width: 33,
                  alignment: ColumnContentAlignment.LEFT,
                  key: 'correction'
                }
              ]}
              noResultText={intl.formatMessage(constantsMessages.noResults)}
            ></ListTable>
            <ListTable
              isLoading={false}
              content={[
                {
                  requestedBy: this.getRequestedBy()
                }
              ]}
              hideBoxShadow={true}
              columns={[
                {
                  label: intl.formatMessage(
                    messages.correctionSummaryRequestedBy
                  ),
                  width: 100,
                  alignment: ColumnContentAlignment.LEFT,
                  key: 'requestedBy'
                }
              ]}
              noResultText={intl.formatMessage(constantsMessages.noResults)}
            ></ListTable>

            <ListTable
              isLoading={false}
              content={[
                {
                  idCheck: this.getIdCheck()
                }
              ]}
              hideBoxShadow={true}
              columns={[
                {
                  label: intl.formatMessage(messages.correctionSummaryIdCheck),
                  width: 100,
                  alignment: ColumnContentAlignment.LEFT,
                  key: 'idCheck'
                }
              ]}
              noResultText={intl.formatMessage(constantsMessages.noResults)}
            ></ListTable>

            <ListTable
              isLoading={false}
              content={[
                {
                  reasonForRequest: this.getReasonForRequest()
                }
              ]}
              hideBoxShadow={true}
              columns={[
                {
                  label: intl.formatMessage(
                    messages.correctionSummaryReasonForRequest
                  ),
                  width: 100,
                  alignment: ColumnContentAlignment.LEFT,
                  key: 'reasonForRequest'
                }
              ]}
              noResultText={intl.formatMessage(constantsMessages.noResults)}
            ></ListTable>

            <ListTable
              isLoading={false}
              content={[
                {
                  comments: this.getComments()
                }
              ]}
              hideBoxShadow={true}
              columns={[
                {
                  label: intl.formatMessage(messages.correctionSummaryComments),
                  width: 100,
                  alignment: ColumnContentAlignment.LEFT,
                  key: 'comments'
                }
              ]}
              noResultText={intl.formatMessage(constantsMessages.noResults)}
            ></ListTable>

            <ListTable
              isLoading={false}
              content={[
                {
                  supportingDocuments: this.getSupportingDocuments()
                }
              ]}
              hideBoxShadow={true}
              columns={[
                {
                  label: intl.formatMessage(
                    messages.correctionSummarySupportingDocuments
                  ),
                  width: 100,
                  alignment: ColumnContentAlignment.LEFT,
                  key: 'supportingDocuments'
                }
              ]}
              noResultText={intl.formatMessage(constantsMessages.noResults)}
            ></ListTable>
          </Content>
        </ActionPageLight>
      </>
    )
  }

  getName = (person: IFormSectionData) => {
    return [
      person.firstNamesEng as string,
      person.familyNameEng as string
    ].join(' ')
  }

  getRequestedBy = () => {
    const corrector = this.props.application.data.corrector as IFormSectionData
    const relationship = (corrector.relationship as IFormSectionData)
      .value as string
    switch (relationship) {
      case 'MOTHER':
        return this.getName(this.props.application.data.mother)
      case 'FATHER':
        return this.getName(this.props.application.data.father)
      case 'CHILD':
        return this.getName(this.props.application.data.child)
      case 'INFORMANT':
        return this.getName(this.props.application.data.informant)
      case 'LEGAL_GUARDIAN':
        return this.props.intl.formatMessage(messages.legalGuardian)
      case 'ANOTHER_AGENT':
        return this.props.intl.formatMessage(messages.anotherRegOrFieldAgent)
      case 'REGISTRAR':
        return this.props.intl.formatMessage(messages.me)
      case 'COURT':
        return this.props.intl.formatMessage(messages.court)
      case 'OTHER':
        return (corrector.nestedFields as IFormSectionData)
          .otherRelationship as string
      default:
        return '-'
    }
  }

  getIdCheck = () => {
    const idChecked = (
      this.props.application.data.corrector as IFormSectionData
    ).hasShowedVerifiedDocument as boolean
    return idChecked
      ? this.props.intl.formatMessage(messages.idCheckWithoutVerify)
      : this.props.intl.formatMessage(messages.idCheckVerify)
  }

  getReasonForRequest = () => {
    const reason = this.props.application.data.reason.type as IFormSectionData
    const reasonValue = reason.value as string
    switch (reasonValue) {
      case 'CLERICAL_ERROR':
        return this.getReason(
          this.props.intl.formatMessage(messages.clericalError)
        )
      case 'MATERIAL_ERROR':
        return this.getReason(
          this.props.intl.formatMessage(messages.materialError)
        )
      case 'MATERIAL_OMISSION':
        return this.getReason(
          this.props.intl.formatMessage(messages.materialOmission)
        )
      case 'JUDICIAL_ORDER':
        return this.getReason(
          this.props.intl.formatMessage(messages.judicialOrder)
        )
      case 'OTHER':
        return this.getReason(
          (reason.nestedFields as IFormSectionData).reasonForChange as string
        )
      default:
        return '-'
    }
  }

  getReason = (message: string) => {
    return (
      <div>
        <div>{message}</div>
        <LinkButton
          id="birth-registration-detalis-link"
          onClick={() =>
            this.props.goToCertificateCorrection(
              this.props.application.id,
              CorrectionSection.Reason
            )
          }
        >
          {this.props.intl.formatMessage(buttonMessages.change)}
        </LinkButton>
      </div>
    )
  }

  getComments = () => {
    const comments = this.props.application.data.reason
      .additionalComment as string

    return (
      <div>
        <div>{comments}</div>
        <LinkButton
          id="birth-registration-detalis-link"
          onClick={() =>
            this.props.goToCertificateCorrection(
              this.props.application.id,
              CorrectionSection.Reason
            )
          }
        >
          {comments && comments.length > 0
            ? this.props.intl.formatMessage(buttonMessages.change)
            : this.props.intl.formatMessage(
                messages.correctionSummaryAddComments
              )}
        </LinkButton>
      </div>
    )
  }

  getSupportingDocuments = () => {
    const supportingDocuments = this.props.application.data.supportingDocuments
      .uploadDocForLegalProof as IFormSectionData[]

    return (
      <div>
        {supportingDocuments.map((proof) => {
          const doc = proof.optionValues as IFormSectionData[]
          return (
            <SupportingDocument>
              <PaperClip />
              {doc[1]}
            </SupportingDocument>
          )
        })}
        <LinkButton
          id="birth-registration-detalis-link"
          onClick={() =>
            this.props.goToCertificateCorrection(
              this.props.application.id,
              CorrectionSection.SupportingDocuments
            )
          }
        >
          {this.props.intl.formatMessage(buttonMessages.upload)}
        </LinkButton>
      </div>
    )
  }

  makeCorrection = () => {
    alert('correction made')
  }

  cancelCorrection() {
    this.props.modifyApplication({
      ...this.props.application,
      data: {
        ...this.props.application.originalData
      }
    })
    this.props.goToHomeTab('review')
  }

  gotoReviewPage = () => {
    this.props.goToPageGroup(
      CERTIFICATE_CORRECTION_REVIEW,
      this.props.application.id,
      ReviewSection.Review,
      'review-view-group',
      this.props.application.event
    )
  }
}

export const CorrectionSummary = connect(undefined, {
  modifyApplication,
  goBack,
  goToPageGroup,
  goToCertificateCorrection,
  goToHomeTab
})(injectIntl(CorrectionSummaryComponent))
