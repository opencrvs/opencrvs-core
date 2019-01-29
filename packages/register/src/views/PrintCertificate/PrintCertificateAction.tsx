import * as React from 'react'
import gql from 'graphql-tag'
import { Query, Mutation } from 'react-apollo'
import styled from 'styled-components'
import { ActionPage, Box } from '@opencrvs/components/lib/interface'
import { Spinner } from '@opencrvs/components/lib/interface'
import { InjectedIntlProps, injectIntl, defineMessages } from 'react-intl'
import { FormFieldGenerator } from 'src/components/form'
import {
  IFormSection,
  IFormSectionData,
  INFORMATIVE_RADIO_GROUP,
  PARAGRAPH,
  IFormData,
  PDF_DOCUMENT_VIEWER,
  IFormField,
  IForm
} from 'src/forms'
import {
  PrimaryButton,
  SecondaryButton,
  IconAction,
  ICON_ALIGNMENT
} from '@opencrvs/components/lib/buttons'
import { connect } from 'react-redux'
import { IStoreState } from 'src/store'
import { hasFormError } from 'src/forms/utils'
import { calculatePrice } from './calculatePrice'
import { Print } from '@opencrvs/components/lib/icons'
import * as moment from 'moment'
import 'moment/locale/bn'
import 'moment/locale/en-ie'
import {
  Registrant,
  Issuer,
  generateMoneyReceipt,
  generateCertificateDataURL,
  CertificateDetails,
  generateAndPrintCertificate
} from './generatePDF'
import { CERTIFICATE_DATE_FORMAT } from 'src/utils/constants'
import { TickLarge, Edit } from '@opencrvs/components/lib/icons'
import {
  storeDraft,
  createReviewDraft,
  IDraftsState
} from '@opencrvs/register/src/drafts'
import { Dispatch } from 'redux'
import StoreTransformer, {
  IReviewSectionDetails
} from 'src/utils/transformData'
import { HeaderContent } from '@opencrvs/components/lib/layout'
import { draftToMutationTransformer } from '../../transformer'
import { documentForWhomFhirMapping } from 'src/forms/register/fieldDefinitions/birth/mappings/documents-mappings'

const COLLECT_CERTIFICATE = 'collectCertificate'
const PAYMENT = 'payment'
const CERTIFICATE_PREVIEW = 'certificatePreview'

export const ActionPageWrapper = styled.div`
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: ${({ theme }) => theme.colors.background};
  z-index: 4;
  width: 100%;
  height: 100%;
  overflow-y: scroll;
`

const StyledSpinner = styled(Spinner)`
  margin: 50% auto;
`

const ErrorText = styled.div`
  color: ${({ theme }) => theme.colors.error};
  font-family: ${({ theme }) => theme.fonts.lightFont};
  text-align: center;
  margin-top: 100px;
`
const FormContainer = styled.div`
  padding: 35px 25px;
`
const Column = styled.div`
  margin: 5px 0px;
  width: 100%;

  &:first-child {
    margin-left: 0px;
  }
  &:last-child {
    margin-right: 0px;
  }
`

const ButtonContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.inputBackground};
  padding: 25px;
  margin-bottom: 2px;
`
const StyledPrimaryButton = styled(PrimaryButton)`
  font-weight: 600;
`
const StyledPrintIcon = styled(Print)`
  display: flex;
  margin: -13px;
`
const StyledIconAction = styled(IconAction)`
  background-color: transparent;
  box-shadow: none;
  min-height: auto;
  padding: 0px;
  width: auto;
  div:first-of-type {
    height: 50px;
    padding: 0px;
  }
  h3 {
    font-family: ${({ theme }) => theme.fonts.boldFont};
    margin-left: 70px;
    color: ${({ theme }) => theme.colors.secondary};
    text-decoration: underline;
    font-size: 16px;
  }
  &:disabled {
    div:first-of-type {
      background: ${({ theme }) => theme.colors.disabledButton};
    }
    g {
      fill: ${({ theme }) => theme.colors.disabled};
    }
    h3 {
      color: ${({ theme }) => theme.colors.disabled};
    }
  }
`
const ConfirmBtn = styled(PrimaryButton)`
  font-weight: bold;
  padding: 15px 35px 15px 20px;
  div {
    position: relative !important;
    margin-right: 20px;
    top: 2px;
  }
  &:disabled {
    background: ${({ theme }) => theme.colors.disabledButton};
    path {
      stroke: ${({ theme }) => theme.colors.disabled};
    }
  }
