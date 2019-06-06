import * as React from 'react'
import styled from '@register/styledComponents'
import {
  ActionPage,
  Box,
  Spinner,
  InvertSpinner
} from '@opencrvs/components/lib/interface'

import {
  InjectedIntlProps,
  injectIntl,
  defineMessages,
  InjectedIntl
} from 'react-intl'
import { FormFieldGenerator } from '@register/components/form'
import {
  IFormSection,
  IFormSectionData,
  INFORMATIVE_RADIO_GROUP,
  PARAGRAPH,
  IFormData,
  PDF_DOCUMENT_VIEWER,
  IFormField,
  IForm,
  Event,
  Action
} from '@register/forms'
import {
  PrimaryButton,
  SecondaryButton,
  IconAction
} from '@opencrvs/components/lib/buttons'
import { connect } from 'react-redux'
import { IStoreState } from '@register/store'
import { hasFormError } from '@register/forms/utils'
import { calculatePrice } from '@register/views/PrintCertificate/calculatePrice'
import { Print, TickLarge, Edit } from '@opencrvs/components/lib/icons'
import moment from 'moment'
import 'moment/locale/bn'
import 'moment/locale/en-ie'
import {
  Registrant,
  generateMoneyReceipt,
  generateCertificateDataURL,
  CertificateDetails,
  generateAndPrintCertificate
} from '@register/views/PrintCertificate/generatePDF'
import {
  CERTIFICATE_DATE_FORMAT,
  CERTIFICATION,
  COMPLETION
} from '@register/utils/constants'

import {
  storeApplication,
  createReviewApplication,
  IApplicationsState,
  IApplication
} from '@opencrvs/register/src/applications'
import { Dispatch } from 'redux'
import { BodyContent } from '@opencrvs/components/lib/layout'
import {
  fatherDataDoesNotExist,
  fatherDataExists
} from '@register/forms/certificate/fieldDefinitions/collector-section'
import {
  gqlToDraftTransformer,
  draftToGqlTransformer
} from '@register/transformer'
import { documentForWhomFhirMapping } from '@register/forms/register/fieldDefinitions/birth/mappings/mutation/documents-mappings'
import {
  MutationProvider,
  MutationContext
} from '@register/views/DataProvider/MutationProvider'
import {
  QueryProvider,
  QueryContext
} from '@register/views/DataProvider/QueryProvider'
import { getUserDetails } from '@register/profile/profileSelectors'
import { GQLHumanName } from '@opencrvs/gateway/src/graphql/schema'
import { IUserDetails } from '@register/utils/userUtils'
import { RouteComponentProps } from 'react-router'
import { goToHome } from '@register/navigation'

