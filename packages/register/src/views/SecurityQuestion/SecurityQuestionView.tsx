import * as React from 'react'
import { InjectedIntlProps, injectIntl, defineMessages } from 'react-intl'
import { connect } from 'react-redux'
import { goBack } from '@register/navigation'
import styled from 'styled-components'
import { TextInput, Select } from '@opencrvs/components/lib/forms'
import { cloneDeep, find } from 'lodash'
import { ActionPageLight } from '@opencrvs/components/lib/interface'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'

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
const QUESTION_LIST: IQuestion[] = [
  {
    label: `What is your mother's Maiden name?`,
    value: `What is your mother's Maiden name?`
  },
  {
    label: `Name of your first pet`,
    value: `Name of your first pet`
  },
  {
    label: `Where were you born?`,
    value: `Where were you born?`
  }
]

type IProps = {
  goBack: () => void
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
      questionnaire: this.preparequestionnaire(),
      refresher: Date.now(),
      showError: false
    }
  }

  preparequestionnaire = (): IQuestionnaire[] => {
    let i
    const questionnaire = []
    for (i = 0; i < VISIBLE_QUESTION; i++) {
      questionnaire.push({
        questionList: cloneDeep(QUESTION_LIST),
        selectedQuestion: EMPTY_VALUE,
        answer: EMPTY_VALUE
      })
    }
    return questionnaire
  }

  onQuestionSelect = (value: string, index: number) => {
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
      QUESTION_LIST.forEach((value: IQuestion) => {
        if (find(answeredQuestions, { value: value.value })) return
        newQuestionList.push(value)
      })

      elem.questionList = newQuestionList
    })

    this.setState(() => ({
      questionnaire,
      refresher: Date.now()
    }))
  }

  onAnswerChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const questionnaire = this.state.questionnaire
    questionnaire[index].answer = event.target.value
    this.setState({ questionnaire })
  }

  onsubmit = (
    e:
      | React.FormEvent<HTMLFormElement>
      | React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault()
    this.setState({ showError: true })
    console.log(this.state.questionnaire)
  }

  showQuestionnaire = () => {
    const { intl } = this.props
    return (
      <form onSubmit={this.onsubmit} key={this.state.refresher}>
        {this.state.questionnaire.map(
          (questionnaire: IQuestionnaire, index: number) => {
            return (
              <QuestionWrapper key={index}>
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
                    <Error>
                      {intl.formatMessage(messages.selectSecurityQuestion)}
                    </Error>
                  )}
                </Wrapper>
                <Wrapper>
                  <label>
                    Answer<Error>*</Error>
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
                      <Error>
                        {intl.formatMessage(messages.enterResponse)}
                      </Error>
                    )}
                </Wrapper>
              </QuestionWrapper>
            )
          }
        )}

        <PrimaryButton onClick={this.onsubmit}>
          {intl.formatMessage(messages.continue)}
        </PrimaryButton>
      </form>
    )
  }

  render() {
    const { intl } = this.props
    return (
      <ActionPageLight
        goBack={this.props.goBack}
        title={intl.formatMessage(messages.title)}
      >
        <H3>{intl.formatMessage(messages.heading)}</H3>
        <P>{intl.formatMessage(messages.description)}</P>
        {this.showQuestionnaire()}
      </ActionPageLight>
    )
  }
}

export const SecurityQuestion = connect(
  null,
  {
    goBack
  }
)(injectIntl(SecurityQuestionView))
