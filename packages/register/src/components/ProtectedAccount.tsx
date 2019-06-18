import * as React from 'react'
import { UserSetupPage } from '@register/views/UserSetup/UserSetupPage'
import { CreatePassword } from '@register/views/UserSetup/CreatePassword'
export const SCREEN_LOCK = 'screenLock'

export enum ProtectedAccoutStep {
  LANDING,
  PASSWORD,
  SECURITY_QUESTION,
  REVIEW,
  CONFIRMATION
}
interface ISecurityQuestionAnswer {
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
  constructor() {
    super({})
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
        return <UserSetupPage goToStep={this.goToStep} />
      case ProtectedAccoutStep.PASSWORD:
        return <CreatePassword goToStep={this.goToStep} setupData={setupData} />
    }
  }
}
