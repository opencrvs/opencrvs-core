import * as React from 'react'
import styled from '@register/styledComponents'
import {
  SuccessButton,
  DangerButton,
  ICON_ALIGNMENT,
  TertiaryButton,
  PrimaryButton
} from '@opencrvs/components/lib/buttons'
import { Check, Cross } from '@opencrvs/components/lib/icons'
import { IFormSectionData } from '@register/forms'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import { constantsMessages, countryMessages } from '@register/i18n/messages'
import { messages as certificateMessages } from '@register/i18n/messages/views/certificate'
import { identityNameMapper } from '@register/forms/identity'
import {
  ResponsiveModal,
  LabelValuePair
} from '@opencrvs/components/lib/interface'
import { formatLongDate } from '@register/utils/date-formatting'

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
  id?: string
  title: string
  collectorInformation: IFormSectionData
  actionProps: IVerifierActionProps
}

const Title = styled.div`
  ${({ theme }) => theme.fonts.h4Style}
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
  opacity: 0.08;
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

interface IIDVerifierState {
  showPrompt: boolean
}

class IDVerifierComponent extends React.Component<
  IIDVerifierProps & IntlShapeProps,
  IIDVerifierState
> {
  state = { showPrompt: false }

  togglePrompt = () => {
    this.setState(prevState => ({ showPrompt: !prevState.showPrompt }))
  }

  getGenericCollectorInfo = (
    info: IIDVerifierProps['collectorInformation']
  ) => {
    const { locale } = this.props.intl
    const iD = info.iD || info.applicantID
    const iDType = info.iDType || info.iDTypeOther
    const firstNames =
      locale === 'en'
        ? info.firstNamesEng || info.applicantFirstNamesEng
        : info.firstNames || info.applicantFirstNames
    const familyName =
      locale === 'en'
        ? info.familyNameEng || info.applicantFamilyNameEng
        : info.familyName || info.applicantFamilyName
    const birthDate =
      info.motherBirthDate || info.fatherBirthDate || info.applicantBirthDate
    const nationality = info.nationality

    return {
      iD,
      iDType,
      firstNames,
      familyName,
      birthDate,
      nationality
    }
  }

  renderLabelValue = () => {
    const { collectorInformation, intl } = this.props
    const {
      iD,
      iDType,
      firstNames,
      familyName,
      birthDate,
      nationality
    } = this.getGenericCollectorInfo(collectorInformation)

    return (
      <>
        <LabelValuePair
          label={intl.formatMessage(constantsMessages.id)}
          value={
            intl.formatMessage(identityNameMapper(iDType as string)) +
            ' | ' +
            iD
          }
        />
        {firstNames && (
          <LabelValuePair
            label={intl.formatMessage(certificateMessages.firstName)}
            value={String(firstNames)}
          />
        )}

        <LabelValuePair
          label={intl.formatMessage(certificateMessages.familyName)}
          value={String(familyName)}
        />

        {birthDate && (
          <LabelValuePair
            label={intl.formatMessage(certificateMessages.dateOfBirth)}
            value={formatLongDate(birthDate as string, intl.locale, 'LL')}
          />
        )}

        {nationality && (
          <LabelValuePair
            label={intl.formatMessage(certificateMessages.nationality)}
            value={intl.formatMessage(countryMessages[nationality as string])}
          />
        )}
      </>
    )
  }

  render() {
    const { positiveAction, negativeAction } = this.props.actionProps
    const { showPrompt } = this.state
    const { intl, id } = this.props

    return (
      <div id={id}>
        <Title>{this.props.title}</Title>
        <Content>
          <UnderLayBackground />
          {this.renderLabelValue()}
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
            onClick={this.togglePrompt}
            icon={() => <Cross color="white" />}
            align={ICON_ALIGNMENT.LEFT}
          >
            {negativeAction.label}
          </DangerButton>
        </ActionContainer>
        <ResponsiveModal
          id="withoutVerificationPrompt"
          show={showPrompt}
          title={intl.formatMessage(certificateMessages.idCheckDialogTitle)}
          contentHeight={96}
          handleClose={this.togglePrompt}
          actions={[
            <TertiaryButton
              id="cancel"
              key="cancel"
              onClick={this.togglePrompt}
            >
              {intl.formatMessage(certificateMessages.idCheckDialogCancel)}
            </TertiaryButton>,
            <PrimaryButton
              id="send"
              key="continue"
              onClick={() => {
                this.props.actionProps.negativeAction.handler()
                this.togglePrompt()
              }}
            >
              {intl.formatMessage(certificateMessages.idCheckDialogConfirm)}
            </PrimaryButton>
          ]}
        >
          {intl.formatMessage(certificateMessages.idCheckDialogDescription)}
        </ResponsiveModal>
      </div>
    )
  }
}

export const IDVerifier = injectIntl(IDVerifierComponent)
