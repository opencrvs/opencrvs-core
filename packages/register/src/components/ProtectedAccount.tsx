import * as React from 'react'
import { UserSetupPage } from '@register/views/UserSetup/UserSetupPage'
import { CreatePassword } from '@register/views/UserSetup/CreatePassword'
import { SecurityQuestion } from '@register/views/SecurityQuestion/SecurityQuestionView'
export const SCREEN_LOCK = 'screenLock'

export enum ProtectedAccoutStep {
  LANDING,
  PASSWORD,
  SECURITY_QUESTION,
  REVIEW,
  CONFIRMATION
}
export interface ISecurityQuestionAnswer {
  questionKey: string
  answer: string
}
export interface IProtectedAccountSetupData {
  userId?: string
  password?: string
  securityQuestionAnswers?: ISecurityQuestionAnswer[]
}

interface IProtectAccountState {
  currentStep: ProtectedAccoutStep
  setupData: IProtectedAccountSetupData
}

export class ProtectedAccount extends React.Component<
  {},
  IProtectAccountState
> {
  constructor(props: {}) {
    super(props)
    this.state = {
      currentStep: ProtectedAccoutStep.LANDING,
      setupData: {}
    }
    this.goToStep = this.goToStep.bind(this)
  }

  goToStep(step: ProtectedAccoutStep, data: IProtectedAccountSetupData) {
    this.setState(() => ({
      currentStep: step,
      setupData: data
    }))
  }

  render() {
    const { currentStep, setupData } = this.state
    switch (currentStep) {
      case ProtectedAccoutStep.LANDING:
        return <UserSetupPage goToStep={this.goToStep} setupData={setupData} />
      case ProtectedAccoutStep.PASSWORD:
        return <CreatePassword goToStep={this.goToStep} setupData={setupData} />
      case ProtectedAccoutStep.SECURITY_QUESTION:
        return (
          <SecurityQuestion goToStep={this.goToStep} setupData={setupData} />
        )
    }
  }
}