`

const EditRegistration = styled(SecondaryButton)`
  border: solid 1px ${({ theme }) => theme.colors.disabledButton};
  color: ${({ theme }) => theme.colors.primary} !important;
  font-weight: bold;
  margin: 0px 20px;
  top: 3px;
  position: relative;
  svg {
    margin-right: 15px;
  }
  &:hover {
    background: inherit;
    border: solid 1px ${({ theme }) => theme.colors.disabledButton};
  }
  &:disabled {
    background-color: ${({ theme }) => theme.colors.inputBackground};
  }
`

const Info = styled.div`
  font-family: ${({ theme }) => theme.fonts.regularFont};
  margin-bottom: 30px;
`
const B = styled.div`
  display: block;
  line-height: 50px;
  font-weight: bold;
`

export const FETCH_BIRTH_REGISTRATION_QUERY = gql`
  query data($id: ID!) {
    fetchBirthRegistration(id: $id) {
      _fhirIDMap
      id
      child {
        id
        name {
          use
          firstNames
          familyName
        }
        birthDate
        gender
      }
      mother {
        id
        name {
          use
          firstNames
          familyName
        }
        birthDate
        maritalStatus
        dateOfMarriage
        educationalAttainment
        nationality
        multipleBirth
        identifier {
          id
          type
        }
        address {
          type
          line
          district
          state
          postalCode
          country
        }
        telecom {
          system
          value
        }
      }
      father {
        id
        name {
          use
          firstNames
          familyName
        }
        birthDate
        maritalStatus
        dateOfMarriage
        educationalAttainment
        nationality
        identifier {
          id
          type
        }
        address {
          type
          line
          district
          state
          postalCode
          country
        }
        telecom {
          system
          value
        }
      }
      registration {
        id
        contact
        attachments {
          data
          type
          contentType
          subject
        }
        status {
          comments {
            comment
          }
        }
        trackingId
        registrationNumber
      }
      attendantAtBirth
      weightAtBirth
      birthType
      presentAtBirthRegistration
    }
  }
`

const messages = defineMessages({
  queryError: {
    id: 'print.certificate.queryError',
    defaultMessage:
      'An error occurred while quering for birth registration data',
    description: 'The error message shown when a query fails'
  },
  confirm: {
    id: 'print.certificate.confirm',
    defaultMessage: 'Confirm',
    description:
      'The label for confirm button when all information of the collector is provided'
  },
  printReceipt: {
    id: 'print.certificate.printReceipt',
    defaultMessage: 'Print receipt',
    description: 'The label for print receipt button'
  },
  next: {
    id: 'print.certificate.next',
    defaultMessage: 'Next',
    description: 'The label for next button'
  },
  serviceYear: {
    id: 'register.workQueue.print.serviceYear',
    defaultMessage:
      'Service: <strong>Birth registration after {service, plural, =0 {0 year} one {1 year} other{{service} years}} of D.o.B.</strong><br/>Amount Due:',
    description: 'The label for service paragraph'
  },
  serviceMonth: {
    id: 'register.workQueue.print.serviceMonth',
    defaultMessage:
      'Service: <strong>Birth registration after {service, plural, =0 {0 month} one {1 month} other{{service} months}} of D.o.B.</strong><br/>Amount Due:',
    description: 'The label for service paragraph'
  },
  service: {
    id: 'register.workQueue.print.service',
    defaultMessage:
      'Service: <strong>Birth registration after {service} of D.o.B.</strong><br/>Amount Due:',
    description: 'The label for service paragraph'
  },
  certificateHeader: {
    id: 'register.work-queue.certificate.header'
  },
  certificateSubHeader: {
    id: 'register.work-queue.certificate.subheader'
  },
  certificateIssuer: {
    id: 'register.work-queue.certificate.issuer'
  },
  certificatePaidAmount: {
    id: 'register.work-queue.certificate.amount'
  },
  certificateService: {
    id: 'register.work-queue.certificate.service'
  },
  printCertificate: {
    id: 'register.workQueue.print.printCertificate',
    defaultMessage: 'Print certificate',
    description: 'The label for print certificate button'
  },
  finish: {
    id: 'register.workQueue.print.finish',
    defaultMessage: 'Finish',
    description: 'The label for finish printing certificate button'
  },
  editRegistration: {
    id: 'certificate.btn.editRegistration',
    defaultMessage: 'Edit Registration'
  },
  certificateIsCorrect: {
    id: 'certificate.txt.isCorrectTxt'
  },
  certificateConfirmationTxt: {
    id: 'certificate.txt.confirmationTxt'
  }
})

const certifyMutation = gql`
  mutation markBirthAsCertified($id: ID!, $details: BirthRegistrationInput!) {
    markBirthAsCertified(id: $id, details: $details)
  }
