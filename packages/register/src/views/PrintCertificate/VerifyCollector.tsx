import * as React from 'react'
import { connect } from 'react-redux'
import { ActionPageLight } from '@opencrvs/components/lib/interface'
import { goBack } from '@register/navigation'
import { IDVerifier } from '@register/views/PrintCertificate/IDVerifier'
import { Event } from '@register/forms'
import { RouteComponentProps } from 'react-router'
import { InjectedIntlProps, injectIntl } from 'react-intl'
import { IStoreState } from '@register/store'
import { IApplication, modifyApplication } from '@register/applications'
import { messages } from '@register/i18n/messages/views/certificate'

interface IMatchParams {
  registrationId: string
  eventType: Event
  collector: string
}

interface IStateProps {
  application: IApplication
}
interface IDispatchProps {
  goBack: typeof goBack
  modifyApplication: typeof modifyApplication
}

type IOwnProps = RouteComponentProps<IMatchParams> & InjectedIntlProps

type IFullProps = IStateProps & IDispatchProps & IOwnProps

class VerifyCollectorComponent extends React.Component<IFullProps> {
  handleVerification = (verified: boolean) => {
    const updatedApplicationData = {
      ...this.props.application.data,
      certificateCollector: {
        verified
      }
    }

    const applicationWithVerificationStatus = {
      ...this.props.application,
      data: updatedApplicationData
    }

    this.props.modifyApplication(applicationWithVerificationStatus)
  }

  render() {
    const { collector } = this.props.match.params
    const { intl, application } = this.props
    return (
      <ActionPageLight
        goBack={this.props.goBack}
        title={intl.formatMessage(messages.certificateCollectionTitle)}
      >
        <IDVerifier
          title={intl.formatMessage(messages.idCheckTitle)}
          collectorInformation={application.data[collector]}
          actionProps={{
            positiveAction: {
              label: intl.formatMessage(messages.idCheckVerify),
              handler: () => {
                this.handleVerification(true)
              }
            },
            negativeAction: {
              label: intl.formatMessage(messages.idCheckWithoutVerify),
              handler: () => {
                this.handleVerification(false)
              }
            }
          }}
        />
      </ActionPageLight>
    )
  }
}

const mapStateToProps = (
  state: IStoreState,
  ownProps: IOwnProps
): IStateProps => {
  const { registrationId } = ownProps.match.params

  const application = state.applicationsState.applications.find(
    draft => draft.id === registrationId
  ) as IApplication

  return {
    application
  }
}

export const VerifyCollector = connect(
  mapStateToProps,
  { goBack, modifyApplication }
)(injectIntl(VerifyCollectorComponent))
