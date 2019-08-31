import * as React from 'react'
import styled from '@register/styledComponents'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import { countries } from '@register/forms/countries'
import { identityNameMapper } from '@register/forms/identity'
import { formatLongDate } from '@register/utils/date-formatting'
import { messages } from '@register/i18n/messages/views/certificate'

const Wrapper = styled.div`
  width: 100%;
  color: rgb(53, 73, 93);
`

const Label = styled.span`
  ${({ theme }) => theme.fonts.bodyStyle};
`

const Text = styled.strong`
  margin-left: 10px;
  ${({ theme }) => theme.fonts.bodyStyle};
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

function ParentDetailsComponent({
  intl,
  information
}: IProps & IntlShapeProps) {
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
      <Text>
        {information.birthDate &&
          formatLongDate(information.birthDate, intl.locale)}
      </Text>
      <br />
      <Label>{intl.formatMessage(messages.nationality)}:</Label>
      <Text>{i18nNationality}</Text>
      <br />
      <Label>{intl.formatMessage(messages.typeOfID)}:</Label>
      <Text>
        {information.identifier &&
          information.identifier[0].type &&
          intl.formatMessage(
            identityNameMapper(
              information.identifier && information.identifier[0].type
            )
          )}
      </Text>
      <Divider />
      <Label>{intl.formatMessage(messages.number)}:</Label>
      <Text>{information.identifier && information.identifier[0].id}</Text>
    </Wrapper>
  )
}

export const ParentDetails = injectIntl(ParentDetailsComponent)
