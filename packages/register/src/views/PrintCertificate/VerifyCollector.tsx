import { ActionPageLight } from '@opencrvs/components/lib/interface'
import { IApplication, modifyApplication } from '@register/applications'
import { Event, ICertificate } from '@register/forms'
import { messages } from '@register/i18n/messages/views/certificate'
import {
  goBack,
  goToPrintCertificatePayment,
  goToReviewCertificate
} from '@register/navigation'
import { IStoreState } from '@register/store'
import { IDVerifier } from '@register/views/PrintCertificate/IDVerifier'
import * as React from 'react'
import { InjectedIntlProps, injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import { RouteComponentProps } from 'react-router'
import { getEventDate, isFreeOfCost } from './utils'

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
  goToReviewCertificate: typeof goToReviewCertificate
  goToPrintCertificatePayment: typeof goToPrintCertificatePayment
}

type IOwnProps = RouteComponentProps<IMatchParams> & InjectedIntlProps

type IFullProps = IStateProps & IDispatchProps & IOwnProps

class VerifyCollectorComponent extends React.Component<IFullProps> {
  handleVerification = () => {
    const event = this.props.application.event
    const eventDate = getEventDate(this.props.application.data, event)

    if (isFreeOfCost(event, eventDate)) {
      this.props.goToReviewCertificate(
        this.props.match.params.registrationId,
        event
      )
    } else {
      this.props.goToPrintCertificatePayment(
        this.props.match.params.registrationId,
        event
      )
    }
  }

  handleNegativeVerification = () => {
    const { application } = this.props
    const certificates =
      (application &&
        (application.data.registration.certificates as ICertificate[])) ||
      null
    const certificate: ICertificate = (certificates && certificates[0]) || {}
    this.props.modifyApplication({
      ...application,
      data: {
        ...application.data,
        registration: {
          ...application.data.registration,
          certificates: [
            {
              ...certificate,
              hasShowedVerifiedDocument: true
            }
          ]
        }
      }
    })

    this.handleVerification()
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
          id="idVerifier"
          title={intl.formatMessage(messages.idCheckTitle)}
          collectorInformation={application.data[collector]}
          actionProps={{
            positiveAction: {
              label: intl.formatMessage(messages.idCheckVerify),
              handler: this.handleVerification
            },
            negativeAction: {
              label: intl.formatMessage(messages.idCheckWithoutVerify),
              handler: this.handleNegativeVerification
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
  {
    goBack,
    modifyApplication,
    goToReviewCertificate,
    goToPrintCertificatePayment
  }
)(injectIntl(VerifyCollectorComponent))
