import * as React from 'react'
import { connect } from 'react-redux'
import { ActionPageLight, Spinner } from '@opencrvs/components/lib/interface'
import { goBack } from '@register/navigation'
import { IDVerifier } from '@register/components/IDVerifier'
import {
  QueryProvider,
  QueryContext
} from '@register/views/DataProvider/QueryProvider'
import { Action, Event } from '@register/forms'
import * as Sentry from '@sentry/browser'
import { RouteComponentProps } from 'react-router'
import { ErrorText } from '@opencrvs/components/lib/forms/ErrorText'
import { errorMessages } from '@register/i18n/messages'
import { InjectedIntlProps, injectIntl } from 'react-intl'

interface IMatchParams {
  registrationId: string
  eventType: Event
  collector: string
}

interface IDispatchProps {
  goBack: typeof goBack
}

type FullProps = RouteComponentProps<IMatchParams> &
  IDispatchProps &
  InjectedIntlProps

class VerifyCollectorComponent extends React.Component<FullProps> {
  render() {
    const { eventType, registrationId } = this.props.match.params
    const { intl } = this.props

    return (
      <ActionPageLight
        goBack={this.props.goBack}
        title="Certificate collection"
      >
        <QueryProvider
          event={eventType}
          action={Action.LOAD_CERTIFICATE_APPLICATION}
          payload={{ id: registrationId }}
        >
          <QueryContext.Consumer>
            {({ loading, error, data }) => {
              if (loading) {
                return <Spinner id="print-certificate-spinner" />
              }

              if (data) {
                return (
                  <IDVerifier
                    title="Check their proof of ID. Does it match the following details?"
                    queryData={data}
                    event="birth"
                    collector="MOTHER"
                    actionProps={{
                      positiveAction: {
                        label: 'Yes',
                        handler: () => {
                          console.log('Yes clicked')
                        }
                      },
                      negativeAction: {
                        label: 'No',
                        handler: () => {
                          console.log('No clicked')
                        }
                      }
                    }}
                  />
                )
              }
              if (error) {
                Sentry.captureException(error)

                return (
                  <ErrorText id="print-certificate-queue-error-text">
                    {intl.formatMessage(errorMessages.printQueryError)}
                  </ErrorText>
                )
              }
              return JSON.stringify(data)
            }}
          </QueryContext.Consumer>
        </QueryProvider>
      </ActionPageLight>
    )
  }
}

export const VerifyCollector = connect(
  null,
  { goBack }
)(injectIntl(VerifyCollectorComponent))
