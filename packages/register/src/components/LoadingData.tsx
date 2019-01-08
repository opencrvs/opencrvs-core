import * as React from 'react'
import {
  injectIntl,
  InjectedIntlProps,
  defineMessages,
  FormattedMessage
} from 'react-intl'
import styled from 'styled-components'
import { Modal } from '@opencrvs/components/lib/interface'
import { IStoreState } from 'src/store'
import { connect } from 'react-redux'
import { Spinner } from '@opencrvs/components/lib/interface'
import { getOfflineDataLoaded } from 'src/offline/selectors'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'

const StyledModal = styled(Modal)`
  z-index: 4;
`

const StyledSpinner = styled(Spinner)`
  margin: 50px auto;
`
export const messages = defineMessages({
  loadingOfflineData: {
    id: 'app.loading.data.loadingOfflineData',
    defaultMessage:
      'We are loading some essential data, so that you can submit applications offline.  Please wait ...',
    description: 'Loading offline data modal'
  },
  offlineDataLoaded: {
    id: 'app.loading.data.offlineDataLoaded',
    defaultMessage: 'OpenCRVS is ready for use.',
    description: 'Loading successful data modal'
  },
  continueButton: {
    id: 'app.loading.data.continueButton',
    defaultMessage: 'Continue',
    description: 'Continue button text'
  }
})

interface IProps {
  show: boolean
  offlineDataLoaded: boolean
  handleClose: () => void
}

const getLoadingText = (
  loaded: boolean
): FormattedMessage.MessageDescriptor => {
  return loaded ? messages.offlineDataLoaded : messages.loadingOfflineData
}

const LoadingDataComponent = ({
  show,
  handleClose,
  offlineDataLoaded,
  intl
}: IProps & InjectedIntlProps) => {
  return (
    <StyledModal
      title={intl.formatMessage(getLoadingText(offlineDataLoaded))}
      actions={[
        <PrimaryButton
          key="offline_data"
          id="offline_data_continue"
          disabled={!offlineDataLoaded}
          onClick={handleClose}
        >
          {intl.formatMessage(messages.continueButton)}
        </PrimaryButton>
      ]}
      show={show}
      handleClose={handleClose}
    >
      {!offlineDataLoaded && <StyledSpinner id="loadingOfflineDataSpinner" />}
    </StyledModal>
  )
}

export const LoadingData = connect(
  (state: IStoreState, ownProps) => ({
    offlineDataLoaded: getOfflineDataLoaded(state)
  }),
  null
)(injectIntl<IProps>(LoadingDataComponent))
