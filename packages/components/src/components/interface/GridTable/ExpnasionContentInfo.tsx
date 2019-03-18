import * as React from 'react'
import styled from 'styled-components'
import { defineMessages, injectIntl, InjectedIntlProps } from 'react-intl'
import { connect } from 'react-redux'
import {
  StatusOrange,
  StatusGreen,
  StatusCollected,
  StatusRejected,
  Duplicate
} from '../../icons'
import { IDynamicValues } from './types'

const ExpansionContent = styled.div`
  background: ${({ theme }) => theme.colors.white};
  margin-bottom: 1px;
`
const ExpansionContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: row;
  color: ${({ theme }) => theme.colors.copy};
  font-family: ${({ theme }) => theme.fonts.regularFont};
  &:last-child {
    margin-bottom: 0;
  }
`
const BoldSpan = styled.span`
  font-weight: bold;
  padding: 0 10px;
`
const StatusIcon = styled.div`
  margin-top: 3px;
`
const StatusIconCollected = styled.div`
  padding-left: 6px;
  margin-top: 3px;
`
const ExpansionContentContainer = styled.div`
  flex: 1;
  margin-left: 10px;
`
const ValueContainer = styled.div`
  display: inline-flex;
  flex-wrap: wrap;
  line-height: 1.3em;
`
const StyledLabel = styled.label`
  font-family: ${({ theme }) => theme.fonts.boldFont};
  margin-right: 3px;
`
const StyledValue = styled.span`
  font-family: ${({ theme }) => theme.fonts.regularFont};
`
const Separator = styled.div`
  height: 1.3em;
  width: 1px;
  margin: 1px 8px;
  background: ${({ theme }) => theme.colors.copyAlpha80};
`
const DuplicateIndicatorContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-top: 10px;
  & span {
    font-family: ${({ theme }) => theme.fonts.boldFont};
    margin-left: 10px;
  }
`
const PaddedContent = styled.div`
  padding: 25px;
`
const BorderedPaddedContent = styled(PaddedContent)`
  border-bottom: ${({ theme }) => `2px solid ${theme.colors.greyBorder}`};
`
const HistoryWrapper = styled.div`
  padding: 10px 25px;
`

type IProps = InjectedIntlProps & {
  data: IDynamicValues
}
const viewableField = ['name', 'dob', 'dod']
const messages = defineMessages({
  name: {
    id: 'register.workQueue.labels.results.name',
    defaultMessage: 'Name',
    description: 'Label for name in work queue list item'
  },
  dob: {
    id: 'register.workQueue.labels.results.dob',
    defaultMessage: 'D.o.B',
    description: 'Label for DoB in work queue list item'
  },
  dod: {
    id: 'register.workQueue.labels.results.dod',
    defaultMessage: 'D.o.D',
    description: 'Label for DoD in work queue list item'
  },
  workflowStatusDateRegistered: {
    id: 'register.workQueue.listItem.status.dateLabel.registered',
    defaultMessage: 'Registrated on',
    description:
      'Label for the workflow timestamp when the status is registered'
  },
  workflowStatusDateRejected: {
    id: 'register.workQueue.listItem.status.dateLabel.rejected',
    defaultMessage: 'Rejected on',
    description: 'Label for the workflow timestamp when the status is rejected'
  },
  workflowStatusDateCollected: {
    id: 'register.workQueue.listItem.status.dateLabel.collected',
    defaultMessage: 'Printed on',
    description: 'Label for the workflow timestamp when the status is collected'
  },
  workflowPractitionerLabel: {
    id: 'register.workQueue.listItem.status.label.byPractitioner',
    defaultMessage: 'By',
    description: 'Label for the practitioner name in workflow'
  },
  workflowStatusDateApplication: {
    id: 'register.workQueue.listItem.status.dateLabel.application',
    defaultMessage: 'Application submitted on',
    description:
      'Label for the workflow timestamp when the status is application'
  },
  listItemDuplicateLabel: {
    id: 'register.workQueue.labels.results.duplicate',
    defaultMessage: 'Possible duplicate found',
    description: 'Label for duplicate indication in work queue'
  }
})
function LabelValue({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <StyledLabel>{label}:</StyledLabel>
      <StyledValue>{value}</StyledValue>
    </div>
  )
}
function ValuesWithSeparator(props: {
  strings: string[]
  separator: React.ReactNode
}): JSX.Element {
  return (
    <ValueContainer>
      {props.strings.map((value, index) => {
        return (
          <React.Fragment key={index}>
            {value}
            {index < props.strings.length - 1 && value.length > 0
              ? props.separator
              : null}
          </React.Fragment>
        )
      })}
    </ValueContainer>
  )
}
function formatRoleCode(str: string) {
  const sections = str.split('_')
  const formattedString: string[] = []
  sections.map(section => {
    section = section.charAt(0) + section.slice(1).toLowerCase()
    formattedString.push(section)
  })

  return formattedString.join(' ')
}

