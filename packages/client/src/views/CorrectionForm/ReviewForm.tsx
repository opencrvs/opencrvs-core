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
import {
  replaceInitialValues,
  RouteProps
} from '@client/views/RegisterForm/RegisterForm'
import {
  IFormSection,
  IFormField,
  IForm,
  IFormSectionGroup,
  IFormSectionData,
  CorrectionSection
} from '@client/forms'
import { EventTopBar, Spinner } from '@opencrvs/components/lib/interface'
import { WrappedComponentProps as IntlShapeProps, injectIntl } from 'react-intl'
import { messages } from '@client/i18n/messages/views/correction'
import { messages as registerMessages } from '@client/i18n/messages/views/register'
import {
  modifyApplication,
  writeApplication,
  IApplication
} from '@client/applications'
import { ReviewSection } from '@client/views/RegisterForm/review/ReviewSection'
import { IStoreState } from '@client/store'
import {
  getNextSectionIds,
  getVisibleSectionGroupsBasedOnConditions,
  getVisibleGroupFields,
  hasFormError,
  getSectionFields,
  VIEW_TYPE
} from '@client/forms/utils'
import { getScope } from '@client/profile/profileSelectors'
import { Scope } from '@client/utils/authUtils'
import {
  goBack,
  goToPageGroup,
  goToHomeTab,
  goToCertificateCorrection
} from '@client/navigation'
import { CERTIFICATE_CORRECTION_REVIEW } from '@client/navigation/routes'
import { connect } from 'react-redux'
import {
  TertiaryButton,
  ICON_ALIGNMENT,
  PrimaryButton,
  LinkButton
} from '@opencrvs/components/lib/buttons'
import { BackArrow } from '@opencrvs/components/lib/icons'
import { getEventReviewForm } from '@client/forms/register/review-selectors'
import { BodyContent, Container } from '@opencrvs/components/lib/layout'
import styled, { keyframes } from '@client/styledComponents'
import { buttonMessages, formMessages } from '@client/i18n/messages'
import {
  FormFieldGenerator,
  ITouchedNestedFields
} from '@client/components/form'
import debounce from 'lodash/debounce'
import { FormikTouched, FormikValues } from 'formik'
import { flatten } from 'lodash'
import {
  PAGE_TRANSITIONS_CLASSNAME,
  PAGE_TRANSITIONS_TIMING_FUNC_N_FILL_MODE,
  PAGE_TRANSITIONS_EXIT_TIME
} from '@client/utils/constants'

const fadeFromTop = keyframes`
  to {
    -webkit-transform: translateY(100vh);
    transform: translateY(100vh);
  }
`

const StyledContainer = styled(Container)`
  &.${PAGE_TRANSITIONS_CLASSNAME}-exit {
    top: 0;
    z-index: 999;
    animation: ${fadeFromTop} ${PAGE_TRANSITIONS_EXIT_TIME}ms
      ${PAGE_TRANSITIONS_TIMING_FUNC_N_FILL_MODE};
  }

  &.${PAGE_TRANSITIONS_CLASSNAME}-exit-active {
    z-index: 999;
  }
`

const StyledLinkButton = styled(LinkButton)`
  margin-left: 32px;
`
const FormSectionTitle = styled.h4`
  ${({ theme }) => theme.fonts.h4Style};
  color: ${({ theme }) => theme.colors.copy};
  margin-top: 16px;
  margin-bottom: 24px;
`

const FooterArea = styled.div`
  padding-top: 6px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    padding-top: 0px;
  }
`

const Notice = styled.div`
  background: ${({ theme }) => theme.colors.primary};
  box-shadow: 0 0 12px 0 rgba(0, 0, 0, 0.11);
  padding: 25px;
  color: ${({ theme }) => theme.colors.white};
  ${({ theme }) => theme.fonts.bigBodyStyle};
  margin: 30px -25px;
`

const SpinnerWrapper = styled.div`
  height: 80vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px;
`

