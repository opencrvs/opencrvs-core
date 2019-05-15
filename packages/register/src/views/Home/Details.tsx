import * as React from 'react'
import { connect } from 'react-redux'
import { RouteComponentProps } from 'react-router'
import { IDraft } from 'src/drafts'
import {
  goToTab as goToTabAction,
  goToHome as goToHomeAction
} from 'src/navigation'
import { getUserDetails } from 'src/profile/profileSelectors'
import { IStoreState } from 'src/store'
import { IUserDetails } from 'src/utils/userUtils'
import { StatusProgress } from '@opencrvs/components/lib/icons'
import { SubPage } from '@opencrvs/components/lib/interface'
import { IStatus } from '@opencrvs/components/lib/interface/GridTable/types'
import { InjectedIntlProps, injectIntl } from 'react-intl'
import { Event, IFormSectionData } from 'src/forms'
import styled from 'styled-components'

const HistoryWrapper = styled.div`
  padding: 10px 25px;
  margin: 20px 0px;
  flex: 1;
  display: flex;
  flex-direction: row;
  color: ${({ theme }) => theme.colors.copy};
  font-family: ${({ theme }) => theme.fonts.regularFont};
  &:last-child {
    margin-bottom: 0;
  }
`

interface IDetailProps {
  language: string
  applicationId: string
  draft: IDraft
  userDetails: IUserDetails
  goToTab: typeof goToTabAction
  goToHome: typeof goToHomeAction
}

const getFullName = (
  sectionData: IFormSectionData,
  language: string = 'en'
): string => {
  let fullName = ''

  if (language === 'en') {
    if (sectionData.firstNames) {
      fullName = `${sectionData.firstNamesEng as string} ${sectionData.familyNameEng as string}`
    } else {
      fullName = sectionData.familyNameEng as string
    }
  } else {
    if (sectionData.firstNames) {
      fullName = `${sectionData.firstNames as string} ${sectionData.familyName as string}`
    } else {
      fullName = sectionData.familyName as string
    }
  }
  return fullName
}

class DetailView extends React.Component<IDetailProps & InjectedIntlProps> {
  getDraftApplicantName() {
    const draft = this.props.draft
    switch (draft.event) {
      case Event.BIRTH:
        return getFullName(draft.data.child, this.props.language)
      case Event.DEATH:
        return getFullName(draft.data.deceased, this.props.language)
      default:
        return ''
    }
  }
  renderHistory(statuses: IStatus[]): JSX.Element[] | null {
    return (
      (statuses &&
        statuses.map((status, i) => {
          // const { practitionerName, practitionerRole, officeName } = status
          return (
            <HistoryWrapper key={i}>
              <StatusProgress />
            </HistoryWrapper>
          )
        })) ||
      null
    )
  }
  render() {
    const { draft, goToHome } = this.props
    return (
      draft && (
        <SubPage title={this.getDraftApplicantName()} goBack={goToHome}>
          <div>{draft.savedOn}</div>
          <div>{draft.modifiedOn}</div>
        </SubPage>
      )
    )
  }
}

function mapStateToProps(
  state: IStoreState,
  props: RouteComponentProps<{
    applicationStatus: string
    applicationId: string
  }>
) {
  const { match } = props
  return {
    language: state.i18n.language,
    userDetails: getUserDetails(state),
    applicationId: match && match.params && match.params.applicationId,
    draft:
      (state.drafts.drafts &&
        match &&
        match.params &&
        match.params.applicationId &&
        state.drafts.drafts.find(
          application => application.id === match.params.applicationId
        )) ||
      {}
  }
}

export const Details = connect(
  mapStateToProps,
  {
    gotoTab: goToTabAction,
    goToHome: goToHomeAction
  }
)(injectIntl(DetailView))
