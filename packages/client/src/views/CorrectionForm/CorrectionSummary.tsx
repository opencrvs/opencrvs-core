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
import {
  modifyDeclaration,
  IDeclaration,
  SUBMISSION_STATUS,
  writeDeclaration
} from '@client/declarations'
import { connect } from 'react-redux'
import { get } from 'lodash'
import {
  WrappedComponentProps as IntlShapeProps,
  injectIntl,
  IntlShape
} from 'react-intl'
import {
  goBack,
  goToCertificateCorrection,
  goToHomeTab,
  goToPageGroup
} from '@client/navigation'
import { messages as registerMessages } from '@client/i18n/messages/views/register'
import { messages } from '@client/i18n/messages/views/correction'
import { replaceInitialValues } from '@client/views/RegisterForm/RegisterForm'
import { buttonMessages, constantsMessages } from '@client/i18n/messages'
import {
  IFormSection,
  IFormField,
  IForm,
  IFormSectionGroup,
  IFormSectionData,
  CorrectionSection,
  ReviewSection,
  IFormData,
  IPreviewGroup,
  REVIEW_OVERRIDE_POSITION,
  SubmissionAction
} from '@client/forms'
import { ActionPageLight } from '@opencrvs/components/lib/ActionPageLight'
import { Table } from '@opencrvs/components/lib/Table'
import { Content } from '@opencrvs/components/lib/Content'
import { Text } from '@opencrvs/components/lib/Text'
import {
  SuccessButton,
  SecondaryButton,
  LinkButton,
  ICON_ALIGNMENT,
  TertiaryButton
} from '@opencrvs/components/lib/buttons'
import { Button } from '@opencrvs/components/lib/Button'
import { Check, PaperClip } from '@opencrvs/components/lib/icons'
import { CERTIFICATE_CORRECTION_REVIEW } from '@client/navigation/routes'
import styled from 'styled-components'
import { FormFieldGenerator } from '@client/components/form'
import { correctionFeesPaymentSection } from '@client/forms/correction/payment'
import {
  getNestedFieldValue,
  getOverriddenFieldsListForPreview,
  getRenderableField,
  getViewableSection,
  hasFieldChanged,
  isViewOnly,
  isVisibleField,
  renderValue,
  sectionHasError,
  updateDeclarationRegistrationWithCorrection
} from './utils'
import { IStoreState } from '@client/store'
import { getRegisterForm } from '@client/forms/register/declaration-selectors'
import { getLanguage } from '@client/i18n/selectors'
import { getVisibleSectionGroupsBasedOnConditions } from '@client/forms/utils'
import { getOfflineData } from '@client/offline/selectors'
import { IOfflineData } from '@client/offline/reducer'
import { CorrectorRelationship } from '@client/forms/correction/corrector'
import { CorrectionReason } from '@client/forms/correction/reason'
import { getUserDetails } from '@client/profile/profileSelectors'
import { WORKQUEUE_TABS } from '@client/components/interface/Navigation'
import { getCurrencySymbol } from '@client/views/SysAdmin/Config/Application/utils'
import { ColumnContentAlignment } from '@opencrvs/components/lib/common-types'
import { UserDetails } from '@client/utils/userUtils'
import { ROLE_REGISTRATION_AGENT } from '@client/utils/constants'
import { Dialog } from '@opencrvs/components/lib/Dialog/Dialog'
import { SystemRoleType } from '@client/utils/gateway'

const SupportingDocument = styled.div`
  display: flex;
  margin: 8px 0;
  & span:last-child {
    padding-left: 8px;
  }
`
interface IProps {
  userPrimaryOffice?: UserDetails['primaryOffice']
  userRole?: UserDetails['systemRole']
  registerForm: { [key: string]: IForm }
  offlineResources: IOfflineData
  language: string
}

type IStateProps = {
  declaration: IDeclaration
}

type IState = {
  isFileUploading: boolean
  showPrompt: boolean
}

type IDispatchProps = {
  goBack: typeof goBack
  modifyDeclaration: typeof modifyDeclaration
  goToPageGroup: typeof goToPageGroup
  goToCertificateCorrection: typeof goToCertificateCorrection
  goToHomeTab: typeof goToHomeTab
  writeDeclaration: typeof writeDeclaration
}

type IFullProps = IProps & IStateProps & IDispatchProps & IntlShapeProps