const Required = styled.span<
  { disabled?: boolean } & React.LabelHTMLAttributes<HTMLLabelElement>
>`
  ${({ theme }) => theme.fonts.bigBodyStyle};
  color: ${({ disabled, theme }) =>
    disabled ? theme.colors.disabled : theme.colors.error};
  flex-grow: 0;
`

const Optional = styled.span<
  { disabled?: boolean } & React.LabelHTMLAttributes<HTMLLabelElement>
>`
  ${({ theme }) => theme.fonts.bigBodyStyle};
  color: ${({ disabled, theme }) =>
    disabled ? theme.colors.disabled : theme.colors.placeholder};
  flex-grow: 0;
`

type IStateProps = {
  reviewForm: IForm
  scope: Scope | null
  isWritingDraft: boolean
  setAllFieldsDirty: boolean
  fieldsToShowValidationErrors: IFormField[]
  activeSection: IFormSection
  activeSectionGroup: IFormSectionGroup
  application: IApplication
  pageRoute: string
}

type IDispatchProps = {
  modifyApplication: typeof modifyApplication
  writeApplication: typeof writeApplication
  goToPageGroup: typeof goToPageGroup
  goBack: typeof goBack
  goToHomeTab: typeof goToHomeTab
  goToCertificateCorrection: typeof goToCertificateCorrection
}

type IProps = IStateProps & IDispatchProps & IntlShapeProps & RouteProps

class CorrectionReviewFormComponent extends React.Component<IProps> {
  setAllFormFieldsTouched!: (touched: FormikTouched<FormikValues>) => void

  showAllValidationErrors = () => {
    const touched = getSectionFields(
      this.props.activeSection,
      this.props.application.data[this.props.activeSection.id],
      this.props.application.data
    ).reduce((memo, field) => {
      let fieldTouched: boolean | ITouchedNestedFields = true
      if (field.nestedFields) {
        fieldTouched = {
          value: true,
          nestedFields: flatten(Object.values(field.nestedFields)).reduce(
            (nestedMemo, nestedField) => ({
              ...nestedMemo,
              [nestedField.name]: true
            }),
            {}
          )
        }
      }
      return { ...memo, [field.name]: fieldTouched }
    }, {})
    this.setAllFormFieldsTouched(touched)
  }

  componentDidUpdate(prevProps: IProps) {
    const oldHash = prevProps.location && prevProps.location.hash
    const newHash = this.props.location && this.props.location.hash

    if (newHash && oldHash !== newHash && !newHash.match('form-input')) {
      this.props.history.replace({
        pathname: this.props.history.location.pathname,
        hash: newHash + '-form-input'
      })
    }
  }

  modifyApplication = debounce(
    (
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
    },
    300
  )

  continueButtonHandler = async (
    pageRoute: string,
    applicationId: string,
    pageId: string,
    groupId: string,
    event: string
  ) => {
    const { preventContinueIfError } = this.props.activeSectionGroup
    let groupHasError = false
    if (preventContinueIfError) {
      if (!this.props.application.data[this.props.activeSection.id]) {
        groupHasError = true
      } else {
        const activeSectionFields = this.props.activeSectionGroup.fields
        const activeSectionValues =
          this.props.application.data[this.props.activeSection.id]
        groupHasError = hasFormError(activeSectionFields, activeSectionValues)
      }
      if (groupHasError) {
        this.showAllValidationErrors()
        return
      }
    }

    this.updateVisitedGroups()

    this.props.writeApplication(this.props.application, () => {
      this.props.goToPageGroup(pageRoute, applicationId, pageId, groupId, event)
    })
  }

  updateVisitedGroups = () => {
    const visitedGroups = this.props.application.visitedGroupIds || []
    if (
      visitedGroups.findIndex(
        (visitedGroup) =>
          visitedGroup.sectionId === this.props.activeSection.id &&
          visitedGroup.groupId === this.props.activeSectionGroup.id
      ) === -1
    ) {
      visitedGroups.push({
        sectionId: this.props.activeSection.id,
        groupId: this.props.activeSectionGroup.id
      })
    }
    this.props.application.visitedGroupIds = visitedGroups
  }