import { CONFIRMATION_SCREEN } from '@register/navigation/routes'
import {
  IOfflineDataState,
  OFFLINE_LOCATIONS_KEY,
  OFFLINE_FACILITIES_KEY,
  ILocation
} from '@register/offline/reducer'
import { getOfflineState } from '@register/offline/selectors'
import { renderSelectDynamicLabel } from '@register/views/RegisterForm/review/ReviewSection'
import * as Sentry from '@sentry/browser'

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
  ${({ theme }) => theme.fonts.bodyStyle};
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
  background-color: ${({ theme }) => theme.colors.background};
  padding: 25px;
  margin-bottom: 2px;
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
    ${({ theme }) => theme.fonts.bodyBoldStyle};
    margin-left: 70px;
    color: ${({ theme }) => theme.colors.secondary};
    text-decoration: underline;
  }
  &:disabled {
    div:first-of-type {
      background: ${({ theme }) => theme.colors.disabled};
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
  min-width: 148px;
  padding: 15px 20px 15px 20px;
  span {
    margin: 0 auto;
  }
  &:disabled {
    background: ${({ theme }) => theme.colors.primary};
    path {
      stroke: ${({ theme }) => theme.colors.disabled};
    }
  }
`

const EditRegistration = styled(SecondaryButton)`
  border: solid 1px ${({ theme }) => theme.colors.disabled};
  color: ${({ theme }) => theme.colors.primary} !important;
  margin: 0px 20px;
  top: 3px;
  position: relative;
  svg {
    margin-right: 15px;
  }
  &:hover {
    background: inherit;
    border: solid 1px ${({ theme }) => theme.colors.disabled};
  }
  &:disabled {
    background-color: ${({ theme }) => theme.colors.background};
  }

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    margin-left: 0px;
    margin-top: 15px;
  }
`

const Info = styled.div`
  ${({ theme }) => theme.fonts.bodyStyle};
  margin-bottom: 30px;
`
const B = styled.div`
  display: block;
  ${({ theme }) => theme.fonts.bodyBoldStyle};
`

const ButtonSpinner = styled(InvertSpinner)`
  width: 15px;
  height: 15px;
  top: 0px !important;
`

const messages: {
  [key: string]: ReactIntl.FormattedMessage.MessageDescriptor
} = defineMessages({
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
    id: 'print.certificate.serviceYear',
    defaultMessage:
      'Service: <strong>Birth registration after {service, plural, =0 {0 year} one {1 year} other{{service} years}} of D.o.B.</strong><br/>Amount Due:',
    description: 'The label for service paragraph'
  },
  serviceMonth: {
    id: 'print.certificate.serviceMonth',
    defaultMessage:
      'Service: <strong>Birth registration after {service, plural, =0 {0 month} one {1 month} other{{service} months}} of D.o.B.</strong><br/>Amount Due:',
    description: 'The label for service paragraph'
  },
  birthService: {
    id: 'print.certificate.birthService'
  },
  deathService: {
    id: 'print.certificate.deathService'
  },
  certificateHeader: {
    id: 'print.certificate.header'
  },
  certificateSubHeader: {
    id: 'print.certificate.subheader'
  },
  certificateIssuer: {
    id: 'print.certificate.issuer'
  },
  certificatePaidAmount: {
    id: 'print.certificate.amount'
  },
  certificateService: {
    id: 'print.certificate.service'
  },
  printCertificate: {
    id: 'print.certificate.printCertificate',
    defaultMessage: 'Print certificate',
    description: 'The label for print certificate button'
  },
  finish: {
    id: 'print.certificate.finish',
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
  state: {
    id: 'formFields.state',
    defaultMessage: 'Division',
    description: 'The label for state of event location'
  },
  district: {
    id: 'formFields.district',
    defaultMessage: 'District',
    description: 'The label for district of event location'
  },
  certificateConfirmationTxt: {
    id: 'certificate.txt.confirmationTxt'
  },
  back: {
    id: 'menu.back',
    defaultMessage: 'Back',
    description: 'Back button in the menu'
  },
  FIELD_AGENT: {
    id: 'register.home.header.FIELD_AGENT',
    defaultMessage: 'Field Agent',
    description: 'The description for FIELD_AGENT role'
  },
  REGISTRATION_CLERK: {
    id: 'register.home.header.REGISTRATION_CLERK',
    defaultMessage: 'Registration Clerk',
    description: 'The description for REGISTRATION_CLERK role'
  },
  LOCAL_REGISTRAR: {
    id: 'register.home.header.LOCAL_REGISTRAR',
    defaultMessage: 'Registrar',
    description: 'The description for LOCAL_REGISTRAR role'
  },
  DISTRICT_REGISTRAR: {
    id: 'register.home.header.DISTRICT_REGISTRAR',
    defaultMessage: 'District Registrar',
    description: 'The description for DISTRICT_REGISTRAR role'
  },
  STATE_REGISTRAR: {
    id: 'register.home.header.STATE_REGISTRAR',
    defaultMessage: 'State Registrar',
    description: 'The description for STATE_REGISTRAR role'
  },
  NATIONAL_REGISTRAR: {
    id: 'register.home.header.NATIONAL_REGISTRAR',
    defaultMessage: 'National Registrar',
    description: 'The description for NATIONAL_REGISTRAR role'
  }
})

const locationText = {
  district: {
    en: 'District',
    bn: 'জেলা'
  },
  state: {
    en: 'Division',
    bn: 'বিভাগ'
  }
}

interface IFullName {
  fullNameInBn: string
  fullNameInEng: string
}

export const getFullName = (
  certificateDetails: CertificateDetails
): IFullName => {
  let fullNameInBn = ''
  let fullNameInEng = ''
  if (certificateDetails && certificateDetails.name) {
    fullNameInBn = String(certificateDetails.name.bn)
    fullNameInEng = String(certificateDetails.name.en)
  }
  return {
    fullNameInBn,
    fullNameInEng
  }
}

interface ICertDetail {
  [key: string]: any
}
interface ICertDetails {
  [key: string]: ICertDetail
}

type State = {
  currentForm: string
  data: IFormSectionData
  enableConfirmButton: boolean
  certificatePdf: string
}

type IProps = {
  event: Event
  registrationId: string
  language: string
  collectCertificateForm: IFormSection
  paymentFormSection: IFormSection
  certificatePreviewFormSection: IFormSection
  registerForm: IForm
  userDetails: IUserDetails | null
  offlineResources: IOfflineDataState
  draft: IApplication
}

type IFullProps = InjectedIntlProps &
  RouteComponentProps<{}> &
  IProps & { dispatch: Dispatch; drafts: IApplicationsState }

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

  finishSubmission = (certificateDetails: CertificateDetails) => {
    const { history, event } = this.props
    const fullName = getFullName(certificateDetails)
    const noOfCertificate = 103

    history.push(CONFIRMATION_SCREEN, {
      trackNumber: noOfCertificate,
      trackingSection: true,
      eventName: CERTIFICATION,
      actionName: COMPLETION,
      fullNameInBn: fullName.fullNameInBn,
      fullNameInEng: fullName.fullNameInEng,
      eventType: event
    })
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
    if (form.id !== 'certificatePreview') {
      return documentData && !hasFormError(form.fields, documentData)
    } else {
      return false
    }
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
      collectCertificateForm,
      paymentFormSection,
      certificatePreviewFormSection
    } = this.props
    switch (currentForm) {
      case COLLECT_CERTIFICATE:
        return collectCertificateForm
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
    const { registrationId, registerForm, draft } = this.props
    const { data } = this.state

    const result = {
      id: registrationId,
      details: draftToGqlTransformer(registerForm, draft.data)
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
    const { intl, paymentFormSection, event } = this.props
    const { enableConfirmButton } = this.state
    const issuerDetails = this.getIssuerDetails()
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
            <PrimaryButton
              id="print-confirm-button"
              disabled={!enableConfirmButton}
              onClick={() => {
                this.previewCertificatePDF(certificateDetails)
                this.onConfirmForm()
              }}
            >
              {intl.formatMessage(messages.confirm)}
            </PrimaryButton>
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
                    issuerDetails,
                    amount,
                    this.props.language,
                    event
                  )
                }}
              />
            </ButtonContainer>

            <ButtonContainer>
              <PrimaryButton
                id="payment-confirm-button"
                disabled={!enableConfirmButton}
                onClick={() => {
                  this.previewCertificatePDF(certificateDetails)
                  this.onConfirmForm()
                }}
              >
                {intl.formatMessage(messages.next)}
              </PrimaryButton>
            </ButtonContainer>
          </>
        )
      case CERTIFICATE_PREVIEW:
        return (
          <>
            <Box>
              <Info>
                <B>
                  {intl.formatMessage(messages.certificateIsCorrect, { event })}
                </B>
                {intl.formatMessage(messages.certificateConfirmationTxt)}
              </Info>
              <MutationProvider
                event={event}
                action={Action.COLLECT_CERTIFICATE}
                payload={this.processSubmitData()}
                onCompleted={() => {
                  this.setState(() => ({
                    enableConfirmButton: true
                  }))
                }}
              >
                <MutationContext.Consumer>
                  {({ mutation, loading, data }) => (
                    <ConfirmBtn
                      id="registerApplicationBtn"
                      disabled={loading || data}
                      // @ts-ignore
                      onClick={() => mutation()}
                    >
                      {!loading && (
                        <>
                          <TickLarge />
                          <span>{intl.formatMessage(messages.confirm)}</span>
                        </>
                      )}
                      {loading && (
                        <span>
                          <ButtonSpinner id="Spinner" />
                        </span>
                      )}
                    </ConfirmBtn>
                  )}
                </MutationContext.Consumer>
              </MutationProvider>
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
              <PrimaryButton
                id="finish-printing-certificate"
                disabled={!enableConfirmButton}
                onClick={() => this.finishSubmission(certificateDetails)}
              >
                {intl.formatMessage(messages.finish)}
              </PrimaryButton>
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
    const { event } = this.props
    let names
    let eventDateTime
    if (event === Event.BIRTH) {
      names = data.child.name as ICertDetail[]
      eventDateTime = data.child.birthDate
    }
    if (event === Event.DEATH) {
      names = data.deceased.name as ICertDetail[]
      eventDateTime = (data.deceased.deceased as { [key: string]: string })
        .deathDate
    }
    const nameObj =
      names && names.find(name => name.use === this.props.language)
    const registrant = { name: '', DOBDiff: '' }
    moment.locale(this.props.language)

    if (nameObj) {
      registrant.name = nameObj.firstNames + ' ' + nameObj.familyName
    }
    if (eventDateTime) {
      registrant.DOBDiff = moment(eventDateTime.toString(), 'YYYY-MM-DD')
        .fromNow()
        .replace(' ago', '')
        .replace(' আগে', '')
    }

    return registrant
  }

  getCertificateDetails(
    data: ICertDetails,
    intl: InjectedIntl,
    offlineResources: IOfflineDataState
  ): CertificateDetails {
    const { event } = this.props
    let names
    let eventDateTime
    if (event === Event.BIRTH) {
      names = data.child.name as ICertDetail[]
      eventDateTime = data.child.birthDate
    }
    if (event === Event.DEATH) {
      names = data.deceased.name as ICertDetail[]
      eventDateTime = data.deceased.deceased.deathDate
    }

    const NameBn = names && names.find(name => name.use === 'bn')
    const NameEn = names && names.find(name => name.use === 'en')
    moment.locale('en')
    const DOBEn = moment(eventDateTime as string).format(
      CERTIFICATE_DATE_FORMAT
    )
    moment.locale('bn')
    const DOBBn = moment(eventDateTime as string).format(
      CERTIFICATE_DATE_FORMAT
    )

    let regLocationEn = ''
    let regLocationBn = ''
    if (
      data &&
      data.registration &&
      data.registration.status &&
      data.registration.status[0] &&
      data.registration.status[0].office &&
      data.registration.status[0].office.address
    ) {
      regLocationEn = [
        data.registration.status[0].office.name as string,
        data.registration.status[0].office.address.district as string,
        data.registration.status[0].office.address.state as string
      ].join(', ') as string
      regLocationBn = data.registration.status[0].office.alias as string
    }

    let eventLocationEn = ''
    let eventLocationBn = ''

    if (
      data &&
      data.eventLocation &&
      data.eventLocation.address &&
      data.eventLocation.address.state &&
      data.eventLocation.address.district
    ) {
      if (
        data.eventLocation.type === 'HEALTH_FACILITY' &&
        data._fhirIDMap.eventLocation
      ) {
        const selectedLocation = Object.values(
          offlineResources[OFFLINE_FACILITIES_KEY]
        ).filter((location: ILocation) => {
          return location.id === data._fhirIDMap.eventLocation
        })[0]
        const partOfID = selectedLocation.partOf.split('/')[1]
        eventLocationEn = [
          renderSelectDynamicLabel(
            data._fhirIDMap.eventLocation,
            {
              resource: OFFLINE_FACILITIES_KEY,
              dependency: 'placeOfBirth'
            },
            {},
            intl,
            offlineResources,
            'en'
          ),
          renderSelectDynamicLabel(
            partOfID,
            {
              resource: OFFLINE_LOCATIONS_KEY,
              dependency: 'district'
            },
            {},
            intl,
            offlineResources,
            'en'
          )
        ].join()
        eventLocationBn = [
          renderSelectDynamicLabel(
            data._fhirIDMap.eventLocation,
            {
              resource: OFFLINE_FACILITIES_KEY,
              dependency: 'placeOfBirth'
            },
            {},
            intl,
            offlineResources,
            'bn'
          ),
          renderSelectDynamicLabel(
            partOfID,
            {
              resource: OFFLINE_LOCATIONS_KEY,
              dependency: 'district'
            },
            {},
            intl,
            offlineResources,
            'bn'
          )
        ].join()
      } else {
        eventLocationEn = [
          `${renderSelectDynamicLabel(
            data.eventLocation.address.district,
            {
              resource: OFFLINE_LOCATIONS_KEY,
              dependency: 'state'
            },
            {},
            intl,
            offlineResources,
            'en'
          )} ${locationText.district.en}`,
          `${renderSelectDynamicLabel(
            data.eventLocation.address.state,
            {
              resource: OFFLINE_LOCATIONS_KEY,
              dependency: 'country'
            },
            {},
            intl,
            offlineResources,
            'en'
          )} ${locationText.state.en}`
        ].join(', ')
        eventLocationBn = [
          `${renderSelectDynamicLabel(
            data.eventLocation.address.district,
            {
              resource: OFFLINE_LOCATIONS_KEY,
              dependency: 'state'
            },
            {},
            intl,
            offlineResources,
            'bn'
          )} ${locationText.district.bn}`,
          `${renderSelectDynamicLabel(
            data.eventLocation.address.state,
            {
              resource: OFFLINE_LOCATIONS_KEY,
              dependency: 'country'
            },
            {},
            intl,
            offlineResources,
            'bn'
          )} ${locationText.state.bn}`
        ].join(', ')
      }
    }

    return {
      registrationNo: data.registration.registrationNumber as string,
      registrationLocation: {
        en: regLocationEn,
        bn: regLocationBn
      },
      eventLocation: {
        en: eventLocationEn,
        bn: eventLocationBn
      },
      name: {
        bn: NameBn ? NameBn.firstNames + ' ' + NameBn.familyName : '',
        en: NameEn ? NameEn.firstNames + ' ' + NameEn.familyName : ''
      },
      doe: {
        bn: DOBBn,
        en: DOBEn
      },
      event: this.props.event
    }
  }

  getIssuerDetails() {
    const { intl, userDetails, language } = this.props
    let fullName = ''

    if (userDetails && userDetails.name) {
      const nameObj = userDetails.name.find(
        (storedName: GQLHumanName | null) => {
          const name = storedName as GQLHumanName
          return name.use === language
        }
      ) as GQLHumanName
      fullName = `${String(nameObj.firstNames)} ${String(nameObj.familyName)}`
    }

    return {
      name: fullName,
      role:
        userDetails && userDetails.role
          ? intl.formatMessage(messages[userDetails.role])
          : '',
      issuedAt:
        userDetails &&
        userDetails.primaryOffice &&
        userDetails.primaryOffice.name
          ? userDetails.primaryOffice.name
          : ''
    }
  }

  getEventDate(data: any, event: Event) {
    switch (event) {
      case Event.BIRTH:
        return data.child.birthDate
      case Event.DEATH:
        return data.deceased.deceased.deathDate
    }
  }

  render = () => {
    const {
      event,
      intl,
      registrationId,
      collectCertificateForm,
      paymentFormSection,
      drafts: { applications: drafts },
      dispatch,
      offlineResources
    } = this.props

    const { currentForm } = this.state
    const form = this.getForm(currentForm)

    return (
      <ActionPageWrapper>
        <ActionPage
          title={intl.formatMessage(form.title)}
          backLabel={intl.formatMessage(messages.back)}
          goBack={() => {
            dispatch(goToHome())
          }}
        >
          <BodyContent>
            <QueryProvider
              event={event}
              action={Action.LOAD_CERTIFICATE_APPLICATION}
              payload={{ id: registrationId }}
            >
              <QueryContext.Consumer>
                {({ loading, error, data, dataKey }) => {
                  if (loading) {
                    return <StyledSpinner id="print-certificate-spinner" />
                  }
                  if (data) {
                    // @ts-ignore
                    const retrievedData = data[dataKey]
                    let fields = collectCertificateForm.fields
                    fields = fields.map(field => {
                      if (field && field.type === INFORMATIVE_RADIO_GROUP) {
                        if (field.dynamicInformationRetriever) {
                          field.information = field.dynamicInformationRetriever(
                            retrievedData
                          )
                        }
                      }
                      return field
                    })

                    const eventDate = this.getEventDate(retrievedData, event)

                    const paymentAmount = calculatePrice(event, eventDate)

                    moment.locale(this.props.language)
                    const eventDateDiff = moment(eventDate, 'YYYY-MM-DD')
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
                        field.initialValue = eventDateDiff.toString()
                        field.label = messages[`${event}Service`]
                      }
                    })

                    const registrant: Registrant = this.setRegistrant(
                      retrievedData
                    )

                    const certificateData = this.getCertificateDetails(
                      retrievedData,
                      intl,
                      offlineResources
                    )

                    const transData: IFormData = gqlToDraftTransformer(
                      this.props.registerForm,
                      retrievedData
                    )
                    if (
                      event === Event.BIRTH &&
                      form.fields.filter(
                        field => field.name === 'personCollectingCertificate'
                      ).length === 0 &&
                      form === collectCertificateForm
                    ) {
                      if (
                        transData.father &&
                        transData.father.fathersDetailsExist
                      ) {
                        form.fields.unshift(fatherDataExists)
                      } else {
                        form.fields.unshift(fatherDataDoesNotExist)
                      }
                    }
                    const reviewDraft = createReviewApplication(
                      registrationId,
                      transData,
                      event
                    )
                    const draftExist = !!drafts.find(
                      draft => draft.id === registrationId
                    )
                    if (!draftExist) {
                      dispatch(storeApplication(reviewDraft))
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
                    Sentry.captureException(error)

                    return (
                      <ErrorText id="print-certificate-queue-error-text">
                        {intl.formatMessage(messages.queryError)}
                      </ErrorText>
                    )
                  }
                  return JSON.stringify(data)
                }}
              </QueryContext.Consumer>
            </QueryProvider>
          </BodyContent>
        </ActionPage>
      </ActionPageWrapper>
    )
  }
}

const getEvent = (eventType: string | undefined) => {
  switch (eventType && eventType.toLowerCase()) {
    case 'birth':
    default:
      return Event.BIRTH
    case 'death':
      return Event.DEATH
  }
}

const getDraft = (
  drafts: IApplication[],
  registrationId: string,
  eventType: string
) =>
  drafts.find(draftItem => draftItem.id === registrationId) || {
    id: '',
    data: {},
    event: getEvent(eventType)
  }

const getCollectCertificateForm = (event: Event, state: IStoreState) => {
  switch (event) {
    case Event.BIRTH:
    default:
      return state.printCertificateForm.collectBirthCertificateForm
    case Event.DEATH:
      return state.printCertificateForm.collectDeathCertificateForm
  }
}

function mapStatetoProps(
  state: IStoreState,
  props: RouteComponentProps<{ registrationId: string; eventType: string }>
) {
  const { registrationId, eventType } = props.match.params

  const draft = getDraft(
    state.applicationsState.applications,
    registrationId,
    eventType
  )
  const event = getEvent(draft.event)

  return {
    event,
    registrationId,
    language: state.i18n.language,
    paymentFormSection: state.printCertificateForm.paymentForm,
    certificatePreviewFormSection:
      state.printCertificateForm.certificatePreviewForm,
    draft,
    drafts: state.applicationsState,
    registerForm: state.registerForm.registerForm[event],
    collectCertificateForm: getCollectCertificateForm(event, state),
    userDetails: getUserDetails(state),
    offlineResources: getOfflineState(state)
  }
}
export const PrintCertificateAction = connect(
  (state: IStoreState) => mapStatetoProps
)(injectIntl<IFullProps>(PrintCertificateActionComponent))
