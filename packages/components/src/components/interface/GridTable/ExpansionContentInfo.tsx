import * as React from 'react'
import styled from 'styled-components'
import { defineMessages, injectIntl, InjectedIntlProps } from 'react-intl'
import {
  StatusOrange,
  StatusGreen,
  StatusCollected,
  StatusRejected,
  Duplicate
} from '../../icons'
import { IDynamicValues, IExpandedContentPreference, IStatus } from './types'

const ExpansionContent = styled.div`
  background: ${({ theme }) => theme.colors.white};
  margin-bottom: 1px;
  border-top: ${({ theme }) => `2px solid ${theme.colors.placeholder}`};
`
const ExpansionContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: row;
  color: ${({ theme }) => theme.colors.copy};
  ${({ theme }) => theme.fonts.bodyStyle};
  &:last-child {
    margin-bottom: 0;
  }
`
const BoldSpan = styled.span`
  ${({ theme }) => theme.fonts.bodyBoldStyle};
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
`
const StyledLabel = styled.label`
  ${({ theme }) => theme.fonts.bodyBoldStyle};
  margin-right: 3px;
`
const StyledValue = styled.span`
  ${({ theme }) => theme.fonts.bodyStyle};
`
const Separator = styled.div`
  height: 20px;
  width: 1px;
  margin: 1px 8px;
  background: ${({ theme }) => theme.colors.placeholder};
`
const DuplicateIndicatorContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-top: 10px;
  & span {
    ${({ theme }) => theme.fonts.bodyBoldStyle};
    margin-left: 10px;
  }
`
const PaddedContent = styled.div`
  padding: 25px;
`
const BorderedPaddedContent = styled(PaddedContent)`
  border-bottom: ${({ theme }) => `2px solid ${theme.colors.seperatorBorder}`};
`
const HistoryWrapper = styled.div`
  padding: 10px 25px;
  margin: 20px 0px;
`

type IProps = InjectedIntlProps & {
  data: IDynamicValues
  preference: IExpandedContentPreference[] | undefined
}

const messages: {
  [key: string]: ReactIntl.FormattedMessage.MessageDescriptor
} = defineMessages({
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
  history = (item: IDynamicValues): JSX.Element[] | null => {
    return (
      (item.status &&
        (item.status as IStatus[]).map((status, i) => {
          const { practitionerName, practitionerRole, officeName } = status
          return (
            <HistoryWrapper key={i}>
              <ExpansionContainer>
                {this.getDeclarationStatusIcon(status.type as string)}
                <ExpansionContentContainer>
                  <LabelValue
                    label={this.props.intl.formatMessage(
                      this.getWorkflowDateLabel(status.type as string)
                    )}
                    value={status.timestamp || ''}
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
                        practitionerRole,
                        (officeName && (officeName as string)) || ''
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
        })) ||
      null
    )
  }

  renderExpansionContent = (item: IDynamicValues) => {
    const { preference } = this.props
    return (
      preference && (
        <BorderedPaddedContent>
          {preference.map((elem, index) => {
            if (elem.displayForEvents) {
              if (
                elem.displayForEvents.find(
                  event =>
                    event.toLowerCase() === (item.event as string).toLowerCase()
                )
              ) {
                return (
                  <ExpansionContainer key={index}>
                    <label>{elem.label}:</label>
                    <BoldSpan>{item[elem.key]}</BoldSpan>
                  </ExpansionContainer>
                )
              }
              return null
            }
            return (
              <ExpansionContainer key={index}>
                <label>{elem.label}:</label>
                <BoldSpan>{item[elem.key]}</BoldSpan>
              </ExpansionContainer>
            )
          })}
        </BorderedPaddedContent>
      )
    )
  }

  render() {
    const { data } = this.props
    return (
      <ExpansionContent>
        {this.renderExpansionContent(data)}
        {this.history(data)}
      </ExpansionContent>
    )
  }
}

export const ExpansionContentInfo = injectIntl(ExpansionContentComp)
