import * as React from 'react'
import styled from '../../styled-components'
import {
  injectIntl,
  InjectedIntlProps,
  defineMessages,
  FormattedMessage
} from 'react-intl'
import { messages as identityMessages } from 'src/forms/identity'
import { countries } from 'src/forms/countries'

const messages = defineMessages({
  firstName: {
    id: 'certificate.parent.details.label.firstName',
    defaultMessage: 'First Name(s)',
    description: 'Parent first names'
  },
  familyName: {
    id: 'certificate.parent.details.label.familyName',
    defaultMessage: 'Family Name',
    description: 'Parent family name'
  },
  firstNameInEng: {
    id: 'certificate.parent.details.label.firstNameInEng',
    defaultMessage: 'First Name(s)(in english)',
    description: 'Parent first names'
  },
  familyNameInEng: {
    id: 'certificate.parent.details.label.familyNameInEng',
    defaultMessage: 'Family Name(in english)',
    description: 'Parent family name'
  },
  dateOfBirth: {
    id: 'certificate.parent.details.label.dateOfBirth',
    defaultMessage: 'Date of Birth',
    description: 'Parent Date of Birth'
  },
  nationality: {
    id: 'certificate.parent.details.label.nationality',
    defaultMessage: 'Nationality',
    description: 'Parent Nationality'
  },
  typeOfID: {
    id: 'certificate.parent.details.label.typeOfID',
    defaultMessage: 'Type of ID',
    description: 'Parent Type of ID'
  },
  number: {
    id: 'certificate.parent.details.label.number',
    defaultMessage: 'Number',
    description: 'Parent number'
  }
})

const Wrapper = styled.div`
  width: 100%;
  color: rgb(53, 73, 93);
`

const Label = styled.span`
  line-height: 29px;
  font-size: 16px;
  font-family: ${({ theme }) => theme.fonts.regularFont};
`

const Text = styled.strong`
  line-height: 29px;
  font-size: 16px;
  margin-left: 10px;
  font-family: ${({ theme }) => theme.fonts.regularFont};
`

const Divider = styled.div`
  display: inline-block;
  height: 12px;
  width: 1px;
  background: rgb(171, 171, 171);
  margin-left: 12px;
  margin-right: 12px;
`

type Name = {
  firstNames: string
  familyName: string
}
type Identifier = {
  id: string
  type: string
}
export type ParentDetails = {
  name: Name[]
  birthDate: string
  nationality: [string]
  identifier: [Identifier] | null
}

interface IProps {
  information: ParentDetails
}

export function iDType(code: string): FormattedMessage.MessageDescriptor {
  switch (code) {
    case 'NATIONAL_ID':
      return identityMessages.iDTypeNationalID
    case 'PASSPORT':
      return identityMessages.iDTypePassport
    case 'BIRTH_REGISTRATION_NUMBER':
      return identityMessages.iDTypeBRN
    case 'DEATH_REGISTRATION_NUMBER':
      return identityMessages.iDTypeDRN
    case 'REFUGEE_NUMBER':
      return identityMessages.iDTypeRefugeeNumber
    case 'ALIEN_NUMBER':
      return identityMessages.iDTypeAlienNumber
    default:
      return identityMessages.iD
  }
}

function ParentDetailsComponent({
  intl,
  information
}: IProps & InjectedIntlProps) {
  information = information || { nationality: '', name: [] }
  const nationalities = countries.filter(country =>
    information.nationality.includes(country.value)
  )
  const i18nNationality = nationalities
    .map(nationality => intl.formatMessage(nationality.label))
    .join(', ')

  return (
    <Wrapper id="parent_details">
      <Label>{intl.formatMessage(messages.firstName)}:</Label>
      <Text>{information.name[0] ? information.name[0].firstNames : ''}</Text>
      <Divider />
      <Label>{intl.formatMessage(messages.familyName)}:</Label>
      <Text>{information.name[0] ? information.name[0].familyName : ''}</Text>
      <br />
      <Label>{intl.formatMessage(messages.firstNameInEng)}:</Label>
      <Text>{information.name[1] ? information.name[1].firstNames : ''}</Text>
      <Divider />
      <Label>{intl.formatMessage(messages.familyNameInEng)}:</Label>
      <Text>{information.name[1] ? information.name[1].familyName : ''}</Text>
      <br />
      <Label>{intl.formatMessage(messages.dateOfBirth)}:</Label>
      <Text>{information.birthDate}</Text>
      <br />
      <Label>{intl.formatMessage(messages.nationality)}:</Label>
      <Text>{i18nNationality}</Text>
      <br />
      <Label>{intl.formatMessage(messages.typeOfID)}:</Label>
      <Text>
        {information.identifier &&
          information.identifier[0].type &&
          intl.formatMessage(
            iDType(information.identifier && information.identifier[0].type)
          )}
      </Text>
      <Divider />
      <Label>{intl.formatMessage(messages.number)}:</Label>
      <Text>{information.identifier && information.identifier[0].id}</Text>
    </Wrapper>
  )
}

export const ParentDetails = injectIntl(ParentDetailsComponent)
