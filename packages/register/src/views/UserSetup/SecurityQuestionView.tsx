import * as React from 'react'
import { InjectedIntlProps, injectIntl, defineMessages } from 'react-intl'

import styled from 'styled-components'
import { TextInput, Select } from '@opencrvs/components/lib/forms'
import { find, at } from 'lodash'
import { ActionPageLight } from '@opencrvs/components/lib/interface'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'
import {
  QUESTION_KEYS,
  questionMessages
} from '@register/utils/userSecurityQuestions'
import {
  ProtectedAccoutStep,
  IProtectedAccountSetupData,
  ISecurityQuestionAnswer
} from '@register/components/ProtectedAccount'

const messages = defineMessages({
  title: {
    id: 'register.securityquestion.title',
    defaultMessage: 'Security questions'
  },
  heading: {
    id: 'register.securityquestion.heading',
    defaultMessage: 'Set your security questions'
  },
  description: {
    id: 'register.securityquestion.description',
    defaultMessage: `From the drop down lists below, select questions that can be used later to confirm your identity should you forget your password.`
  },
  select: {
    id: 'register.securityquestion.select',
    defaultMessage: 'Select'
  },
  selectSecurityQuestion: {
    id: 'register.securityquestion.selectSecurityQuestion',
    defaultMessage: 'Select a security question'
  },
  answer: {
    id: 'register.securityquestion.answer',
    defaultMessage: 'Answer'
  },
  enterResponse: {
    id: 'register.securityquestion.enterResponse',
    defaultMessage: 'Enter a response to your chosen security question'
  },
  continue: {
    id: 'button.continue',
    defaultMessage: 'Continue'
  },
  securityQuestionLabel: {
    id: 'register.securityquestion.securityQuestionLabel',
    defaultMessage: 'Security question {count}'
  }
})

const EMPTY_VALUE = ''
const VISIBLE_QUESTION = 3

type IProps = {
  setupData: IProtectedAccountSetupData
  goToStep: (
    step: ProtectedAccoutStep,
    data: IProtectedAccountSetupData
  ) => void
} & InjectedIntlProps

type IQuestion = {
  label: string
  value: string
}

type IQuestionnaire = {
  questionList: IQuestion[]
  selectedQuestion: string
  answer: string
}

type IState = {
  questionnaire: IQuestionnaire[]
  refresher: number
  showError: boolean
}

const H3 = styled.h3`
  ${({ theme }) => theme.fonts.bigBodyBoldStyle};
`
const P = styled.p`
  margin-bottom: 37px;
  ${({ theme }) => theme.fonts.bodyStyle};
`
const QuestionWrapper = styled.div`
  margin-bottom: 66px;
  ${({ theme }) => theme.fonts.bodyStyle};
`
const Wrapper = styled.div`
  display: flex;
  flex-flow: column;
  margin-bottom: 20px;
`
const FullWidthSelect = styled(Select)`
  width: 70%;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    width: 100%;
  }
`
const FullWidthInput = styled(TextInput)`
  width: 70%;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    width: 100%;
  }
`
const Error = styled.span`
  color: ${({ theme }) => theme.colors.error};
  ${({ theme }) => theme.fonts.captionStyle};
`