class CorrectionSummaryComponent extends React.Component<IFullProps, IState> {
  section = correctionFeesPaymentSection
  group = this.section.groups[0]
  constructor(props: IFullProps) {
    super(props)
    this.state = {
      isFileUploading: false,
      showPrompt: false
    }
  }

  componentDidMount() {
    this.group = {
      ...this.group,
      fields: replaceInitialValues(
        this.group.fields,
        this.props.declaration.data[this.section.id] || {},
        this.props.declaration.data
      )
    }
    const currency = getCurrencySymbol(
      this.props.offlineResources.config.CURRENCY
    )

    ;(
      this.group.fields[0].nestedFields as any
    ).REQUIRED[0].label.defaultMessage = this.props.intl.formatMessage(
      messages.correctionSummaryTotalPaymentLabel,
      { currency }
    )
  }

  onUploadingStateChanged = (isUploading: boolean) => {
    this.setState({
      ...this.state,
      isFileUploading: isUploading
    })
  }

  togglePrompt = () => {
    this.setState((prevState) => ({ showPrompt: !prevState.showPrompt }))
  }

  render() {
    const {
      registerForm,
      declaration,
      intl,
      goBack,
      declaration: { event },
      userRole
    } = this.props
    const { showPrompt } = this.state
    const formSections = getViewableSection(registerForm[event], declaration)
    const relationShip = (
      declaration.data.corrector.relationship as IFormSectionData
    ).value as string

    const noIdCheck =
      relationShip !== CorrectorRelationship.REGISTRAR &&
      relationShip !== CorrectorRelationship.ANOTHER_AGENT

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
        onClick={() => {
          userRole === ROLE_REGISTRATION_AGENT
            ? this.togglePrompt()
            : this.makeCorrection(userRole)
        }}
        disabled={
          sectionHasError(this.group, this.section, declaration) ||
          this.state.isFileUploading
        }
        icon={() => <Check />}
        align={ICON_ALIGNMENT.LEFT}
      >
        {userRole === ROLE_REGISTRATION_AGENT
          ? intl.formatMessage(buttonMessages.sendForApproval)
          : intl.formatMessage(buttonMessages.makeCorrection)}
      </SuccessButton>
    )