`

type State = {
  currentForm: string
  data: IFormSectionData
  enableConfirmButton: boolean
  certificatePdf: string
}

type IProps = {
  backLabel: string
  title: string
  registrationId: string
  language: string
  togglePrintCertificateSection: () => void
  printCertificateFormSection: IFormSection
  paymentFormSection: IFormSection
  IssuerDetails: Issuer
  certificatePreviewFormSection: IFormSection
  registerForm: IForm
}

type IFullProps = InjectedIntlProps &
  IProps & { dispatch: Dispatch; drafts: IDraftsState }

class PrintCertificateActionComponent extends React.Component<
  IFullProps,
  State
> {
  constructor(props: IFullProps) {
    super(props)
    this.state = {
      data: {},
      enableConfirmButton: false,
      currentForm: COLLECT_CERTIFICATE,
      certificatePdf: ''
    }
  }

  storeData = (documentData: IFormSectionData) => {
    this.setState(
      prevState => ({
        data: { ...prevState.data, ...documentData }
      }),
      () =>
        this.setState(() => ({
          enableConfirmButton: this.shouldEnableConfirmButton(documentData)
        }))
    )
  }

  shouldEnableConfirmButton = (documentData: IFormSectionData) => {
    const form = this.getForm(this.state.currentForm)
    return documentData && !hasFormError(form.fields, documentData)
  }

  addPDFToField(form: IFormSection) {
    form.fields.map((field: IFormField) => {
      if (field.type === PDF_DOCUMENT_VIEWER) {
        field.initialValue = this.state.certificatePdf
      }
    })
    return form
  }

  getForm = (currentForm: string) => {
    const {
      printCertificateFormSection,
      paymentFormSection,
      certificatePreviewFormSection
    } = this.props
    switch (currentForm) {
      case COLLECT_CERTIFICATE:
        return printCertificateFormSection
      case PAYMENT:
        return paymentFormSection
      case CERTIFICATE_PREVIEW:
        const result = this.addPDFToField(certificatePreviewFormSection)
        return result
      default:
        throw new Error(`No form found for id ${currentForm}`)
    }
  }

  processSubmitData() {
    const {
      registrationId,
      drafts: { drafts },
      registerForm
    } = this.props
    const { data } = this.state
    const draft = drafts.find(draftItem => draftItem.id === registrationId) || {
      data: {}
    }

    const result = {
      id: registrationId,
      details: draftToMutationTransformer(registerForm, draft.data)
    }
    let individual = null
    if (data.personCollectingCertificate === documentForWhomFhirMapping.Other) {
      individual = {
        name: [
          {
            use: 'en',
            firstNames: data.otherPersonGivenNames,
            familyName: data.otherPersonFamilyName
          }
        ],
        identifier: [{ id: data.documentNumber, type: data.otherPersonIDType }]
      }
    }

    const certificates = {
      collector: {
        relationship: data.personCollectingCertificate,
        individual
      },
      payments: {
        paymentId: '1',
        type: data.paymentMethod,
        total: data.paymentAmount,
        amount: data.paymentAmount,
        outcome: 'COMPLETED',
        date: Date.now()
      },
      hasShowedVerifiedDocument:
        data.otherPersonSignedAffidavit ||
        data.motherDetails ||
        data.fatherDetails
    }

    result.details.registration.certificates =
      result.details.registration.certificates || []
    result.details.registration.certificates.push(certificates)

    return result
  }

  getFormAction = (
    currentForm: string,
    registrant: Registrant,
    certificateDetails: CertificateDetails
  ) => {
    const { intl, IssuerDetails, paymentFormSection } = this.props
    const { enableConfirmButton } = this.state
    const amountObj = paymentFormSection.fields.find(
      i => i.name === 'paymentAmount'
    )
    let amount = ''
    if (amountObj && amountObj.label && amountObj.initialValue) {
      amount = intl.formatMessage(amountObj.label, {
        paymentAmount: amountObj.initialValue.toString()
      })
    }

    switch (currentForm) {
      case COLLECT_CERTIFICATE:
        return (
          <ButtonContainer>
            <StyledPrimaryButton
              id="print-confirm-button"
              disabled={!enableConfirmButton}
              onClick={this.onConfirmForm}
            >
              {intl.formatMessage(messages.confirm)}
            </StyledPrimaryButton>
          </ButtonContainer>
        )
      case PAYMENT:
        return (
          <>
            <ButtonContainer>
              <StyledIconAction
                id="print-receipt"
                title={intl.formatMessage(messages.printReceipt)}
                icon={() => <StyledPrintIcon />}
                onClick={() => {
                  generateMoneyReceipt(
                    intl,
                    registrant,
                    IssuerDetails,
                    amount,
                    this.props.language
                  )
                }}
              />
            </ButtonContainer>

            <ButtonContainer>
              <StyledPrimaryButton
                id="payment-confirm-button"
                disabled={!enableConfirmButton}
                onClick={() => {
                  this.previewCertificatePDF(certificateDetails)
                  this.onConfirmForm()
                }}
              >
                {intl.formatMessage(messages.next)}
              </StyledPrimaryButton>
            </ButtonContainer>
          </>
        )
      case CERTIFICATE_PREVIEW:
        return (
          <>
            <Box>
              <Info>
                <B>{intl.formatMessage(messages.certificateIsCorrect)}</B>
                {intl.formatMessage(messages.certificateConfirmationTxt)}
              </Info>
              <Mutation
                mutation={certifyMutation}
                variables={this.processSubmitData()}
                onCompleted={() => {
                  this.setState(() => ({
                    enableConfirmButton: true
                  }))
                }}
              >
                {(markBirthAsCertified, { data }) => {
                  return (
                    <ConfirmBtn
                      id="registerApplicationBtn"
                      icon={() => <TickLarge />}
                      align={ICON_ALIGNMENT.LEFT}
                      onClick={() => {
                        markBirthAsCertified()
                      }}
                    >
                      {intl.formatMessage(messages.confirm)}
                    </ConfirmBtn>
                  )
                }}
              </Mutation>
              <EditRegistration id="edit" disabled={true}>
                <Edit />
                {this.props.intl.formatMessage(messages.editRegistration)}
              </EditRegistration>
            </Box>
            <ButtonContainer>
              <StyledIconAction
                id="print-certificate"
                title={intl.formatMessage(messages.printCertificate)}
                icon={() => <StyledPrintIcon />}
                disabled={!enableConfirmButton}
                onClick={() => {
                  generateAndPrintCertificate(certificateDetails)
                }}
              />
            </ButtonContainer>

            <ButtonContainer>
              <StyledPrimaryButton
                id="finish-printing-certificate"
                disabled={!enableConfirmButton}
                onClick={() => (location.href = 'work-queue')}
              >
                {intl.formatMessage(messages.finish)}
              </StyledPrimaryButton>
            </ButtonContainer>
          </>
        )
      default:
        return null
    }
  }

  previewCertificatePDF(certificateDetails: CertificateDetails) {
    generateCertificateDataURL(certificateDetails, (certificatePdf: string) => {
      this.setState(prevState => {
        const result = {
          ...prevState,
          certificatePdf
        }
        return result
      })
    })
  }

  onConfirmForm = () => {
    const { currentForm } = this.state
    let destForm = COLLECT_CERTIFICATE

    switch (currentForm) {
      case COLLECT_CERTIFICATE:
        const { paymentFormSection } = this.props
        const paymentAmountField = paymentFormSection.fields.find(
          field => field.name === 'paymentAmount'
        )
        paymentAmountField && Number(paymentAmountField.initialValue) > 0
          ? (destForm = PAYMENT)
          : (destForm = CERTIFICATE_PREVIEW)
        destForm = PAYMENT
        break
      case PAYMENT:
        destForm = CERTIFICATE_PREVIEW
        break
      default:
        break
    }

    this.setState({ currentForm: destForm })
  }

  setRegistrant(data: IFormData): Registrant {
    const names = data.child.name as Array<{ [key: string]: {} }>
    const nameObj = names.find(name => name.use === this.props.language)
    const registrant = { name: '', DOBDiff: '' }
    moment.locale(this.props.language)

    if (nameObj) {
      registrant.name = nameObj.firstNames + ' ' + nameObj.familyName
      registrant.DOBDiff = moment(data.child.birthDate.toString(), 'YYYY-MM-DD')
        .fromNow()
        .replace(' ago', '')
        .replace(' আগে', '')
    }

    return registrant
  }

  getCertificateDetails(data: IFormData): CertificateDetails {
    const names = data.child.name as Array<{ [key: string]: {} }>
    const NameBn = names.find(name => name.use === 'bn')
    const NameEn = names.find(name => name.use === 'en')
    const DOBEn = moment(data.child.birthDate as string).format(
      CERTIFICATE_DATE_FORMAT
    )
    moment.locale('bn')
    const DOBBn = moment(data.child.birthDate as string).format(
      CERTIFICATE_DATE_FORMAT
    )

    return {
      registrationNo: data.registration.registrationNumber as string,
      name: {
        bn: NameBn ? NameBn.firstNames + ' ' + NameBn.familyName : '',
        en: NameEn ? NameEn.firstNames + ' ' + NameEn.familyName : ''
      },
      dob: {
        bn: DOBBn,
        en: DOBEn
      }
    }
  }

  render = () => {
    const {
      intl,
      backLabel,
      registrationId,
      togglePrintCertificateSection,
      printCertificateFormSection,
      paymentFormSection,
      drafts: { drafts },
      dispatch
    } = this.props

    const { currentForm } = this.state
    const form = this.getForm(currentForm)

    return (
      <ActionPageWrapper>
        <ActionPage
          title={intl.formatMessage(form.title)}
          backLabel={backLabel}
          goBack={togglePrintCertificateSection}
        >
          <HeaderContent>
            <Query
              query={FETCH_BIRTH_REGISTRATION_QUERY}
              variables={{
                id: registrationId
              }}
            >
              {({ loading, error, data }) => {
                if (loading) {
                  return <StyledSpinner id="print-certificate-spinner" />
                }

                if (data) {
                  let fields = printCertificateFormSection.fields
                  fields = fields.map(field => {
                    if (
                      field &&
                      field.type === INFORMATIVE_RADIO_GROUP &&
                      field.name === 'motherDetails'
                    ) {
                      field.information = data.fetchBirthRegistration.mother
                    } else if (
                      field &&
                      field.type === INFORMATIVE_RADIO_GROUP &&
                      field.name === 'fatherDetails'
                    ) {
                      field.information = data.fetchBirthRegistration.father
                    }

                    return field
                  })

                  const paymentAmount = calculatePrice(
                    data.fetchBirthRegistration.child.birthDate
                  )

                  moment.locale(this.props.language)
                  const DOBDiff = moment(
                    data.fetchBirthRegistration.child.birthDate,
                    'YYYY-MM-DD'
                  )
                    .fromNow()
                    .replace(' ago', '')
                    .replace(' আগে', '')

                  paymentFormSection.fields.map(field => {
                    if (
                      field &&
                      field.type === PARAGRAPH &&
                      field.name === 'paymentAmount'
                    ) {
                      field.initialValue = paymentAmount
                    }
                  })

                  paymentFormSection.fields.map(field => {
                    if (
                      field &&
                      field.type === PARAGRAPH &&
                      field.name === 'service'
                    ) {
                      field.initialValue = DOBDiff.toString()
                      field.label = messages[`service`]
                    }
                  })

                  const registrant: Registrant = this.setRegistrant(
                    data.fetchBirthRegistration
                  )

                  const certificateData = this.getCertificateDetails(
                    data.fetchBirthRegistration
                  )

                  const transData: IReviewSectionDetails = StoreTransformer.transformData(
                    data.fetchBirthRegistration
                  )
                  const eventType =
                    transData.registration && transData.registration.type
                  const reviewDraft = createReviewDraft(
                    registrationId,
                    transData,
                    eventType
                  )
                  const draftExist = !!drafts.find(
                    draft => draft.id === registrationId
                  )
                  if (!draftExist) {
                    dispatch(storeDraft(reviewDraft))
                  }

                  return (
                    <FormContainer>
                      <Box>
                        <FormFieldGenerator
                          id={form.id}
                          onChange={this.storeData}
                          setAllFieldsDirty={false}
                          fields={form.fields}
                        />
                      </Box>
                      <Column>
                        {this.state.data.personCollectingCertificate &&
                          this.getFormAction(
                            this.state.currentForm,
                            registrant,
                            certificateData
                          )}
                      </Column>
                    </FormContainer>
                  )
                }
                if (error) {
                  return (
                    <ErrorText id="print-certificate-queue-error-text">
                      {intl.formatMessage(messages.queryError)}
                    </ErrorText>
                  )
                }

                return JSON.stringify(data)
              }}
            </Query>
          </HeaderContent>
        </ActionPage>
      </ActionPageWrapper>
    )
  }
}

const event = 'birth'
export const PrintCertificateAction = connect((state: IStoreState) => ({
  language: state.i18n.language,
  paymentFormSection: state.printCertificateForm.paymentForm,
  certificatePreviewFormSection:
    state.printCertificateForm.certificatePreviewForm,
  drafts: state.drafts,
  registerForm: state.registerForm.registerForm[event]
}))(injectIntl<IFullProps>(PrintCertificateActionComponent))