class SecurityQuestionView extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)

    this.state = {
      questionnaire: this.prepareQuestionnaire(),
      refresher: Date.now(),
      showError: false
    }
  }

  componentDidMount = () => {
    this.removeDuplicateQuestions()
  }

  getQuestionList = (): IQuestion[] => {
    const questionKeys = Object.keys(QUESTION_KEYS)
    questionKeys.splice(0, questionKeys.length / 2)
    const result: IQuestion[] = []

    questionKeys.forEach((value: string) => {
      result.push({
        value,
        label: this.props.intl.formatHTMLMessage(questionMessages[value])
      })
    })

    return result
  }

  prepareQuestionnaire = (): IQuestionnaire[] => {
    let i
    const questionnaire: IQuestionnaire[] = []
    for (i = 0; i < VISIBLE_QUESTION; i++) {
      const selectedQuestion =
        at(
          this.props,
          `setupData.securityQuestionAnswers.${i}.questionKey`
        )[0] || EMPTY_VALUE
      const selectedAnswer =
        at(this.props, `setupData.securityQuestionAnswers.${i}.answer`)[0] ||
        EMPTY_VALUE

      questionnaire.push({
        questionList: this.getQuestionList(),
        selectedQuestion: selectedQuestion,
        answer: selectedAnswer
      } as IQuestionnaire)
    }
    return questionnaire
  }

  removeDuplicateQuestions = (): void => {
    const questionnaire = this.state.questionnaire
    this.state.questionnaire.forEach(
      (iquestionnaire: IQuestionnaire, index: number) => {
        questionnaire[index].questionList = this.getQuestionList().filter(
          (question: IQuestion) => {
            return (
              iquestionnaire.selectedQuestion === question.value ||
              !find(questionnaire, { selectedQuestion: question.value })
            )
          }
        )
      }
    )

    this.setState({ questionnaire })
  }

  onQuestionSelect = (value: string, index: number): void => {
    const questionnaire = this.state.questionnaire
    questionnaire[index].selectedQuestion = value

    questionnaire.map((elem: IQuestionnaire, key: number) => {
      const answeredQuestions: IQuestion[] = []

      questionnaire.forEach((questionnaire: IQuestionnaire, nkey: number) => {
        if (
          (index === key && index === nkey) ||
          elem.selectedQuestion === questionnaire.selectedQuestion
        )
          return
        answeredQuestions.push({
          value: questionnaire.selectedQuestion,
          label: questionnaire.selectedQuestion
        })
      })

      const newQuestionList: IQuestion[] = []
      this.getQuestionList().forEach((value: IQuestion) => {
        if (find(answeredQuestions, { value: value.value })) return
        newQuestionList.push(value)
      })

      elem.questionList = newQuestionList
      return elem
    })

    this.setState(() => ({
      questionnaire,
      refresher: Date.now()
    }))
  }

  onAnswerChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    index: number
  ): void => {
    const questionnaire = this.state.questionnaire
    questionnaire[index].answer = event.target.value
    this.setState({ questionnaire })
  }

  isValidate = (): boolean => {
    let isValid = true
    this.state.questionnaire.forEach((questionnaire: IQuestionnaire) => {
      if (!questionnaire.selectedQuestion || !questionnaire.answer) {
        isValid = false
        return
      }
    })
    return isValid
  }

  prepareSetupData = (): ISecurityQuestionAnswer[] => {
    return this.state.questionnaire.map((questionnaire: IQuestionnaire) => ({
      questionKey: questionnaire.selectedQuestion,
      answer: questionnaire.answer
    }))
  }

  onsubmit = (
    e:
      | React.FormEvent<HTMLFormElement>
      | React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault()
    this.setState({ showError: true })
    this.props.setupData.securityQuestionAnswers = this.prepareSetupData()

    if (this.isValidate()) {
      this.props.goToStep(ProtectedAccoutStep.REVIEW, this.props.setupData)
    }
  }

  showQuestionnaire = () => {
    const { intl } = this.props
    return (
      <form onSubmit={this.onsubmit} key={this.state.refresher}>
        {this.state.questionnaire.map(
          (questionnaire: IQuestionnaire, index: number) => {
            return (
              <QuestionWrapper id={`question-${index}-wrapper`} key={index}>
                <Wrapper>
                  <label>
                    {intl.formatMessage(messages.securityQuestionLabel, {
                      count: index + 1
                    })}
                    <Error>*</Error>
                  </label>
                  <FullWidthSelect
                    id={`question-${index}`}
                    onChange={(value: string) =>
                      this.onQuestionSelect(value, index)
                    }
                    value={questionnaire.selectedQuestion}
                    options={questionnaire.questionList}
                    placeholder={intl.formatMessage(messages.select)}
                    error={
                      this.state.showError && !questionnaire.selectedQuestion
                    }
                    touched={this.state.showError}
                  />
                  {this.state.showError && !questionnaire.selectedQuestion && (
                    <Error id={`question-${index}-validation-message`}>
                      {intl.formatMessage(messages.selectSecurityQuestion)}
                    </Error>
                  )}
                </Wrapper>
                <Wrapper>
                  <label>
                    {intl.formatMessage(messages.answer)}
                    <Error>*</Error>
                  </label>
                  <FullWidthInput
                    id={`answer-${index}`}
                    onChange={answer => this.onAnswerChange(answer, index)}
                    value={this.state.questionnaire[index].answer}
                    error={
                      this.state.showError &&
                      !this.state.questionnaire[index].answer
                    }
                    touched={this.state.showError}
                  />
                  {this.state.showError &&
                    !this.state.questionnaire[index].answer && (
                      <Error id={`answer-${index}-validation-message`}>
                        {intl.formatMessage(messages.enterResponse)}
                      </Error>
                    )}
                </Wrapper>
              </QuestionWrapper>
            )
          }
        )}

        <PrimaryButton id="submit-security-question" onClick={this.onsubmit}>
          {intl.formatMessage(messages.continue)}
        </PrimaryButton>
      </form>
    )
  }

  render() {
    const { intl } = this.props
    return (
      <ActionPageLight
        goBack={() => {
          this.props.goToStep(
            ProtectedAccoutStep.PASSWORD,
            this.props.setupData
          )
        }}
        title={intl.formatMessage(messages.title)}
      >
        <H3>{intl.formatMessage(messages.heading)}</H3>
        <P>{intl.formatMessage(messages.description)}</P>
        {this.showQuestionnaire()}
      </ActionPageLight>
    )
  }
}

export const SecurityQuestion = injectIntl(SecurityQuestionView)
