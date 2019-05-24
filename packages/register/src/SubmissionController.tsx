import * as React from 'react'
import { connect } from 'react-redux'
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

export const MUTATION_READY_TO_SUBMIT = 'mutation:readyToSubmit'
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
  }

  componentDidMount = () => {
    this.bindEventListener()
  }

  bindEventListener = () => {
    window.addEventListener(MUTATION_READY_TO_SUBMIT, () => {
      this.readyToSubmitHandler()
    })
    window.addEventListener(BROWSER_ONLINE, () => {
      this.readyToSubmitHandler()
    })
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
    application.submissionStatus =
      SUBMISSION_STATUS[SUBMISSION_STATUS.SUBMITTED]
    this.props.modifyApplication(application)
  }

  onError = (application: IApplication) => {
    application.submissionStatus = SUBMISSION_STATUS[SUBMISSION_STATUS.FAILED]
    this.props.modifyApplication(application)
  }

  callMutation = () => {
    const { applications, registerForms } = this.props
    const eligibleApplications = applications.filter(
      app => app.submissionStatus === SUBMISSION_STATUS.READY_TO_SUBMIT
    )

    return (
      eligibleApplications.map((application: IApplication, key: number) => {
        return (
          application && (
            <MutationProvider
              key={key}
              event={application.event}
              form={registerForms[application.event]}
              action={Action.SUBMIT_FOR_REVIEW}
              application={application}
              onCompleted={() => this.onSuccess(application)}
              onError={() => this.onError(application)}
            >
              <MutationContext.Consumer>
                {({ mutation, loading, data }) => {
                  if (!loading && !data) {
                    // @ts-ignore
                    mutation()
                  }
                  return null
                }}
              </MutationContext.Consumer>
            </MutationProvider>
          )
        )
      }) || null
    )
  }

  render() {
    return this.state.callGQL && this.callMutation()
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
