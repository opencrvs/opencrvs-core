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
import { flatten, isArray, flattenDeep, get, clone } from 'lodash'
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
  IFormTag,
  REVIEW_OVERRIDE_POSITION,
  IFormFieldValue
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
  sectionHasError
} from './utils'
import { IStoreState } from '@client/store'
import { getRegisterForm } from '@client/forms/register/application-selectors'
import { getLanguage } from '@client/i18n/selectors'
import { getVisibleSectionGroupsBasedOnConditions } from '@client/forms/utils'
import { getOfflineData } from '@client/offline/selectors'
import { IOfflineData } from '@client/offline/reducer'
import { CorrectorRelationship } from '@client/forms/correction/corrector'
import { CorrectionReason } from '@client/forms/correction/reason'

const SupportingDocument = styled.div`
  display: flex;
  margin: 8px 0;
  & span:last-child {
    padding-left: 8px;
  }
`
interface IProps {
  registerForm: { [key: string]: IForm }
  offlineResources: IOfflineData
  language: string
}

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

type IFullProps = IProps & IStateProps & IDispatchProps & IntlShapeProps

class CorrectionSummaryComponent extends React.Component<IFullProps> {
  section = correctionFeesPaymentSection
  group = this.section.groups[0]

  componentDidMount() {
    this.group = {
      ...this.group,
      fields: replaceInitialValues(
        this.group.fields,
        this.props.application.data[this.section.id] || {},
        this.props.application.data
      )
    }
  }

  render() {
    const {
      registerForm,
      application,
      intl,
      goBack,
      application: { event }
    } = this.props
    const formSections = getViewableSection(registerForm[event], application)
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
        disabled={sectionHasError(this.group, this.section, application)}
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
          goHome={() => this.props.goToHomeTab('review')}
        >
          <Content
            title={intl.formatMessage(messages.correctionSummaryTitle)}
            topActionButtons={[backToReviewButton]}
            bottomActionButtons={[continueButton]}
          >
            <ListTable
              isLoading={false}
              content={this.getChanges(formSections)}
              hideBoxShadow={true}
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
            ></ListTable>
            <ListTable
              hideTableBottomBorder={true}
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
              hideTableBottomBorder={true}
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
              hideTableBottomBorder={true}
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
              hideTableBottomBorder={true}
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
            <FormFieldGenerator
              id={this.group.id}
              onChange={(values) => {
                this.modifyApplication(
                  values,
                  correctionFeesPaymentSection,
                  application
                )
              }}
              setAllFieldsDirty={false}
              fields={this.group.fields}
              draftData={application.data}
            />
          </Content>
        </ActionPageLight>
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
    const { application, intl, offlineResources, language } = this.props
    if (
      application.originalData &&
      hasFieldChanged(
        field,
        application.data[section.id],
        application.originalData[section.id]
      )
    ) {
      const changed = this.getFieldValue(
        section,
        application.data,
        field,
        intl,
        offlineResources,
        language,
        ignoreNestedFieldWrapping
      )
      const original = this.getFieldValue(
        section,
        application.originalData,
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
    const { application, intl, offlineResources, language } = this.props
    if (field.previewGroup && !visitedTags.includes(field.previewGroup)) {
      visitedTags.push(field.previewGroup)

      const baseTag = field.previewGroup
      const taggedFields: IFormField[] = []
      group.fields.forEach((field) => {
        if (
          isVisibleField(field, section, application, offlineResources) &&
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
                  application,
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
          ) as IFormTag[])) ||
        []
      const values = taggedFields
        .map((field) =>
          this.getFieldValue(
            section,
            application.data,
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

      const applicationOriginalData = application.originalData
      if (applicationOriginalData && hasAnyFieldChanged) {
        const previousValues = taggedFields
          .map((field, index) =>
            this.getFieldValue(
              section,
              applicationOriginalData,
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
      application: { data, originalData },
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
    const { application, intl, offlineResources, language } = this.props
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
    const { application, offlineResources, language } = this.props
    const overriddenFields = getOverriddenFieldsListForPreview(
      formSections,
      application,
      offlineResources
    )
    let tempItem: any

    let items: any[] = []
    formSections.forEach((section) => {
      const visitedTags: string[] = []
      const visibleGroups = getVisibleSectionGroupsBasedOnConditions(
        section,
        application.data[section.id] || {},
        application.data
      )
      visibleGroups.forEach((group) => {
        group.fields
          .filter(
            (field) =>
              isVisibleField(field, section, application, offlineResources) &&
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
                  application.data[section.id],
                  application.originalData &&
                    application.originalData[section.id]
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

  modifyApplication = (
    sectionData: IFormSectionData,
    activeSection: IFormSection,
    application: IApplication
  ) => {
    this.props.modifyApplication({
      ...application,
      data: {
        ...application.data,
        [activeSection.id]: {
          ...application.data[activeSection.id],
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
    const corrector = this.props.application.data.corrector as IFormSectionData

    const relationship =
      corrector &&
      ((corrector.relationship as IFormSectionData).value as string)
    switch (relationship) {
      case CorrectorRelationship.INFORMANT:
        return this.getName(this.props.application.data.informant)
      case CorrectorRelationship.MOTHER:
        return this.getName(this.props.application.data.mother)
      case CorrectorRelationship.FATHER:
        return this.getName(this.props.application.data.father)
      case CorrectorRelationship.CHILD:
        return this.getName(this.props.application.data.child)
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
    const corrector = this.props.application.data.corrector as IFormSectionData
    const idChecked =
      corrector &&
      ((corrector as IFormSectionData).hasShowedVerifiedDocument as boolean)
    return idChecked
      ? this.props.intl.formatMessage(messages.idCheckWithoutVerify)
      : this.props.intl.formatMessage(messages.idCheckVerify)
  }

  getReasonForRequest = () => {
    const reason = this.props.application.data.reason as IFormSectionData
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
          (reasonType.nestedFields as IFormSectionData)
            .reasonForChange as string
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
    const reason = this.props.application.data.reason as IFormSectionData
    const comments = reason && (reason.additionalComment as string)

    return (
      <div>
        <div>{comments}</div>
        <LinkButton
          id="change-comment-link"
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
    const supportingDocuments = this.props.application.data
      .supportingDocuments as IFormSectionData
    const proofOfDoc =
      supportingDocuments &&
      (supportingDocuments.uploadDocForLegalProof as IFormSectionData[])

    return (
      <div>
        {proofOfDoc &&
          proofOfDoc.map((proof) => {
            const doc = proof.optionValues as IFormSectionData[]
            return (
              <SupportingDocument>
                <PaperClip />
                <span>{doc[1]}</span>
              </SupportingDocument>
            )
          })}
        <LinkButton
          id="upload-supporting-doc-link"
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

export const CorrectionSummary = connect(
  (state: IStoreState) => ({
    registerForm: getRegisterForm(state),
    offlineResources: getOfflineData(state),
    language: getLanguage(state)
  }),
  {
    modifyApplication,
    goBack,
    goToPageGroup,
    goToCertificateCorrection,
    goToHomeTab
  }
)(injectIntl(CorrectionSummaryComponent))