export class ExpansionContentComp extends React.Component<IProps> {
  getDeclarationStatusIcon = (status: string) => {
    switch (status) {
      case 'APPLICATION':
        return (
          <StatusIcon>
            <StatusOrange />
          </StatusIcon>
        )
      case 'REGISTERED':
        return (
          <StatusIcon>
            <StatusGreen />
          </StatusIcon>
        )
      case 'REJECTED':
        return (
          <StatusIcon>
            <StatusRejected />
          </StatusIcon>
        )
      case 'CERTIFIED':
        return (
          <StatusIconCollected>
            <StatusCollected />
          </StatusIconCollected>
        )
      default:
        return (
          <StatusIcon>
            <StatusOrange />
          </StatusIcon>
        )
    }
  }
  getWorkflowDateLabel = (status: string) => {
    switch (status) {
      case 'APPLICATION':
        return messages.workflowStatusDateApplication
      case 'REGISTERED':
        return messages.workflowStatusDateRegistered
      case 'REJECTED':
        return messages.workflowStatusDateRejected
      case 'CERTIFIED':
        return messages.workflowStatusDateCollected
      default:
        return messages.workflowStatusDateApplication
    }
  }
  history = (item: IDynamicValues): JSX.Element[] => {
    return (
      item.status &&
      // @ts-ignore
      item.status.map((status, i) => {
        const { practitionerName, practitionerRole, officeName } = status
        return (
          <HistoryWrapper key={i}>
            <ExpansionContainer>
              {this.getDeclarationStatusIcon(status.type)}
              <ExpansionContentContainer>
                <LabelValue
                  label={this.props.intl.formatMessage(
                    this.getWorkflowDateLabel(status.type)
                  )}
                  value={status.timestamp}
                />
                <ValueContainer>
                  <StyledLabel>
                    {this.props.intl.formatMessage(
                      messages.workflowPractitionerLabel
                    )}
                    :
                  </StyledLabel>
                  <ValuesWithSeparator
                    strings={[
                      practitionerName,
                      formatRoleCode(practitionerRole),
                      officeName
                    ]}
                    separator={<Separator />}
                  />
                </ValueContainer>
                {item.duplicates && item.duplicates.length > 0 && (
                  <DuplicateIndicatorContainer>
                    <Duplicate />
                    <span>
                      {this.props.intl.formatMessage(
                        messages.listItemDuplicateLabel
                      )}
                    </span>
                  </DuplicateIndicatorContainer>
                )}
              </ExpansionContentContainer>
            </ExpansionContainer>
          </HistoryWrapper>
        )
      })
    )
  }

  renderExpansionContent = (item: IDynamicValues) => {
    const { intl } = this.props
    return viewableField.map((itemElem, index) => {
      return (
        itemElem in item &&
        item[itemElem] && (
          <ExpansionContainer key={index}>
            <label>{intl.formatMessage(messages[itemElem])}:</label>
            <BoldSpan>{item[itemElem]}</BoldSpan>
          </ExpansionContainer>
        )
      )
    })
  }

  render() {
    const { data } = this.props
    return (
      <ExpansionContent>
        <BorderedPaddedContent>
          {this.renderExpansionContent(data)}
        </BorderedPaddedContent>
        {this.history(data)}
      </ExpansionContent>
    )
  }
}

export const ExpansionContentInfo = connect(
  null,
  null
)(injectIntl(ExpansionContentComp))