  goBack() {
    this.props.goToCertificateCorrection(
      this.props.application.id,
      CorrectionSection.Corrector
    )
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

  render() {
    const {
      application,
      activeSection,
      activeSectionGroup,
      fieldsToShowValidationErrors,
      intl,
      isWritingDraft,
      reviewForm,
      pageRoute,
      setAllFieldsDirty
    } = this.props

    const nextSectionGroup = getNextSectionIds(
      reviewForm.sections,
      activeSection,
      activeSectionGroup,
      application
    )

    const backButton = (
      <TertiaryButton
        align={ICON_ALIGNMENT.LEFT}
        icon={() => <BackArrow />}
        onClick={goBack}
      />
    )
    return (
      <>
        <StyledContainer
          className={PAGE_TRANSITIONS_CLASSNAME}
          id="informant_parent_view"
        >
          <EventTopBar
            title={intl.formatMessage(messages.title, {
              event: application.event
            })}
            pageIcon={backButton}
            goHome={this.cancelCorrection}
          />
          {activeSection.viewType === VIEW_TYPE.REVIEW && (
            <ReviewSection
              pageRoute={pageRoute}
              draft={application}
              submitClickEvent={() => {}}
              onChangeReviewForm={this.modifyApplication}
              /*
               * TODO: go to next form
               */
              onContinue={() => {}}
            />
          )}
          {activeSection.viewType === VIEW_TYPE.FORM && (
            <>
              <BodyContent id="correction_review_form">
                {isWritingDraft ? (
                  <SpinnerWrapper>
                    <Spinner id="draft_write_loading" />
                  </SpinnerWrapper>
                ) : (
                  <>
                    <TertiaryButton
                      align={ICON_ALIGNMENT.LEFT}
                      icon={() => <BackArrow />}
                      onClick={this.props.goBack}
                    >
                      {intl.formatMessage(buttonMessages.back)}
                    </TertiaryButton>
                    <FormSectionTitle
                      id={`form_section_title_${activeSectionGroup.id}`}
                    >
                      {(!activeSectionGroup.ignoreSingleFieldView &&
                        activeSectionGroup.fields.length === 1 && (
                          <>
                            {(activeSectionGroup.fields[0].hideHeader = true)}
                            {intl.formatMessage(
                              activeSectionGroup.fields[0].label
                            )}
                            {activeSectionGroup.fields[0].required && (
                              <Required
                                disabled={
                                  activeSectionGroup.disabled ||
                                  activeSection.disabled ||
                                  false
                                }
                              >
                                &nbsp;*
                              </Required>
                            )}
                          </>
                        )) || (
                        <>
                          {intl.formatMessage(
                            activeSectionGroup.title || activeSection.title
                          )}
                          {activeSection.optional && (
                            <Optional
                              id={`form_section_opt_label_${activeSectionGroup.id}`}
                              disabled={
                                activeSectionGroup.disabled ||
                                activeSection.disabled
                              }
                            >
                              &nbsp;&nbsp;•&nbsp;
                              {intl.formatMessage(formMessages.optionalLabel)}
                            </Optional>
                          )}
                        </>
                      )}
                    </FormSectionTitle>
                    {activeSection.notice && (
                      <Notice
                        id={`form_section_notice_${activeSectionGroup.id}`}
                      >
                        {intl.formatMessage(activeSection.notice)}
                      </Notice>
                    )}
                    <form
                      id={`form_section_id_${activeSectionGroup.id}`}
                      onSubmit={(event: React.FormEvent) =>
                        event.preventDefault()
                      }
                    >
                      <FormFieldGenerator
                        id={activeSectionGroup.id}
                        onChange={(values) => {
                          this.modifyApplication(
                            values,
                            activeSection,
                            application
                          )
                        }}
                        setAllFieldsDirty={setAllFieldsDirty}
                        fieldsToShowValidationErrors={
                          fieldsToShowValidationErrors
                        }
                        fields={getVisibleGroupFields(activeSectionGroup)}
                        draftData={application.data}
                        onSetTouched={(setTouchedFunc) => {
                          this.setAllFormFieldsTouched = setTouchedFunc
                        }}
                      />
                    </form>
                    {nextSectionGroup && (
                      <FooterArea>
                        <PrimaryButton
                          id="next_section"
                          onClick={() => {
                            this.continueButtonHandler(
                              this.props.pageRoute,
                              application.id,
                              nextSectionGroup.sectionId,
                              nextSectionGroup.groupId,
                              application.event.toLowerCase()
                            )
                          }}
                        >
                          {intl.formatMessage(buttonMessages.continueButton)}
                        </PrimaryButton>
                        {application.review && (
                          <StyledLinkButton
                            id="back-to-review-button"
                            className="item"
                            onClick={() => {
                              this.continueButtonHandler(
                                this.props.pageRoute,
                                application.id,
                                'review',
                                'review-view-group',
                                application.event.toLowerCase()
                              )
                            }}
                          >
                            {intl.formatMessage(
                              registerMessages.backToReviewButton
                            )}
                          </StyledLinkButton>
                        )}
                      </FooterArea>
                    )}
                  </>
                )}
              </BodyContent>
            </>
          )}
        </StyledContainer>
      </>
    )
  }
}

function firstVisibleSection(sections: IFormSection[]) {
  return sections.filter(({ viewType }) => viewType !== 'hidden')[0]
}

function mapStateToProps(state: IStoreState, props: RouteProps): IStateProps {
  const { match } = props

  const { applicationId } = match.params

  const application = state.applicationsState.applications.find(
    (app) => app.id === applicationId
  )

  if (!application) {
    throw new Error(`Draft "${match.params.applicationId}" missing!`)
  }

  const event = application.event

  const reviewForm = getEventReviewForm(state, event)

  const sectionId =
    match.params.pageId || firstVisibleSection(reviewForm.sections).id

  const activeSection = reviewForm.sections.find(
    (section) => section.id === sectionId
  )
  if (!activeSection) {
    throw new Error(`Configuration for tab "${match.params.pageId}" missing!`)
  }
  const groupId =
    match.params.groupId ||
    getVisibleSectionGroupsBasedOnConditions(
      activeSection,
      application.data[activeSection.id] || {},
      application.data
    )[0].id

  const activeSectionGroup = activeSection.groups.find(
    (group) => group.id === groupId
  )

  if (!activeSectionGroup) {
    throw new Error(
      `Configuration for group "${match.params.groupId}" missing!`
    )
  }

  const setAllFieldsDirty =
    (application.visitedGroupIds &&
      application.visitedGroupIds.findIndex(
        (visitedGroup) =>
          visitedGroup.sectionId === activeSection.id &&
          visitedGroup.groupId === activeSectionGroup.id
      ) > -1) ||
    false

  const fields = replaceInitialValues(
    activeSectionGroup.fields,
    application.data[activeSection.id] || {},
    application.data
  )

  let updatedFields: IFormField[] = []

  if (!setAllFieldsDirty) {
    updatedFields = activeSectionGroup.fields.filter(
      (field, index) => fields[index].initialValue !== field.initialValue
    )
  }

  return {
    application,
    reviewForm,
    scope: getScope(state),
    isWritingDraft: state.applicationsState.isWritingDraft,
    setAllFieldsDirty,
    fieldsToShowValidationErrors: updatedFields,
    activeSection,
    activeSectionGroup: {
      ...activeSectionGroup,
      fields
    },
    pageRoute: CERTIFICATE_CORRECTION_REVIEW
  }
}

export const CorrectionReviewForm = connect(mapStateToProps, {
  modifyApplication,
  writeApplication,
  goBack,
  goToPageGroup,
  goToHomeTab,
  goToCertificateCorrection
})(injectIntl(CorrectionReviewFormComponent))
