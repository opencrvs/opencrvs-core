import * as React from 'react'
import { RouteComponentProps } from 'react-router'
import { InjectedIntlProps, injectIntl, defineMessages } from 'react-intl'
import styled, { withTheme } from 'styled-components'
import { Spinner } from '@opencrvs/components/lib/interface'
import {
  RegisterForm,
  IFormProps
} from '@opencrvs/register/src/views/RegisterForm/RegisterForm'
import { ITheme } from '@opencrvs/components/lib/theme'
import { IStoreState } from '@opencrvs/register/src/store'
import { connect } from 'react-redux'
import { getReviewForm } from '@opencrvs/register/src/forms/register/review-selectors'
import { REVIEW_BIRTH_PARENT_FORM_TAB } from '@opencrvs/register/src/navigation/routes'

import gql from 'graphql-tag'
import { Query } from 'react-apollo'
import {
  GQLBirthRegistration,
  GQLHumanName,
  GQLAddress,
  GQLIdentityType,
  GQLContactPoint,
  GQLRegistration,
  GQLPerson,
  GQLAttachment,
  GQLComment,
  GQLRegWorkflow
} from '@opencrvs/gateway/src/graphql/schema.d'
import {
  storeDraft,
  IDraft,
  createReviewDraft
} from '@opencrvs/register/src/drafts'
import { Dispatch } from 'redux'
import { getScope } from 'src/profile/profileSelectors'
import { Scope } from '@opencrvs/register/src/utils/authUtils'
import {
  IImage,
  documentForWhomFhirMapping,
  documentTypeFhirMapping,
  IRegistrationDetails
} from './ProcessDraftData'
import { Event } from '@opencrvs/register/src/forms'

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
        type
        trackingId
        registrationNumber
      }
      attendantAtBirth
      weightAtBirth
      birthType
      placeOfBirth {
        address {
          type
          line
          district
          state
          postalCode
          country
        }
      }
      birthLocation
      birthLocationType
      presentAtBirthRegistration
    }
  }
`

const messages = defineMessages({
  queryError: {
    id: 'review.birthRegistration.queryError',
    defaultMessage: 'An error occurred while fetching birth registration',
    description: 'The error message shown when a query fails'
  },

  unauthorized: {
    id: 'review.error.unauthorized',
    defaultMessage: 'We are unable to display this page to you',
    description: 'The error message shown when a query fails'
  }
})
interface IReviewProps {
  theme: ITheme
  dispatch: Dispatch
  scope: Scope
}
interface IDraftProp {
  draft: IDraft | undefined
  draftId: string
}

type IProps = IReviewProps &
  IDraftProp &
  IFormProps &
  InjectedIntlProps &
  RouteComponentProps<{}>

export interface IReviewSectionDetails {
  [key: string]: any
}

const StyledSpinner = styled(Spinner)`
  margin: 50% auto;
`

const ErrorText = styled.div`
  color: ${({ theme }) => theme.colors.error};
  font-family: ${({ theme }) => theme.fonts.lightFont};
  text-align: center;
  margin-top: 100px;
