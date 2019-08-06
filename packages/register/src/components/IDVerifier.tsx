import * as React from 'react'
import styled from '@register/styledComponents'
import {
  SuccessButton,
  DangerButton,
  ICON_ALIGNMENT
} from '@opencrvs/components/lib/buttons'
import { Paragraph } from '@opencrvs/components/lib/typography'
import { Check, Cross } from '@opencrvs/components/lib/icons'
import { motherSection } from '@register/forms/register/fieldDefinitions/birth/mother-section'
import { applicantsSection } from '@register/forms/register/fieldDefinitions/death/application-section'
import { fatherSection } from '@register/forms/register/fieldDefinitions/birth/father-section'

interface IVerifierActionProps {
  positiveAction: {
    label: string
    handler: () => void
  }
  negativeAction: {
    label: string
    handler: () => void
  }
}

interface IIDVerifierProps {
  title: string
  event: string
  collector: string
  queryData: object
  actionProps: IVerifierActionProps
}

const Title = styled.div`
  ${({ theme }) => theme.fonts.bigBodyBoldStyle}
  margin-bottom: 32px;
`
const Content = styled.div`
  z-index: 1;
  padding: 16px 24px;
  position: relative;
  white-space: pre-wrap;
  color: ${({ theme }) => theme.colors.copy};
`
const UnderLayBackground = styled.div`
  background-color: ${({ theme }) => theme.colors.primary};
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.16;
`

const ActionContainer = styled.div`
  flex-flow: row wrap;
  margin-top: 24px;

  & > button {
    margin: 0 8px 8px 0;
  }

  & > button:last-child {
    margin-right: 0;
  }
`

const collectorSectionMap = {
  birth: {
    mother: motherSection,
    father: fatherSection
  },
  death: {
    mother: applicantsSection,
    father: applicantsSection
  }
}

class IDVerifier extends React.Component<IIDVerifierProps> {
  render() {
    const { positiveAction, negativeAction } = this.props.actionProps

    return (
      <>
        <Title>{this.props.title}</Title>
        <Content>
          <UnderLayBackground />
          <Paragraph>
            Transformed data will replace this paragraph as label value pairs
          </Paragraph>
        </Content>
        <ActionContainer>
          <SuccessButton
            id="verifyPositive"
            onClick={positiveAction.handler}
            icon={() => <Check />}
            align={ICON_ALIGNMENT.LEFT}
          >
            {positiveAction.label}
          </SuccessButton>
          <DangerButton
            id="verifyNegative"
            onClick={negativeAction.handler}
            icon={() => <Cross color="white" />}
            align={ICON_ALIGNMENT.LEFT}
          >
            {negativeAction.label}
          </DangerButton>
        </ActionContainer>
      </>
    )
  }
}

export { IDVerifier }
