import * as React from 'react'
import { Query } from 'react-apollo'
import { connect } from 'react-redux'
import { COUNT_REGISTRATION_QUERY } from 'src/views/RegistrarHome/queries'
import {
  IApplication,
  modifyApplication,
  SUBMISSION_STATUS
} from './applications'
import { Action, IForm } from './forms'
import { getRegisterForm } from './forms/register/application-selectors'
import { IStoreState } from './store'
import {
  MutationContext,
  MutationProvider
} from './views/DataProvider/MutationProvider'

const MUTATION_READY_TO_SUBMIT = 'mutation:readyToSubmit'
const BROWSER_ONLINE = 'online'
const BROWSER_VISIBILITY = 'visibilitychange'

export const eventDispatcher = window.dispatchEvent
export const MUTATION_READY_TO_SUBMIT_EVENT = new Event(
  MUTATION_READY_TO_SUBMIT
)

interface IState {
  callGQL: boolean
}

type DispatchProps = {
  modifyApplication: typeof modifyApplication
}
type IProp = {
  applications: IApplication[]
  registerForms: Array<{ [key: string]: IForm }>
}

type FullProps = IProp & DispatchProps

class SubmissionControllerElem extends React.Component<FullProps, IState> {
  constructor(prop: FullProps) {
    super(prop)
    this.state = {
      callGQL: false
    }
    this.bindEventListener()
  }

  bindEventListener = () => {
    window.addEventListener(MUTATION_READY_TO_SUBMIT, this.readyToSubmitHandler)
    window.addEventListener(BROWSER_ONLINE, this.readyToSubmitHandler)
    window.addEventListener(BROWSER_VISIBILITY, () => {
      if (document.visibilityState === 'visible') {
        this.readyToSubmitHandler()
      }
    })
  }

  readyToSubmitHandler = () => {
    if (!navigator.onLine) {
      return
    }
    this.setState({ callGQL: true })
  }

  onSuccess = (application: IApplication) => {
    console.log('Success')
    // application.submissionStatus =
    //   SUBMISSION_STATUS[SUBMISSION_STATUS.SUBMITTED]
    // this.props.modifyApplication(application)
  }

  onError = (application: IApplication) => {
    console.log('Error')
    // application.submissionStatus = SUBMISSION_STATUS[SUBMISSION_STATUS.FAILED]
    // this.props.modifyApplication(application)
  }

  callQuery = () => {
    console.log(this.props.applications)
    console.log(this.props.registerForms)

    const LocationIDS = [
      '43ac3486-7df1-4bd9-9b5e-728054ccd6ba',
      '43ac3486-7df1-4bd9-9b5e-728054ccd6bb',
      '43ac3486-7df1-4bd9-9b5e-728054ccd6bc',
      '43ac3486-7df1-4bd9-9b5e-728054ccd6bd'
    ]
    return LocationIDS.map((location, index) => {
      return (
        <Query
          key={index}
          query={COUNT_REGISTRATION_QUERY}
          variables={{
            locationIds: [location]
          }}
          onCompleted={this.onSuccess}
          onError={() => console.log('ERROR DURING QUERY CALL')}
          children={() => null}
        />
      )
    })
  }

  callMutation = () => {
    const { applications, registerForms } = this.props
    const readyForSubmitApplications = applications.filter(
      app => app.submissionStatus === SUBMISSION_STATUS.READY_TO_SUBMIT
    )

    return readyForSubmitApplications.map((application, index) => {
      return (
        <MutationProvider
          key={index}
          event={application.event}
          form={registerForms[application.event]}
          action={Action.REGISTER_APPLICATION}
          application={application}
          onCompleted={() => this.onSuccess(application)}
          onError={() => this.onError(application)}
        >
          <MutationContext.Consumer>
            {({ mutation }) => {
              // @ts-ignore
              mutation()
              return null
            }}
          </MutationContext.Consumer>
        </MutationProvider>
      )
    })
  }

  render() {
    return this.state.callGQL && this.callQuery()
  }
}

const mapStateToProps = (store: IStoreState) => {
  const registerForms: Array<{ [key: string]: IForm }> = []

  store.applicationsState.applications.map(application => {
    registerForms[application.event] = getRegisterForm(store)[application.event]
  })

  return {
    applications: store.applicationsState.applications,
    registerForms
  }
}

const mapDispatchToProps = {
  modifyApplication
}

export const SubmissionController = connect<IProp, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps
)(SubmissionControllerElem)
