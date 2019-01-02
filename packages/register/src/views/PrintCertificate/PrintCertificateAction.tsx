import * as React from 'react'
import gql from 'graphql-tag'
import { Query } from 'react-apollo'
import styled from 'styled-components'
import { ActionPage, Box } from '@opencrvs/components/lib/interface'
import { Spinner } from '@opencrvs/components/lib/interface'
import { InjectedIntlProps, injectIntl, defineMessages } from 'react-intl'
import { FormFieldGenerator } from 'src/components/form'
import {
  IFormSection,
  IFormSectionData,
  INFORMATIVE_RADIO_GROUP,
  SUBSECTION
} from 'src/forms'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'
import { connect } from 'react-redux'
import { IStoreState } from 'src/store'
import { hasFormError } from 'src/forms/utils'
import { calculatePrice } from './calculatePrice'

const COLLECT_CERTIFICATE = 'collectCertificate'
const PAYMENT = 'payment'

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
const ButtonContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.inputBackground};
  padding: 25px;
  margin-top: 5px;
  margin-bottom: 2px;
`
const StyledPrimaryButton = styled(PrimaryButton)`
  font-weight: 600;
`

export const FETCH_BIRTH_REGISTRATION_QUERY = gql`
  query data($id: ID!) {
    fetchBirthRegistration(id: $id) {
      id
      child {
        birthDate
      }
      mother {
        name {
          firstNames
          familyName
        }
        identifier {
          id
          type
        }
        birthDate
        nationality
      }
      father {
        name {
          firstNames
          familyName
        }
        identifier {
          id
          type
        }
        birthDate
        nationality
      }
      createdAt
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
  }
})

type State = {
  formID: string
  data: IFormSectionData
  enableConfirmButton: boolean
}

type IProps = {
  backLabel: string
  title: string
  registrationId: string
  togglePrintCertificateSection: () => void
  printCertificateFormSection: IFormSection
  paymentFormSection: IFormSection
}

type IFullProps = InjectedIntlProps & IProps

class PrintCertificateActionComponent extends React.Component<
  IFullProps,
  State
> {
  constructor(props: IFullProps) {
    super(props)
    this.state = {
      data: {},
      enableConfirmButton: false,
      formID: COLLECT_CERTIFICATE
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
    const form = this.getForm(this.state.formID)
    return documentData && !hasFormError(form.fields, documentData)
  }

  getForm = (formID: string) => {
    const { printCertificateFormSection, paymentFormSection } = this.props
    switch (formID) {
      case COLLECT_CERTIFICATE:
        return printCertificateFormSection
      case PAYMENT:
        return paymentFormSection
      default:
        throw new Error(`No form found for id ${formID}`)
    }
  }

  onConfirmForm = () => {
    const { formID } = this.state
    let destForm = COLLECT_CERTIFICATE

    switch (formID) {
      case COLLECT_CERTIFICATE:
        destForm = PAYMENT
        break
      default:
        break
    }
    this.setState({ formID: destForm })
  }

  render = () => {
    const {
      intl,
      backLabel,
      registrationId,
      togglePrintCertificateSection,
      printCertificateFormSection,
      paymentFormSection
    } = this.props

    const { enableConfirmButton, formID } = this.state
    const form = this.getForm(formID)

    return (
      <ActionPageWrapper>
        <ActionPage
          title={intl.formatMessage(form.title)}
          backLabel={backLabel}
          goBack={togglePrintCertificateSection}
        >
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
                const paymentAmountLabel = {
                  id: 'register.workQueue.print.paymentAmount',
                  defaultMessage: `\u09F3 ${paymentAmount}`,
                  description: 'The label for payment amount subsection'
                }

                paymentFormSection.fields.map(field => {
                  if (
                    field &&
                    field.type === SUBSECTION &&
                    field.name === 'paymentAmount'
                  ) {
                    field.label = paymentAmountLabel
                    field.initialValue = paymentAmount
                  }
                })
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
                    {this.state.data.personCollectingCertificate && (
                      <ButtonContainer>
                        <StyledPrimaryButton
                          id="print-confirm-button"
                          disabled={!enableConfirmButton}
                          onClick={this.onConfirmForm}
                        >
                          {intl.formatMessage(messages.confirm)}
                        </StyledPrimaryButton>
                      </ButtonContainer>
                    )}
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
        </ActionPage>
      </ActionPageWrapper>
    )
  }
}

export const PrintCertificateAction = connect((state: IStoreState) => ({
  paymentFormSection: state.printCertificateForm.paymentForm
}))(injectIntl<IFullProps>(PrintCertificateActionComponent))