`

export class ReviewFormView extends React.Component<IProps> {
  transformName = (
    names: GQLHumanName[] = [],
    person: IReviewSectionDetails
  ) => {
    names.map(name => {
      if (name.use === 'bn') {
        person.firstNames = name.firstNames
        person.familyName = name.familyName
      }
      if (name.use === 'en') {
        person.firstNamesEng = name.firstNames
        person.familyNameEng = name.familyName
      }
    })
  }

  tramsformAddress = (
    addresses: GQLAddress[],
    person: IReviewSectionDetails
  ) => {
    addresses.map(address => {
      if (address.type === 'PERMANENT') {
        person.countryPermanent = address.country
        person.statePermanent = address.state
        person.districtPermanent = address.district
        person.addressLine1Permanent = address.line && address.line[0]
        person.addressLine1CityOptionPermanent = address.line && address.line[1]
        person.addressLine2Permanent = address.line && address.line[2]
        person.addressLine3Permanent = address.line && address.line[3]
        person.addressLine3CityOptionPermanent = address.line && address.line[4]
        person.addressLine4Permanent = address.line && address.line[5]
        person.postalCodePermanent = address.line && address.postalCode
        person.postCodeCityOptionPermanent = address.line && address.postalCode
      }
      if (address.type === 'CURRENT') {
        person.country = address.country
        person.state = address.state
        person.district = address.district
        person.addressLine1 = address.line && address.line[0]
        person.addressLine1CityOption = address.line && address.line[1]
        person.addressLine2 = address.line && address.line[2]
        person.addressLine3 = address.line && address.line[3]
        person.addressLine3CityOption = address.line && address.line[4]
        person.addressLine4 = address.line && address.line[5]
        person.postalCode = address.line && address.postalCode
        person.postCodeCityOption = address.line && address.postalCode
      }
    })
  }

  transformIdentifier = (
    identifier: GQLIdentityType,
    person: IReviewSectionDetails
  ) => {
    person.iD = identifier[0].id
    person.iDType = identifier[0].type
  }

  transformChild = (reg: GQLBirthRegistration) => {
    const childDetails = {} as IReviewSectionDetails

    const child = reg.child || {}

    const childNames = child.name as GQLHumanName[]
    this.transformName(childNames, childDetails)

    childDetails.childBirthDate = child.birthDate
    childDetails.gender = child.gender
    childDetails.weightAtBirth = reg.weightAtBirth
    childDetails.attendantAtBirth = reg.attendantAtBirth
    childDetails.birthType = reg.birthType
    childDetails.hospitals = reg.birthLocation
    childDetails.placeOfBirth = reg.birthLocationType
    if (reg.placeOfBirth && reg.placeOfBirth.address) {
      childDetails.country = reg.placeOfBirth.address.country
      childDetails.state = reg.placeOfBirth.address.state
      childDetails.district = reg.placeOfBirth.address.district
      if (reg.placeOfBirth.address.line) {
        childDetails.addressLine1 = reg.placeOfBirth.address.line[0]
        childDetails.addressLine1CityOption = reg.placeOfBirth.address.line[1]
        childDetails.addressLine2 = reg.placeOfBirth.address.line[2]
        childDetails.addressLine3 = reg.placeOfBirth.address.line[3]
        childDetails.addressLine3CityOption = reg.placeOfBirth.address.line[4]
        childDetails.addressLine4 = reg.placeOfBirth.address.line[5]
      }
      childDetails.postCode = reg.placeOfBirth.address.postalCode
      childDetails.postCodeCityOption = reg.placeOfBirth.address.postalCode
    }
    if (child.id) {
      childDetails._fhirID = child.id
    }
    return childDetails
  }

  transformMother = (mother: GQLPerson | undefined) => {
    if (!mother) {
      return {}
    }
    const motherDetails = {} as IReviewSectionDetails

    const names = mother.name as GQLHumanName[]

    this.transformName(names, motherDetails)

    const identifier = mother.identifier as GQLIdentityType

    this.transformIdentifier(identifier, motherDetails)

    motherDetails.gender = mother.gender
    motherDetails.motherBirthDate = mother.birthDate
    motherDetails.dateOfMarriage = mother.dateOfMarriage
    motherDetails.maritalStatus = mother.maritalStatus
    motherDetails.educationalAttainment = mother.educationalAttainment
    motherDetails.multipleBirth = mother.multipleBirth

    const nationality = mother.nationality as string[]
    motherDetails.nationality = nationality[0]

    const addresses = mother.address as GQLAddress[]

    this.tramsformAddress(addresses, motherDetails)

    if (mother.id) {
      motherDetails._fhirID = mother.id
    }

    return motherDetails
  }

  transformFather = (father: GQLPerson | undefined) => {
    if (!father) {
      return {}
    }
    const fatherDetails = {} as IReviewSectionDetails
    fatherDetails.fathersDetailsExist = true

    const names = father.name as GQLHumanName[]

    this.transformName(names, fatherDetails)

    const identifier = father.identifier as GQLIdentityType
    this.transformIdentifier(identifier, fatherDetails)

    fatherDetails.gender = father.gender
    fatherDetails.fatherBirthDate = father.birthDate
    fatherDetails.dateOfMarriage = father.dateOfMarriage
    fatherDetails.maritalStatus = father.maritalStatus
    fatherDetails.educationalAttainment = father.educationalAttainment

    const nationality = father.nationality as string[]
    fatherDetails.nationality = nationality[0]

    const addresses = father.address as GQLAddress[]

    this.tramsformAddress(addresses, fatherDetails)

    if (father.id) {
      fatherDetails._fhirID = father.id
    }

    return fatherDetails
  }

  setMotherCurrentAddressSameAsPermanent(mother: IReviewSectionDetails) {
    mother.currentAddressSameAsPermanent =
      mother.countryPermanent === mother.country &&
      mother.statePermanent === mother.state &&
      mother.districtPermanent === mother.district &&
      mother.addressLine1Permanent === mother.addressLine1 &&
      mother.addressLine1CityOptionPermanent ===
        mother.addressLine1CityOption &&
      mother.addressLine2Permanent === mother.addressLine2 &&
      mother.addressLine3Permanent === mother.addressLine3 &&
      mother.addressLine3CityOptionPermanent ===
        mother.addressLine3CityOption &&
      mother.addressLine4Permanent === mother.addressLine4 &&
      mother.postalCodePermanent === mother.postalCode &&
      mother.postCodeCityOptionPermanent === mother.postCodeCityOption
  }

  setFatherAddressSameAsMother(
    father: IReviewSectionDetails,
    mother: IReviewSectionDetails
  ) {
    father.permanentAddressSameAsMother =
      father.countryPermanent === mother.countryPermanent &&
      father.statePermanent === mother.statePermanent &&
      father.districtPermanent === mother.districtPermanent &&
      father.addressLine1Permanent === mother.addressLine1Permanent &&
      father.addressLine1CityOptionPermanent ===
        mother.addressLine1CityOptionPermanent &&
      father.addressLine2Permanent === mother.addressLine2Permanent &&
      father.addressLine3Permanent === mother.addressLine3Permanent &&
      father.addressLine3CityOptionPermanent ===
        mother.addressLine3CityOptionPermanent &&
      father.addressLine4Permanent === mother.addressLine4Permanent &&
      father.postalCodePermanent === mother.postalCodePermanent &&
      father.postCodeCityOptionPermanent === mother.postCodeCityOptionPermanent

    father.addressSameAsMother =
      father.country === mother.country &&
      father.state === mother.state &&
      father.district === mother.district &&
      father.addressLine1 === mother.addressLine1 &&
      father.addressLine1CityOption === mother.addressLine1CityOption &&
      father.addressLine2 === mother.addressLine2 &&
      father.addressLine3 === mother.addressLine3 &&
      father.addressLine3CityOption === mother.addressLine3CityOption &&
      father.addressLine4 === mother.addressLine4 &&
      father.postalCode === mother.postalCode &&
      father.postCodeCityOption === mother.postCodeCityOption
  }

  transformRegistration = (reg: GQLBirthRegistration) => {
    const registrationDetails = {} as IReviewSectionDetails

    const registration = reg.registration as GQLRegistration
    registrationDetails.whoseContactDetails = registration.contact

    registrationDetails.presentAtBirthRegistration =
      reg.presentAtBirthRegistration

    const telecom =
      (registration.contact === 'FATHER'
        ? reg.father && (reg.father.telecom as GQLContactPoint[])
        : reg.mother && (reg.mother.telecom as GQLContactPoint[])) || []

    telecom.map(tel => {
      if (tel.system === 'phone') {
        registrationDetails.registrationPhone = tel.value
      }
    })

    const status = registration.status as GQLRegWorkflow[]
    const comments = status && (status[0].comments as GQLComment[])
    registrationDetails.commentsOrNotes = comments && comments[0].comment

    registrationDetails.trackingId = registration.trackingId
    registrationDetails.registrationNumber = registration.registrationNumber
    if (registration.id) {
      registrationDetails._fhirID = registration.id
    }

    if (registration.type && registration.type === 'BIRTH') {
      registrationDetails.type = Event.BIRTH
    }
    return registrationDetails
  }

  transformDocuments = (reg: GQLBirthRegistration) => {
    const documents = {} as IReviewSectionDetails

    const registration = reg.registration as GQLRegistration

    const attachments = (registration.attachments as GQLAttachment[]) || []

    documents.image_uploader = attachments.map(doc => {
      const title = Object.keys(documentForWhomFhirMapping).find(
        key => documentForWhomFhirMapping[key] === doc.subject
      )
      const description = Object.keys(documentTypeFhirMapping).find(
        key => documentTypeFhirMapping[key] === doc.type
      )

      const options = []
      options.push(title)
      options.push(description)

      return {
        data: doc.data,
        type: doc.contentType,
        optionValues: options,
        title,
        description
      }
    }) as IImage[]

    return documents
  }
  transformData = (reg: GQLBirthRegistration) => {
    if (!reg) {
      return {}
    }

    const child = this.transformChild(reg)
    const mother = this.transformMother(reg.mother)
    const father = this.transformFather(reg.father)

    this.setFatherAddressSameAsMother(father, mother)
    child.multipleBirth = mother.multipleBirth

    this.setMotherCurrentAddressSameAsPermanent(mother)

    const registration = this.transformRegistration(reg)

    const documents = this.transformDocuments(reg)

    const reviewData = {
      _fhirIDMap: reg._fhirIDMap,
      child,
      mother,
      father,
      documents,
      registration
    }

    return reviewData
  }
  userHasRegisterScope() {
    return this.props.scope && this.props.scope.includes('register')
  }
  render() {
    const { intl, theme, draft, draftId, dispatch } = this.props
    if (!this.userHasRegisterScope()) {
      return (
        <ErrorText id="review-unauthorized-error-text">
          {intl.formatMessage(messages.unauthorized)}
        </ErrorText>
      )
    }
    if (!draft) {
      return (
        <Query
          query={FETCH_BIRTH_REGISTRATION_QUERY}
          variables={{ id: this.props.draftId }}
        >
          {({ loading, error, data }) => {
            if (loading) {
              return (
                <StyledSpinner
                  id="review-spinner"
                  baseColor={theme.colors.background}
                />
              )
            }
            if (error) {
              return (
                <ErrorText id="review-error-text">
                  {intl.formatMessage(messages.queryError)}
                </ErrorText>
              )
            }

            const transData: IRegistrationDetails = this.transformData(
              data.fetchBirthRegistration
            )
            const eventType =
              transData.registration && transData.registration.type
            const reviewDraft = createReviewDraft(draftId, transData, eventType)
            dispatch(storeDraft(reviewDraft))

            return <RegisterForm {...this.props} draft={reviewDraft} />
          }}
        </Query>
      )
    } else {
      return <RegisterForm {...this.props} />
    }
  }
}

function mapStatetoProps(
  state: IStoreState,
  props: RouteComponentProps<{ tabId: string; draftId: string }>
) {
  const { match } = props
  const form = getReviewForm(state)

  const draft = state.drafts.drafts.find(
    ({ id, review }) => id === match.params.draftId && review === true
  )
  return {
    draft,
    scope: getScope(state),
    draftId: match.params.draftId,
    registerForm: form,
    tabRoute: REVIEW_BIRTH_PARENT_FORM_TAB
  }
}

export const ReviewForm = connect<IFormProps | IDraftProp>(mapStatetoProps)(
  injectIntl(withTheme(ReviewFormView))
)
