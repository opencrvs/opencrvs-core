import * as React from 'react'
import styled from 'styled-components'
import { RouteComponentProps } from 'react-router'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import { getLanguage } from '@opencrvs/register/src/i18n/selectors'
import { IStoreState } from '@opencrvs/register/src/store'
import { setInitialDrafts } from 'src/drafts'
import { Spinner } from '@opencrvs/components/lib/interface'
import { getInitialDraftsLoaded } from 'src/drafts/selectors'
import { setInitialUserDetails } from 'src/profile/profileActions'
import { setOfflineData } from 'src/offline/actions'
import { getMyRecords } from 'src/records/actions'
import { getOfflineDataLoaded } from 'src/offline/selectors'

const languageFromProps = ({ language }: IPageProps) => language

const StyledPage = styled.div.attrs<IPageProps>({})`
  background: ${({ theme }) => theme.colors.background};
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  * {
    box-sizing: border-box;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: subpixel-antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  *:before,
  *:after {
    box-sizing: border-box;
  }

  @font-face {
    font-family: ${({ theme }) => theme.fonts.lightFont};
    src:
      url('/fonts/notosans-extra-light-webfont-en.ttf')
      format('truetype');
    font-weight: 300;
    font-style: normal;
  }

  @font-face {
    font-family: ${({ theme }) => theme.fonts.regularFont};
    src:
      url('/fonts/notosans-light-webfont-en.ttf')
      format('truetype');
    font-style: normal;
  }

  @font-face {
    font-family: ${({ theme }) => theme.fonts.boldFont};
    src:
      url('/fonts/notosans-regular-webfont-en.ttf')
      format('truetype');
    font-style: normal;
  }

  @font-face {
    font-family: ${({ theme }) => theme.fonts.lightFont};
    src:
      url('/fonts/notosans-extra-light-webfont-${languageFromProps}.ttf')
      format('truetype');
    font-weight: 300;
    font-style: normal;
  }

  @font-face {
    font-family: ${({ theme }) => theme.fonts.regularFont};
    src:
      url('/fonts/notosans-light-webfont-${languageFromProps}.ttf')
      format('truetype');
    font-style: normal;
  }

  @font-face {
    font-family: ${({ theme }) => theme.fonts.boldFont};
    src:
      url('/fonts/notosans-regular-webfont-${languageFromProps}.ttf')
      format('truetype');
    font-style: normal;
  }
`

const StyledSpinner = styled(Spinner)`
  position: absolute;
  top: 50%;
  left: 50%;
`

interface IPageProps {
  language?: string
  initialDraftsLoaded: boolean
  offlineDataLoaded: boolean
}

interface IDispatchProps {
  setInitialDrafts: () => void
  setInitialUserDetails: () => void
  setOfflineData: () => void
  getMyRecords: () => void
}
interface IState {
  loadingDataModal: boolean
}

class Component extends React.Component<
  RouteComponentProps<{}> & IPageProps & IDispatchProps,
  IState
> {
  constructor(props: RouteComponentProps<{}> & IPageProps & IDispatchProps) {
    super(props)
    this.state = {
      loadingDataModal: false
    }
  }
  componentWillReceiveProps(nextProps: RouteComponentProps<{}>) {
    const { hash } = nextProps.location
    const hashChanged = hash && hash !== this.props.location.hash
    if (hashChanged) {
      // Push onto callback queue so it runs after the DOM is updated,
      // this is required when navigating from a different page so that
      // the element is rendered on the page before trying to getElementById.
      setTimeout(() => {
        const id = hash.replace('#', '')
        const element = document.getElementById(id)
        if (element) {
          element.scrollIntoView()
        }
      }, 0)
    }
  }

  componentDidMount() {
    this.props.setInitialDrafts()
    this.props.setInitialUserDetails()
    this.props.setOfflineData()
    this.props.getMyRecords()
  }

  closeLoadingModal = () => {
    this.setState(state => ({
      loadingDataModal: false
    }))
  }
  render() {
    const { initialDraftsLoaded, offlineDataLoaded, children } = this.props

    if (initialDraftsLoaded && offlineDataLoaded) {
      return (
        <div>
          <StyledPage {...this.props}>{children}</StyledPage>
        </div>
      )
    } else {
      return <StyledSpinner id="appSpinner" />
    }
  }
}

const mapStateToProps = (store: IStoreState): IPageProps => {
  return {
    language: getLanguage(store),
    initialDraftsLoaded: getInitialDraftsLoaded(store),
    offlineDataLoaded: getOfflineDataLoaded(store)
  }
}

const mapDispatchToProps = {
  setInitialDrafts,
  setInitialUserDetails,
  setOfflineData,
  getMyRecords
}

export const Page = withRouter(
  connect<IPageProps, IDispatchProps>(
    mapStateToProps,
    mapDispatchToProps
  )(Component)
)