    return (
      <>
        <ActionPageLight
          id="corrector_form"
          title={intl.formatMessage(messages.title)}
          hideBackground
          goBack={goBack}
          goHome={() => this.props.goToHomeTab(WORKQUEUE_TABS.readyForReview)}
        >
          <Content
            title={intl.formatMessage(messages.correctionSummaryTitle)}
            topActionButtons={[backToReviewButton]}
            bottomActionButtons={[continueButton]}
            showTitleOnMobile={true}
          >
            <Table
              isLoading={false}
              noPagination
              content={this.getChanges(formSections)}
              hideTableBottomBorder={true}
              columns={[
                {
                  label: intl.formatMessage(messages.correctionSummaryItem),
                  alignment: ColumnContentAlignment.LEFT,
                  width: 34,
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
                  key: 'changed'
                }
              ]}
              noResultText={intl.formatMessage(constantsMessages.noResults)}
            ></Table>
            <Table
              hideTableBottomBorder={true}
              isLoading={false}
              content={[
                {
                  requestedBy: this.getRequestedBy()
                }
              ]}
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
            ></Table>
            {noIdCheck && (
              <Table
                hideTableBottomBorder={true}
                isLoading={false}
                content={[
                  {
                    idCheck: this.getIdCheck()
                  }
                ]}
                columns={[
                  {
                    label: intl.formatMessage(
                      messages.correctionSummaryIdCheck
                    ),
                    width: 100,
                    alignment: ColumnContentAlignment.LEFT,
                    key: 'idCheck'
                  }
                ]}
                noResultText={intl.formatMessage(constantsMessages.noResults)}
              ></Table>
            )}

            <Table
              hideTableBottomBorder={true}
              isLoading={false}
              content={[
                {
                  reasonForRequest: this.getReasonForRequest()
                }
              ]}
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
            ></Table>
            <Table
              hideTableBottomBorder={true}
              isLoading={false}
              content={[
                {
                  comments: this.getComments()
                }
              ]}
              columns={[
                {
                  label: intl.formatMessage(messages.correctionSummaryComments),
                  width: 100,
                  alignment: ColumnContentAlignment.LEFT,
                  key: 'comments'
                }
              ]}
              noResultText={intl.formatMessage(constantsMessages.noResults)}
            ></Table>
            <Table
              isLoading={false}
              content={[
                {
                  supportingDocuments: this.getSupportingDocuments()
                }
              ]}
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
            ></Table>
            <FormFieldGenerator
              id={this.group.id}
              onChange={(values) => {
                this.modifyDeclaration(
                  values,
                  correctionFeesPaymentSection,
                  declaration
                )
              }}
              setAllFieldsDirty={false}
              fields={this.group.fields}
              draftData={declaration.data}
              onUploadingStateChanged={this.onUploadingStateChanged}
              requiredErrorMessage={messages.correctionRequiredLabel}
            />
          </Content>
        </ActionPageLight>
        <Dialog
          id="withoutCorrectionForApprovalPrompt"
          isOpen={showPrompt}
          title={intl.formatMessage(messages.correctionForApprovalDialogTitle)}
          onClose={this.togglePrompt}
          actions={[
            <Button
              id="cancel"
              key="cancel"
              size="medium"
              type="tertiary"
              onClick={this.togglePrompt}
            >
              {intl.formatMessage(messages.correctionForApprovalDialogCancel)}
            </Button>,
            <Button
              type="positive"
              size="medium"
              id="send"
              key="continue"
              onClick={() => {
                this.makeCorrection(userRole)
                this.togglePrompt()
              }}
            >
              {intl.formatMessage(messages.correctionForApprovalDialogConfirm)}
            </Button>
          ]}
        >
          <p>
            <Text element="p" variant="reg16">
              {intl.formatMessage(
                messages.correctionForApprovalDialogDescription
              )}
            </Text>
          </p>
        </Dialog>
      </>
    )
  }

  getFieldValue = (
    section: IFormSection,
    data: IFormData,
    field: IFormField,
    intl: IntlShape,
    offlineResources: IOfflineData,
    language: string,
    ignoreNestedFieldWrapping?: boolean,
    replaceEmpty?: boolean
  ) => {
    let value = renderValue(
      data,
      section.id,
      field,
      intl,
      offlineResources,
      language
    )

    if (replaceEmpty && !value) {
      value = '-'
    }

    return field.nestedFields && !Boolean(ignoreNestedFieldWrapping)
      ? (
          (data[section.id] &&
            data[section.id][field.name] &&
            (data[section.id][field.name] as IFormSectionData).value &&
            field.nestedFields[
              (data[section.id][field.name] as IFormSectionData).value as string
            ]) ||
          []
        ).reduce((groupedValues, nestedField) => {
          // Value of the parentField resembles with IFormData as a nested form
          const nestedValue =
            (data[section.id] &&
              data[section.id][field.name] &&
              renderValue(
                data[section.id][field.name] as IFormData,
                'nestedFields',
                nestedField,
                intl,
                offlineResources,
                language
              )) ||
            ''
          return (
            <>
              {groupedValues}
              {nestedValue && <div></div>}
              {nestedValue}
            </>
          )
        }, <>{value}</>)
      : value
  }

  getSinglePreviewField = (
    section: IFormSection,
    group: IFormSectionGroup,
    field: IFormField,
    ignoreNestedFieldWrapping?: boolean
  ) => {
    const { declaration, intl, offlineResources, language } = this.props
    if (
      declaration.originalData &&
      hasFieldChanged(
        field,
        declaration.data[section.id],
        declaration.originalData[section.id]
      )
    ) {
      const changed = this.getFieldValue(
        section,
        declaration.data,
        field,
        intl,
        offlineResources,
        language,
        ignoreNestedFieldWrapping
      )
      const original = this.getFieldValue(
        section,
        declaration.originalData,
        field,
        intl,
        offlineResources,
        language,
        ignoreNestedFieldWrapping,
        true
      )

      return getRenderableField(section, field.label, original, changed, intl)
    }
  }

  getPreviewGroupsField = (
    section: IFormSection,
    group: IFormSectionGroup,
    field: IFormField,
    visitedTags: string[],
    data: IFormSectionData,
    originalData?: IFormSectionData
  ) => {
    const { declaration, intl, offlineResources, language } = this.props
    if (field.previewGroup && !visitedTags.includes(field.previewGroup)) {
      visitedTags.push(field.previewGroup)

      const baseTag = field.previewGroup
      const taggedFields: IFormField[] = []
      group.fields.forEach((field) => {
        if (
          isVisibleField(field, section, declaration, offlineResources) &&
          !isViewOnly(field)
        ) {
          if (field.previewGroup === baseTag) {
            taggedFields.push(field)
          }
          for (const index in field.nestedFields) {
            field.nestedFields[index].forEach((tempField) => {
              if (
                isVisibleField(
                  tempField,
                  section,
                  declaration,
                  offlineResources
                ) &&
                !isViewOnly(tempField) &&
                tempField.previewGroup === baseTag
              ) {
                taggedFields.push(tempField)
              }
            })
          }
        }
      })

      const tagDef =
        (group.previewGroups &&
          (group.previewGroups.filter(
            (previewGroup) => previewGroup.id === baseTag
          ) as IPreviewGroup[])) ||
        []
      const values = taggedFields
        .map((field) =>
          this.getFieldValue(
            section,
            declaration.data,
            field,
            intl,
            offlineResources,
            language
          )
        )
        .filter((value) => value)

      let completeValue = values[0]
      values.shift()
      values.forEach(
        (value) =>
          (completeValue = (
            <>
              {completeValue}
              {tagDef[0].delimiter ? tagDef[0].delimiter : <div></div>}
              {value}
            </>
          ))
      )

      const hasAnyFieldChanged = taggedFields.reduce(
        (accum, field) => accum || hasFieldChanged(field, data, originalData),
        false
      )

      const declarationOriginalData = declaration.originalData
      if (declarationOriginalData && hasAnyFieldChanged) {
        const previousValues = taggedFields
          .map((field, index) =>
            this.getFieldValue(
              section,
              declarationOriginalData,
              field,
              intl,
              offlineResources,
              language,
              undefined,
              !!index
            )
          )
          .filter((value) => value)
        let previousCompleteValue = previousValues[0]
        previousValues.shift()
        previousValues.forEach(
          (previousValue) =>
            (previousCompleteValue = (
              <>
                {previousCompleteValue}
                {tagDef[0].delimiter ? tagDef[0].delimiter : <div></div>}
                {previousValue}
              </>
            ))
        )

        return getRenderableField(
          section,
          (tagDef[0] && tagDef[0].label) || field.label,
          previousCompleteValue,
          completeValue,
          intl
        )
      }
    }
  }

  getNestedPreviewField = (
    section: IFormSection,
    group: IFormSectionGroup,
    field: IFormField
  ) => {
    const {
      declaration: { data, originalData },
      intl,
      offlineResources,
      language
    } = this.props
    const visitedTags: string[] = []
    const nestedItems: any[] = []
    // parent field
    let item: any
    item = this.getSinglePreviewField(section, group, field, true)

    item && nestedItems.push(item)
    ;(
      (field.nestedFields &&
        data[section.id] &&
        data[section.id][field.name] &&
        (data[section.id][field.name] as IFormSectionData).value &&
        field.nestedFields[
          (data[section.id][field.name] as IFormSectionData).value as string
        ]) ||
      []
    ).forEach((nestedField) => {
      if (nestedField.previewGroup) {
        item = this.getPreviewGroupsField(
          section,
          group,
          nestedField,
          visitedTags,
          (data[section.id][field.name] as IFormData).nestedFields,
          (originalData &&
            (originalData[section.id][field.name] as IFormData).nestedFields) ||
            undefined
        )

        item && nestedItems.push(item)
      } else {
        item = getNestedFieldValue(
          section,
          data[section.id][field.name] as IFormData,
          nestedField,
          intl,
          offlineResources,
          language
        )
        item && nestedItems.push(item)
      }
    })
    return nestedItems
  }

  getOverRiddenPreviewField = (
    section: IFormSection,
    group: IFormSectionGroup,
    overriddenField: IFormField,
    field: IFormField,
    items: any[],
    item: any,
    deathForm: IForm
  ) => {
    const { declaration, intl, offlineResources, language } = this.props
    overriddenField.label =
      get(overriddenField, 'reviewOverrides.labelAs') || overriddenField.label
    const residingSectionId = get(
      overriddenField,
      'reviewOverrides.residingSection'
    )
    const residingSection = deathForm.sections.find(
      (section) => section.id === residingSectionId
    ) as IFormSection

    const result = this.getSinglePreviewField(
      residingSection,
      group,
      overriddenField
    )

    const { sectionID, groupID, fieldName } =
      overriddenField!.reviewOverrides!.reference
    if (
      sectionID === section.id &&
      groupID === group.id &&
      fieldName === field.name
    ) {
      if (
        overriddenField!.reviewOverrides!.position ===
        REVIEW_OVERRIDE_POSITION.BEFORE
      ) {
        items = items.concat(result)
        items = items.concat(item)
      } else {
        items = items.concat(item)
        items = items.concat(result)
      }
      return items
    }

    items = items.concat(item)
    return items
  }

  getChanges = (formSections: IFormSection[]) => {
    const { declaration, offlineResources, language } = this.props
    const overriddenFields = getOverriddenFieldsListForPreview(
      formSections,
      declaration,
      offlineResources
    )
    let tempItem: any

    let items: any[] = []
    formSections.forEach((section) => {
      const visitedTags: string[] = []
      const visibleGroups = getVisibleSectionGroupsBasedOnConditions(
        section,
        declaration.data[section.id] || {},
        declaration.data
      )
      visibleGroups.forEach((group) => {
        group.fields
          .filter(
            (field) =>
              isVisibleField(field, section, declaration, offlineResources) &&
              !isViewOnly(field)
          )
          .filter((field) => !Boolean(field.hideInPreview))
          .filter((field) => !Boolean(field.reviewOverrides))
          .forEach((field) => {
            tempItem = field.previewGroup
              ? this.getPreviewGroupsField(
                  section,
                  group,
                  field,
                  visitedTags,
                  declaration.data[section.id],
                  declaration.originalData &&
                    declaration.originalData[section.id]
                )
              : field.nestedFields && field.ignoreNestedFieldWrappingInPreview
              ? this.getNestedPreviewField(section, group, field)
              : this.getSinglePreviewField(section, group, field)

            overriddenFields.forEach((overriddenField) => {
              items = this.getOverRiddenPreviewField(
                section,
                group,
                overriddenField as IFormField,
                field,
                items,
                tempItem,
                this.props.registerForm.death
              )
            })

            if (!overriddenFields.length) {
              items = items.concat(tempItem)
            }
          })
      })
    })
    return items.filter((item) => item)
  }

  modifyDeclaration = (
    sectionData: IFormSectionData,
    activeSection: IFormSection,
    declaration: IDeclaration
  ) => {
    this.props.modifyDeclaration({
      ...declaration,
      data: {
        ...declaration.data,
        [activeSection.id]: {
          ...declaration.data[activeSection.id],
          ...sectionData
        }
      }
    })
  }

  getName = (person: IFormSectionData) => {
    return [
      person.firstNamesEng as string,
      person.familyNameEng as string
    ].join(' ')
  }

  getRequestedBy = () => {
    const corrector = this.props.declaration.data.corrector as IFormSectionData

    const relationship =
      corrector &&
      ((corrector.relationship as IFormSectionData).value as string)
    switch (relationship) {
      case CorrectorRelationship.INFORMANT:
        return this.getName(this.props.declaration.data.informant)
      case CorrectorRelationship.MOTHER:
        return this.getName(this.props.declaration.data.mother)
      case CorrectorRelationship.FATHER:
        return this.getName(this.props.declaration.data.father)
      case CorrectorRelationship.CHILD:
        return this.getName(this.props.declaration.data.child)
      case CorrectorRelationship.LEGAL_GUARDIAN:
        return this.props.intl.formatMessage(messages.legalGuardian)
      case CorrectorRelationship.ANOTHER_AGENT:
        return this.props.intl.formatMessage(messages.anotherRegOrFieldAgent)
      case CorrectorRelationship.REGISTRAR:
        return this.props.intl.formatMessage(messages.me)
      case CorrectorRelationship.COURT:
        return this.props.intl.formatMessage(messages.court)
      case CorrectorRelationship.OTHER:
        return (
          (corrector.relationship as IFormSectionData)
            .nestedFields as IFormSectionData
        ).otherRelationship as string

      default:
        return '-'
    }
  }

  getIdCheck = () => {
    const corrector = this.props.declaration.data.corrector as IFormSectionData
    const idChecked =
      corrector &&
      ((corrector as IFormSectionData).hasShowedVerifiedDocument as boolean)
    return idChecked
      ? this.props.intl.formatMessage(messages.idCheckVerify)
      : this.props.intl.formatMessage(messages.idCheckWithoutVerify)
  }

  getReasonForRequest = () => {
    const reason = this.props.declaration.data.reason as IFormSectionData
    const reasonType = reason && (reason.type as IFormSectionData)
    const reasonValue = reasonType && (reasonType.value as string)
    switch (reasonValue) {
      case CorrectionReason.CLERICAL_ERROR:
        return this.getReason(
          this.props.intl.formatMessage(messages.clericalError)
        )
      case CorrectionReason.MATERIAL_ERROR:
        return this.getReason(
          this.props.intl.formatMessage(messages.materialError)
        )
      case CorrectionReason.MATERIAL_OMISSION:
        return this.getReason(
          this.props.intl.formatMessage(messages.materialOmission)
        )
      case CorrectionReason.JUDICIAL_ORDER:
        return this.getReason(
          this.props.intl.formatMessage(messages.judicialOrder)
        )
      case CorrectionReason.OTHER:
        return this.getReason(
          (reasonType.nestedFields as IFormSectionData).otherReason as string
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
          id="change-reason-link"
          onClick={() =>
            this.props.goToCertificateCorrection(
              this.props.declaration.id,
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
    const reason = this.props.declaration.data.reason as IFormSectionData
    const comments = reason && (reason.additionalComment as string)

    return (
      <div>
        <div>{comments}</div>
        <LinkButton
          id="change-comment-link"
          onClick={() =>
            this.props.goToCertificateCorrection(
              this.props.declaration.id,
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
    const supportingDocuments = this.props.declaration.data
      .supportingDocuments as IFormSectionData
    const proofOfDoc =
      supportingDocuments &&
      (supportingDocuments.uploadDocForLegalProof as IFormSectionData[])

    return (
      <div>
        {proofOfDoc &&
          proofOfDoc.map((proof, i) => {
            const doc = proof.optionValues as IFormSectionData[]
            return (
              <SupportingDocument key={`proof-${i}`}>
                <PaperClip />
                <span>{doc[1] as any}</span>
              </SupportingDocument>
            )
          })}
        <LinkButton
          id="upload-supporting-doc-link"
          onClick={() =>
            this.props.goToCertificateCorrection(
              this.props.declaration.id,
              CorrectionSection.SupportingDocuments
            )
          }
        >
          {this.props.intl.formatMessage(buttonMessages.upload)}
        </LinkButton>
      </div>
    )
  }

  makeCorrection = (userRole: SystemRoleType | undefined) => {
    const declaration = this.props.declaration
    if (userRole === ROLE_REGISTRATION_AGENT) {
      declaration.action = SubmissionAction.REQUEST_CORRECTION
      declaration.submissionStatus =
        SUBMISSION_STATUS.READY_TO_REQUEST_CORRECTION
    } else {
      declaration.action = SubmissionAction.MAKE_CORRECTION
      declaration.submissionStatus =
        SUBMISSION_STATUS.READY_TO_REQUEST_CORRECTION
    }
    const correction = updateDeclarationRegistrationWithCorrection(
      declaration.data,
      {
        userPrimaryOffice: this.props.userPrimaryOffice
      }
    )

    declaration.data.registration.correction = {
      ...((declaration.data.registration.correction as IFormSectionData) || {}),
      ...correction
    }

    this.props.writeDeclaration(declaration)

    if (userRole === ROLE_REGISTRATION_AGENT) {
      this.props.goToHomeTab(WORKQUEUE_TABS.sentForApproval)
    } else {
      this.props.goToHomeTab(WORKQUEUE_TABS.readyForReview)
    }
  }

  gotoReviewPage = () => {
    this.props.goToPageGroup(
      CERTIFICATE_CORRECTION_REVIEW,
      this.props.declaration.id,
      ReviewSection.Review,
      'review-view-group',
      this.props.declaration.event
    )
  }
}

export const CorrectionSummary = connect(
  (state: IStoreState) => ({
    registerForm: getRegisterForm(state),
    offlineResources: getOfflineData(state),
    language: getLanguage(state),
    userPrimaryOffice: getUserDetails(state)?.primaryOffice,
    userRole: getUserDetails(state)?.systemRole
  }),
  {
    modifyDeclaration,
    writeDeclaration,
    goBack,
    goToPageGroup,
    goToCertificateCorrection,
    goToHomeTab
  }
)(injectIntl(CorrectionSummaryComponent))
