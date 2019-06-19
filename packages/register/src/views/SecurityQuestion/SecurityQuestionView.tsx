import * as React from 'react'
import { InjectedIntlProps, injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import { goBack } from '@register/navigation'
import styled from 'styled-components'
import { TextInput, Select } from '@opencrvs/components/lib/forms'
import { remove, cloneDeep } from 'lodash'
import { number, date } from 'joi'

const QUESTION_LIST = [
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
}

const QuestionWrapper = styled.div`
  margin-bottom: 66px;
`
const Label = styled.label``
const Wrapper = styled.div`
  display: flex;
  flex-flow: column;
  margin-bottom: 20px;
`
const FullWidthSelect = styled(Select)`
  width: 100%;
`
const FullWidthInput = styled(TextInput)`
  width: 100%;
`

class SecurityQuestionView extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)

    this.state = {
      questionnaire: this.preparequestionnaire(),
      refresher: Date.now()
    }
  }

  preparequestionnaire = (): IQuestionnaire[] => {
    let i
    const questionnaire = []
    for (i = 0; i < QUESTION_LIST.length; i++) {
      questionnaire.push({
        questionList: cloneDeep(QUESTION_LIST),
        selectedQuestion: '',
        answer: ''
      })
    }
    return questionnaire
  }

  onQuestionSelect = (value: string, index: number) => {
    const questionnaire = this.state.questionnaire
    questionnaire[index].selectedQuestion = value

    questionnaire.map((elem: IQuestionnaire, key: number) => {
      if (index === key) return elem
      remove(elem.questionList, { value })
      return elem
    })

    console.log(questionnaire)
    this.setState(() => ({
      questionnaire,
      refresher: Date.now()
    }))
  }

  showQuestionnaire = () => {
    return (
      <div key={this.state.refresher}>
        {this.state.questionnaire.map(
          (questionnaire: IQuestionnaire, index: number) => {
            return (
              <QuestionWrapper key={index}>
                <Wrapper>
                  <Label>Security question {index + 1}</Label>
                  <FullWidthSelect
                    id={`question-${index}`}
                    onChange={(value: string) =>
                      this.onQuestionSelect(value, index)
                    }
                    value={questionnaire.selectedQuestion}
                    options={questionnaire.questionList}
                    placeholder=""
                  />
                </Wrapper>
                <Wrapper>
                  <Label>Answer</Label>
                  <FullWidthInput />
                </Wrapper>
              </QuestionWrapper>
            )
          }
        )}
      </div>
    )
  }

  render() {
    return (
      <>
        <h3>Set your security questions</h3>
        <p>
          From the drop down lists below, select questions that can be used
          later to confirm your identity should you forget your password.
        </p>
        {this.showQuestionnaire()}
      </>
    )
  }
}

export const SecurityQuestion = connect(
  null,
  {
    goBack
  }
)(injectIntl(SecurityQuestionView))
