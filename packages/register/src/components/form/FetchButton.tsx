import * as React from 'react'
import styled from '@register/styledComponents'
import { ApolloQueryResult } from 'apollo-client'
import { ApolloConsumer } from 'react-apollo'
import * as Sentry from '@sentry/browser'
import { GQLQuery } from '@opencrvs/gateway/src/graphql/schema.d'
import {
  WrappedComponentProps as IntlShapeProps,
  injectIntl,
  IntlShape
} from 'react-intl'
import { buttonMessages } from '@register/i18n/messages'
import { Spinner } from '@opencrvs/components/lib/interface'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'
import { Success, Error } from '@opencrvs/components/lib/icons'
import { IQuery } from '@opencrvs/register/src/forms'

interface IFetchButtonProps {
  id: string
  queryData?: IQuery
  label: string
  className?: string
  modalTitle: string
  successTitle: string
  errorTitle: string
  onFetch?: (response: any) => void
}

interface IFetchButtonState {
  response?: ApolloQueryResult<GQLQuery>
  error?: boolean
  success?: boolean
  loading?: boolean
  show?: boolean
}

type IFullProps = IFetchButtonProps & IntlShapeProps

const Container = styled.div`
  display: flex;
`
const Backdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(53, 73, 93, 0.78);
  z-index: 1;
  display: flex;
  justify-content: center;
  align-items: center;
`

const ModalContent = styled.div`
  width: 30vw;
  border-radius: 2px;
  background-color: ${({ theme }) => theme.colors.white};
  padding: 30px 30px 60px 30px;
  color: ${({ theme }) => theme.colors.copy};
  text-align: center;
  ${({ theme }) => theme.fonts.subtitleStyle};
  position: relative;
`

const Heading = styled.div`
  color: ${({ theme }) => theme.colors.copy};
  text-align: center;
  ${({ theme }) => theme.fonts.bodyBoldStyle};
`

const Info = styled.div`
  color: ${({ theme }) => theme.colors.copy};
  text-align: center;
  ${({ theme }) => theme.fonts.bodyStyle};
`

const StyledSpinner = styled(Spinner)`
  margin: 10px auto;
`
const StyledError = styled(Error)`
  margin: 10px auto;
`
const StyledSuccess = styled(Success)`
  margin: 10px auto;
`
const ConfirmButton = styled.a`
  margin: 10px;
  display: block;
  text-decoration: underline;
  color: ${({ theme }) => theme.colors.primary};
  cursor: pointer;
`
const StyledPrimaryButton = styled(PrimaryButton)`
  display: block;
  ${({ theme }) => {
    return `@media (min-width: ${theme.grid.breakpoints.md}px) {
      width: 515px;
    }`
  }}
`
class FetchButton extends React.Component<IFullProps, IFetchButtonState> {
  constructor(props: IFullProps) {
    super(props)
    this.state = {
      loading: false,
      error: false
    }
  }
  hideModal = () => {
    this.setState({
      show: false,
      loading: false,
      error: false,
      response: undefined
    })
  }
  performQuery = async (client: any) => {
    const { query, variables, responseTransformer } = this.props
      .queryData as IQuery
    try {
      this.setState({ show: true, loading: true, success: false, error: false })
      const response = await client.query({
        query,
        variables
      })
      this.setState({ success: true, loading: false, error: false })
      if (responseTransformer && this.props.onFetch) {
        const transformedResponse = responseTransformer(response)
        this.props.onFetch(transformedResponse)
      }
    } catch (error) {
      Sentry.captureException(error)
      this.setState({ error: true, loading: false, success: false })
    }
  }

  getModalInfo = (intl: IntlShape) => {
    const { variables, modalInfoText } = this.props.queryData as IQuery
    return (
      <>
        {modalInfoText && <Info>{intl.formatMessage(modalInfoText)}</Info>}
        {variables && <Info>{Object.values(variables)}</Info>}
      </>
    )
  }

  render() {
    const {
      intl,
      label,
      modalTitle,
      successTitle,
      errorTitle,
      queryData
    } = this.props
    const { loading, error, success, show } = this.state

    return (
      <Container {...this.props}>
        <ApolloConsumer>
          {client => {
            return (
              <div>
                <StyledPrimaryButton
                  disabled={!navigator.onLine}
                  onClick={async (event: React.MouseEvent<HTMLElement>) => {
                    this.performQuery(client)
                    event.preventDefault()
                  }}
                >
                  {label}
                </StyledPrimaryButton>
                {show && (
                  <Backdrop>
                    <ModalContent>
                      {success && (
                        <>
                          <Heading>{successTitle}</Heading>
                          {this.getModalInfo(intl)}
                          <StyledSuccess id="loader-button-success" />
                        </>
                      )}
                      {error && (
                        <>
                          <Heading>{errorTitle}</Heading>
                          {this.getModalInfo(intl)}
                          <StyledError id="loader-button-error" />
                          {queryData && (
                            <Info>
                              {intl.formatMessage(queryData.errorText)}
                            </Info>
                          )}
                        </>
                      )}

                      {loading && (
                        <>
                          <Heading>{modalTitle}</Heading>
                          {this.getModalInfo(intl)}
                          <StyledSpinner id="loader-button-spinner" />
                          <ConfirmButton onClick={this.hideModal}>
                            {intl.formatMessage(buttonMessages.cancel)}
                          </ConfirmButton>
                        </>
                      )}

                      {!loading && (
                        <ConfirmButton onClick={this.hideModal}>
                          {intl.formatMessage(buttonMessages.back)}
                        </ConfirmButton>
                      )}
                    </ModalContent>
                  </Backdrop>
                )}
              </div>
            )
          }}
        </ApolloConsumer>
      </Container>
    )
  }
}

export const FetchButtonField = injectIntl<'intl', IFullProps>(FetchButton)
