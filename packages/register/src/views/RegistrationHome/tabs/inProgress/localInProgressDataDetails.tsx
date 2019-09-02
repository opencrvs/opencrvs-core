import { StatusProgress } from '@opencrvs/components/lib/icons'
import { IApplication, SUBMISSION_STATUS } from '@register/applications'
import { IStoreState } from '@register/store'
import { CERTIFICATE_DATE_FORMAT } from '@register/utils/constants'
import moment from 'moment'
import * as React from 'react'
import { WrappedComponentProps as IntlShapeProps, injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import styled from 'styled-components'
import {
  constantsMessages,
  dynamicConstantsMessages
} from '@register/i18n/messages'

const ExpansionContent = styled.div`
  background: ${({ theme }) => theme.colors.white};
  margin-bottom: 1px;
  border-top: ${({ theme }) => `2px solid ${theme.colors.background}`};
`
const ExpansionContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: row;
  color: ${({ theme }) => theme.colors.copy};
  ${({ theme }) => theme.fonts.bodyStyle};
  margin-bottom: 8px;
  &:last-child {
    margin-bottom: 0;
  }
`
const ExpansionContentContainer = styled.div`
  flex: 1;
  margin-left: 10px;
`
const StatusIcon = styled.div`
  margin-top: 3px;
`
const StyledLabel = styled.label`
  ${({ theme }) => theme.fonts.bodyBoldStyle};
  margin-right: 3px;
`
const StyledValue = styled.span`
  ${({ theme }) => theme.fonts.bodyStyle};
  text-transform: capitalize !important;
`
const ValueContainer = styled.div`
  display: inline-flex;
  flex-wrap: wrap;
  & span:not(:last-child) {
    border-right: 1px solid ${({ theme }) => theme.colors.placeholder};
    margin-right: 10px;
    padding-right: 10px;
  }
`
const HistoryWrapper = styled.div`
  padding: 10px 25px;
  margin: 20px 0px;
`

function LabelValue({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <StyledLabel>{label}:</StyledLabel>
      <StyledValue>{value}</StyledValue>
    </div>
  )
}

function ValuesWithSeparator(props: { strings: string[] }): JSX.Element {
  return (
    <ValueContainer>
      {props.strings.map((value, index) => (
        <span key={index}>{value}</span>
      ))}
    </ValueContainer>
  )
}

type IProps = IntlShapeProps & {
  draft: IApplication | undefined
}

class LocalInProgressDataDetailsComponent extends React.Component<IProps> {
  transformer = (draft: IApplication | undefined) => {
    return {
      draftStartedOn: draft && draft.savedOn,
      informantRelation:
        draft &&
        draft.data &&
        draft.data.registration &&
        (draft.data.registration.whoseContactDetails as string),
      informantContactNumber:
        draft &&
        draft.data &&
        draft.data.registration &&
        (draft.data.registration.registrationPhone as string)
    }
  }

  render() {
    const { intl, draft } = this.props
    const transformedData = this.transformer(draft)
    const timestamp = moment(transformedData.draftStartedOn).format(
      CERTIFICATE_DATE_FORMAT
    )
    return (
      <ExpansionContent>
        <HistoryWrapper>
          <ExpansionContainer>
            <StatusIcon>
              <StatusProgress />
            </StatusIcon>
            <ExpansionContentContainer>
              <LabelValue
                label={intl.formatMessage(
                  constantsMessages.applicationStartedOn
                )}
                value={timestamp}
              />
              <ValueContainer>
                <StyledLabel>
                  {intl.formatMessage(
                    constantsMessages.applicationInformantLabel
                  )}
                  :
                </StyledLabel>
                <ValuesWithSeparator
                  strings={[
                    (transformedData.informantRelation &&
                      intl.formatMessage(
                        dynamicConstantsMessages[
                          transformedData.informantRelation
                        ]
                      )) ||
                      '',
                    transformedData.informantContactNumber || ''
                  ]}
                />
              </ValueContainer>
            </ExpansionContentContainer>
          </ExpansionContainer>
        </HistoryWrapper>
      </ExpansionContent>
    )
  }
}

function mapStateToProps(state: IStoreState, props: { eventId: string }) {
  const { eventId } = props
  return {
    draft:
      (state.applicationsState.applications &&
        eventId &&
        state.applicationsState.applications.find(
          application =>
            application.id === eventId &&
            application.submissionStatus ===
              SUBMISSION_STATUS[SUBMISSION_STATUS.DRAFT]
        )) ||
      undefined
  }
}

export const LocalInProgressDataDetails = connect(
  mapStateToProps,
  null
)(injectIntl(LocalInProgressDataDetailsComponent))
